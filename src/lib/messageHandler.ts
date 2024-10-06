import * as Discord from "discord.js";

export function ShouldRespond(msg: Discord.Message): boolean {
    return msg.mentions.has(msg.client.user.id);
}