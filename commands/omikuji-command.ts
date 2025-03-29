import {
  CommandInteraction,
  MessageFlagsBitField,
} from "npm:discord.js@14.18.0";
import { SlashCommandBuilder } from "npm:@discordjs/builders@1.10.1";
import { CommandHandler } from "../handlers/command-handler.ts";
import seedrandom from "https://cdn.skypack.dev/seedrandom";

export class OmikujiCommand extends CommandHandler {
  override readonly name = "omikuji";
  override readonly description = "おみくじを引きます。";
  override readonly builder = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  static readonly OMIKUJI: { name: string; ratio: number }[] = [
    { name: "えと吉", ratio: 1 },
    { name: "超大吉", ratio: 9 },
    { name: "大吉", ratio: 30 },
    { name: "吉", ratio: 80 },
    { name: "中吉", ratio: 80 },
    { name: "小吉", ratio: 80 },
    { name: "末吉", ratio: 80 },
    { name: "凶", ratio: 30 },
    { name: "大凶", ratio: 9 },
    { name: "戦々凶々", ratio: 1 },
  ];

  override async execute(interaction: CommandInteraction): Promise<void> {
    if (interaction.user.bot) return;
    try {
      const today = new Date()
        .toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-");
      const seed = interaction.user.id + today; // ユーザーIDと日付を組み合わせる
      const result = this.getRandomOmikuji(seed); // おみくじの結果を取得
      await interaction.reply({
        content: `あなたの今日の運勢は「${result}」です！`,
      });
      console.log("おみくじを引きました。結果:", result);
    } catch (error) {
      console.error("おみくじの取得に失敗しました:", error);
      await interaction.reply({
        content: "おみくじの取得に失敗しました。",
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }
  }

  getRandomOmikuji(seed: string): string {
    const rng = seedrandom(seed);
    const randomValue = rng() * this.getTotalRatio();
    let cumulativeRatio = 0;
    for (const omikuji of OmikujiCommand.OMIKUJI) {
      cumulativeRatio += omikuji.ratio;
      if (randomValue < cumulativeRatio) {
        return omikuji.name;
      }
    }
    throw new Error("おみくじの結果が見つかりませんでした。");
  }

  getTotalRatio(): number {
    return OmikujiCommand.OMIKUJI.reduce(
      (sum, omikuji) => sum + omikuji.ratio,
      0
    );
  }
}
