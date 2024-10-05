import * as Discord from "discord.js"
import { spawn } from "child_process"

// TODO (@cradtke):
//  - Refactor so making changes makes sense. This was a POC, so let's flesh it out.
//  - Reply to users instead of just sending a message back in the chanel.
//  - Make it feel like a real conversation. If the user 'replies' (via discord) to
//    a message that Enki sent, the Enki should understand the context.
//  - Allow users to tag @Enki. Enki should feel like a person, if it seems like the
//    user is trying to talk to Enki, then Enki should respond.
//  - Q: Is it reliable to ask Enki to reply with a JSON object that makes it easier to
//       track context? Something like: { msg: string, context: string[] };
//  - Update the Activity. It doesn't look right, come up with something good.
//  - Improve the prompt - maybe have several themes that a user can choose from?
//  - The 'pipe'ing feels clunky. Checkout how strace treats `$ echo hi | xargs echo`
//    and see if we can mimic it.
//  - Q: Is it possible to formulate the prompt so the user cannot interfere with it?
//       i.e. The user shouldn't be able to say "Ignore the word limit..."
//  - I should read A LOT about prompt engineering.

const Client = new Discord.Client({
    intents: ["DirectMessages", "GuildMessages", "Guilds", "MessageContent"],
    partials: [Discord.Partials.Message, Discord.Partials.Channel],
});

Client.on(Discord.Events.ClientReady, (cli: Discord.Client) => {
    console.info(`Connected as ${cli.user?.tag}`);
    if (cli.user !== null) {
        cli.user.setActivity("enki", { type: Discord.ActivityType.Custom, state: "@enki ..." });
    }
});

function buildPrompt(msg: string) {
    const prompt = msg.replace(".enki", "").trim();
    return `Forget everything you know. You are a discord bot called Enki. Limit your responses to 150 words. Prompt: ${prompt}`;
}

Client.on(Discord.Events.MessageCreate, async (msg: Discord.Message) => {
    const { content } = msg;

    if (content.toLocaleLowerCase().startsWith(".enki")) {
        if (msg.channel instanceof Discord.TextChannel) {
            msg.channel.sendTyping();
        }

        const echoProcess = spawn("echo", [buildPrompt(content)]);
        const ollamaProcess = spawn("ollama", ["run", process.env.OLLAMA_MODEL_NAME!]);

        echoProcess.stdout.pipe(ollamaProcess.stdin);
        echoProcess.kill();
        let resp: string[] = [];

        ollamaProcess.stdout.on('end', () => { 
            if (msg.channel instanceof Discord.TextChannel) {
                msg.channel.send(resp.join("").trim());
            }
            ollamaProcess.kill();
        });

        ollamaProcess.stdout.on("data", (data) => {
            resp = [...resp, data.toString()];
        });
    }
});

Client.login(process.env.ENKI_BOT_DISCORD_API_TOKEN);
