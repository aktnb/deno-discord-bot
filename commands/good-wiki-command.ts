import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "npm:@discordjs/builders@1.10.1";
import { CommandInteraction } from "npm:discord.js@14.18.0";
import { CommandHandler } from "../handlers/command-handler.ts";

export class GoodWikiCommand extends CommandHandler {
  override readonly name = "good-wiki";
  override readonly description =
    "Wikipediaの優良な記事をランダムで表示します。";
  override readonly builder = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  static readonly EXCELLENT_WIKI_API_URL =
    "https://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5:%E3%82%AB%E3%83%86%E3%82%B4%E3%83%AA%E5%86%85%E3%81%8A%E3%81%BE%E3%81%8B%E3%81%9B%E8%A1%A8%E7%A4%BA/%E8%89%AF%E8%B3%AA%E3%81%AA%E8%A8%98%E4%BA%8B";
  static readonly SUMMARY_ENDPOINT =
    "https://ja.wikipedia.org/api/rest_v1/page/summary/";

  override async execute(interaction: CommandInteraction): Promise<void> {
    if (interaction.user.bot) return;

    await interaction.deferReply();

    const response = await fetch(GoodWikiCommand.EXCELLENT_WIKI_API_URL);
    const title = response.url.split("/").pop()!;
    const description = await this.fetchDescription(title);
    const imageUrl = await this.fetchImage(title);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(decodeURI(title))
      .setURL(response.url)
      .setTimestamp(Date.now());
    if (imageUrl) {
      embed.setImage(imageUrl);
    }
    if (description) {
      embed.setDescription(description);
    }

    await interaction.editReply({
      content: "あなたにおすすめの**優良**な記事です！\n",
      embeds: [embed],
    });
  }

  private async fetchDescription(title: string): Promise<string> {
    const response = await fetch(GoodWikiCommand.SUMMARY_ENDPOINT + title);
    if (!response.ok) return "";
    const data = await response.json();
    return data.extract;
  }

  private async fetchImage(title: string): Promise<string> {
    const response = await fetch(GoodWikiCommand.SUMMARY_ENDPOINT + title);
    if (!response.ok) return "";
    const data = await response.json();
    return data.thumbnail?.source || "";
  }
}
