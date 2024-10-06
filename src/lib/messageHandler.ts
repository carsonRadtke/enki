import * as Discord from "discord.js";

export function ShouldRespond(cli: Discord.Client, msg: Discord.Message): boolean {
    if (cli.user!.tag == msg.author.tag)
    {
        return false;
    }
    return msg.mentions.has(msg.client.user.id);
}