import { CommandInteraction } from "npm:discord.js@14.18.0";
import { SlashCommandBuilder } from "npm:@discordjs/builders@1.10.1";
import { CommandHandler } from "../handlers/command-handler.ts";

export class CatCommand extends CommandHandler {
  readonly name = "cat";
  readonly description = "猫の画像を表示します。";
  readonly builder = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);
  override async execute(interaction: CommandInteraction): Promise<void> {
    if (interaction.user.bot) return;
    await interaction.deferReply();
    try {
      const response = await fetch(
        "https://api.thecatapi.com/v1/images/search"
      );
      const data = await response.json();
      const imageUrl = data[0]["url"];
      await interaction.editReply({
        content: imageUrl,
      });
      console.log("猫の画像を表示しました。");
    } catch (error) {
      console.error("猫の画像の取得に失敗しました:", error);
      await interaction.editReply({
        content: "猫の画像の取得に失敗しました。",
      });
    }
  }
}
