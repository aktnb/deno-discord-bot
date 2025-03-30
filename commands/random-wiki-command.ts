import { SlashCommandBuilder } from "npm:@discordjs/builders@1.10.1";
import { CommandInteraction, EmbedBuilder } from "npm:discord.js@14.18.0";
import { CommandHandler } from "../handlers/command-handler.ts";

export class RandomWikiCommand extends CommandHandler {
  override readonly name = "random-wiki";
  override readonly description = "Wikipediaのランダムな記事を表示します。";
  override readonly builder = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  static readonly RANDOM_WIKI_API_URL =
    "https://ja.wikipedia.org/wiki/Special:Random";
  static readonly SUMMARY_ENDPOINT =
    "https://ja.wikipedia.org/api/rest_v1/page/summary/";
  override async execute(interaction: CommandInteraction): Promise<void> {
    if (interaction.user.bot) return;

    await interaction.deferReply();

    const response = await fetch(RandomWikiCommand.RANDOM_WIKI_API_URL);
    const title = response.url.split("/").pop()!;
    const description = await this.fetchDescription(title);
    const imageUrl = await this.fetchImage(title);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
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
      content: "あなたにおすすめの**ランダム**な記事です！\n",
      embeds: [embed],
    });
  }

  private async fetchDescription(title: string): Promise<string> {
    const response = await fetch(RandomWikiCommand.SUMMARY_ENDPOINT + title);
    if (!response.ok) return "";
    const data = await response.json();
    return data.extract;
  }

  private async fetchImage(title: string): Promise<string> {
    const response = await fetch(RandomWikiCommand.SUMMARY_ENDPOINT + title);
    if (!response.ok) return "";
    const data = await response.json();
    return data.thumbnail?.source || "";
  }
}
