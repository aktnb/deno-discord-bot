import { Client, GatewayIntentBits, Events } from "npm:discord.js";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const TOKEN = Deno.env.get("DISCORD_TOKEN"); // Retrieve the token from the environment

if (!TOKEN) {
  console.error("DISCORD_TOKENが設定されていません");
  Deno.exit(1);
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
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}!`);
});

// メッセージに応答する
client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    message.reply("Pong!");
  }
});

// ログイン
await client.login(TOKEN);
