import { VoiceChannel, VoiceState } from "discord.js";
import { EventHandler } from "../handlers/event-handler.ts";
import { syncRoom } from "../services/sync-room/index.ts";

export class VoiceStateUpdateEvent extends EventHandler<"voiceStateUpdate"> {
  readonly name = "voiceStateUpdate";
  readonly once = false;

  async execute(before: VoiceState, after: VoiceState) {
    if (before.channelId === after.channelId) {
      return;
    }
    if (before.member?.user.bot || after.member?.user.bot) {
      return;
    }
    if (before.channel instanceof VoiceChannel) {
      try {
        await syncRoom(before.channel);
      } catch (error) {
        console.error("Error syncing room:", error);
      }
    }
    if (after.channel instanceof VoiceChannel) {
      try {
        await syncRoom(after.channel);
      } catch (error) {
        console.error("Error syncing room:", error);
      }
    }
  }
}
