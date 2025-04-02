import { ClientEvents } from "npm:discord.js@14.18.0";

export abstract class EventHandler<K extends keyof ClientEvents> {
  abstract readonly name: K;
  abstract readonly once: boolean;

  abstract execute(...args: ClientEvents[K]): Promise<void> | void;
}
