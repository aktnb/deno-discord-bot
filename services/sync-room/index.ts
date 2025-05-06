import {
  ChannelType,
  OverwriteResolvable,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { db } from "../../db/index.ts";
import { asyncLock } from "../../utils/async-lock/index.ts";
import { roomsTable } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export async function syncRoom(voiceChannel: VoiceChannel) {
  if (voiceChannel.guild.afkChannelId === voiceChannel.id) {
    console.log("This is the AFK channel, skipping sync.");
    return;
  }

  const guild = voiceChannel.guild;

  const isEmpty = isVoiceChannelEmpty(voiceChannel);

  await asyncLock.acquire(voiceChannel.id, async () => {
    const room = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.voiceChannelId, voiceChannel.id));

    if (room.length === 0 || room[0].textChannelId === null) {
      if (isEmpty) {
        console.log("Voice channel is empty.");
        return;
      }
    }

    let textChannel: TextChannel | undefined = undefined;
    if (room.length > 0 && room[0].textChannelId) {
      try {
        const channel = await guild.channels.fetch(room[0].textChannelId);
        if (channel) {
          textChannel = channel as TextChannel;
        }
      } catch (_) {
        console.error("Error fetching text channel");
      }
    }

    if (!textChannel && isEmpty) {
      console.log("Voice channel is empty.");
      return;
    }

    if (!textChannel) {
      console.log(
        "Creating text channel for voice channel:",
        voiceChannel.name,
      );

      const permissionOverwrites: OverwriteResolvable[] = voiceChannel.members
        .filter((member) => member.user.bot)
        .map((member) => ({
          id: member.id,
          allow: ["ViewChannel"],
        }));
      permissionOverwrites.push({
        id: voiceChannel.guild.roles.everyone,
        deny: ["ViewChannel"],
      });
      textChannel = (await guild.channels.create({
        name: voiceChannel.name,
        topic: `Text channel for ${voiceChannel.name}`,
        type: ChannelType.GuildText,
        parent: voiceChannel.parent,
        permissionOverwrites,
      })) as TextChannel;

      try {
        await textChannel.send({
          content:
            `このチャンネルは${voiceChannel.url}専用のテキストチャンネルです.\n${voiceChannel.url}に参加しているメンバーだけがこのチャンネルを見ることができます.`,
        });
      } catch (_) {
        console.error("Error sending message to text channel:");
      }
    }

    console.log(
      `Syncing voice channel and text channel:${textChannel.name}:${guild.name}`,
    );

    await syncMember(voiceChannel, textChannel);

    if (isEmpty) {
      console.log("Deleting text channel:", textChannel.name);
      await textChannel.delete();
    }

    if (room.length === 0) {
      await db.insert(roomsTable).values({
        voiceChannelId: voiceChannel.id,
        textChannelId: isEmpty ? null : textChannel.id,
      });
    } else {
      await db
        .update(roomsTable)
        .set({ textChannelId: isEmpty ? null : textChannel.id })
        .where(eq(roomsTable.voiceChannelId, voiceChannel.id));
    }
  });
}

async function syncMember(
  voiceChannel: VoiceChannel,
  textChannel: TextChannel,
) {
  await Promise.all(
    voiceChannel.members
      .filter((m) => !m.user.bot)
      .filter((m) => !textChannel.members.has(m.id))
      .map((m) =>
        textChannel.permissionOverwrites.create(m, {
          ViewChannel: true,
          ReadMessageHistory: true,
        })
      ),
  );

  await Promise.all(
    textChannel.members
      .filter((m) => !m.user.bot)
      .filter((m) => !voiceChannel.members.has(m.id))
      .map((m) => textChannel.permissionOverwrites.delete(m)),
  );
}

function isVoiceChannelEmpty(voiceChannel: VoiceChannel) {
  return !voiceChannel.members.find((member) => !member.user.bot);
}
