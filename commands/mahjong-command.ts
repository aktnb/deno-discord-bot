import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandHandler } from "../handlers/command-handler.ts";
import { Buffer } from "node:buffer";

export default class MahjongCommand extends CommandHandler {
  override name = "mahjong";
  override description = "配牌ガチャを引きます。";
  override builder = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      // Defer the reply to give us time to fetch the image
      await interaction.deferReply();

      // Fetch the image from the API
      const response = await fetch(
        "https://mahjong-api.vercel.app/api/starting-hand",
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      // Get the image as ArrayBuffer
      const imageBuffer = await response.arrayBuffer();

      // Send the image back to Discord
      await interaction.followUp({
        files: [
          {
            name: "mahjong-hand.png",
            attachment: Buffer.from(imageBuffer),
          },
        ],
      });
    } catch (error) {
      console.error("Error in mahjong command:", error);

      // If there was an error, let the user know
      await interaction.followUp({
        content: "Failed to generate mahjong hand. Please try again later.",
        ephemeral: true,
      });
    }
  }
}
