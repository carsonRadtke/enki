import * as Discord from "discord.js"
import * as H from "./lib/messageHandler"
import * as E from "./lib/environ"
import * as Enki from "./lib/enki"
import { PromptBuilder } from "./lib/promptBuilder";

// TODO (@cradtke):
//  - Q: Is it reliable to ask Enki to reply with a JSON object that makes it easier to
//       track context? Something like: { msg: string, context: string[] };
//  - Q: Is it possible to formulate the prompt so the user cannot interfere with it?

const Client = new Discord.Client({
    intents: ["DirectMessages", "GuildMessages", "Guilds", "MessageContent"],
    partials: [Discord.Partials.Message, Discord.Partials.Channel],
});

Client.on(Discord.Events.ClientReady, (cli: Discord.Client) => {
    console.info(`Connected as ${cli.user?.tag}`);
    if (cli.user !== null) {
        cli.user.setActivity("enki", { type: Discord.ActivityType.Custom, state: "Let's chat! Just mention me, @Enki." });
    }
});

Client.on(Discord.Events.MessageCreate, async (msg: Discord.Message) => {
    if (msg.channel instanceof Discord.TextChannel || msg.channel instanceof Discord.DMChannel) {
        if (H.ShouldRespond(Client, msg)) {
            await msg.channel.sendTyping();
            const pb = await PromptBuilder.FromMessage(Client, msg);
            await Enki.Respond(msg, pb.build());
        }
    }
});

Client.login(E.DiscordAPIToken);
