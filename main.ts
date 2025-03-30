import { Client, Events } from "npm:discord.js@14.18.0";
import { REST } from "npm:@discordjs/rest@2.4.3";
import { GatewayIntentBits, Routes } from "npm:discord-api-types/v10";
import "jsr:@std/dotenv/load";

import { CommandHandler } from "./handlers/command-handler.ts";

const TOKEN = Deno.env.get("DISCORD_TOKEN"); // Retrieve the token from the environment
const CLIENT_ID = Deno.env.get("DISCORD_CLIENT_ID"); // Retrieve the client ID from the environment

if (!TOKEN || !CLIENT_ID) {
  console.error("DISCORD_TOKENまたはDISCORD_CLIENT_IDが設定されていません");
  Deno.exit(1);
}

const commands = new Map<string, CommandHandler>();

async function loadCommands() {
  const commandsDir = "./commands";

  try {
    for await (const dirEntry of Deno.readDir(commandsDir)) {
      if (dirEntry.isFile && dirEntry.name.endsWith(".ts")) {
        const module = await import(`${commandsDir}/${dirEntry.name}`);

        for (const ExportedClass of Object.values(module)) {
          if (
            typeof ExportedClass === "function" &&
            ExportedClass.prototype instanceof CommandHandler
          ) {
            try {
              const commandInstance =
                new (ExportedClass as new () => CommandHandler)();
              commands.set(commandInstance.name, commandInstance);
              console.log(`コマンドを読み込みました: ${commandInstance.name}`);
            } catch (error) {
              console.error(
                `コマンドのインスタンス化に失敗しました: ${dirEntry.name}`,
                error
              );
              continue;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("コマンドの読み込みに失敗しました:", error);
  }
}

async function registerGlobalCommands() {
  const commandsData = Array.from(commands.values()).map((command) =>
    command.builder.toJSON()
  );

  const rest = new REST({ version: "10" }).setToken(TOKEN!);

  try {
    console.log("グローバルコマンドを登録しています...");
    await rest.put(Routes.applicationCommands(CLIENT_ID!), {
      body: commandsData,
    });
    console.log("グローバルコマンドの登録が完了しました。");
  } catch (error) {
    console.error("グローバルコマンドの登録に失敗しました:", error);
  }
}
// クライアントインスタンスを作成
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// クライアントの準備ができたらコンソールに出力
client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}!`);

  await loadCommands();
  console.log("コマンドの読み込みが完了しました。");

  await registerGlobalCommands(); // Register global commands
});

// メッセージに応答する
client.on(Events.InteractionCreate, (interaction) => {
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName);
    if (command) {
      command.execute(interaction);
    } else {
      interaction.reply({
        content: "そのコマンドは存在しません。",
        ephemeral: true,
      });
    }
  }
});

// ログイン
await client.login(TOKEN);
