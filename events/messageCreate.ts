import { Message } from "discord.js";
import { EventHandler } from "../handlers/event-handler.ts";

export class MessageCreateEvent extends EventHandler<"messageCreate"> {
  readonly name = "messageCreate";
  readonly once = false;

  execute(message: Message): void {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === "ping") {
      message.reply("Pong!");
    }
  }
}
