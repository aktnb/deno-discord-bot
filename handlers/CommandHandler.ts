import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "npm:discord.js@14.18.0";

export abstract class CommandHandler {
  //  コマンド名
  abstract readonly name: string;

  //  コマンドの説明
  abstract readonly description: string;

  //  コマンドのオプションは、SlashCommandBuilderを使用して定義する
  abstract readonly builder:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;

  // コマンド実行メソッド
  abstract execute(interaction: CommandInteraction): Promise<void>;
}
