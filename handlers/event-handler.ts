import { ClientEvents } from "discord.js";

export abstract class EventHandler<K extends keyof ClientEvents> {
  abstract readonly name: K;
  abstract readonly once: boolean;

  abstract execute(...args: ClientEvents[K]): Promise<void> | void;
}
