import * as Discord from "discord.js"
import { spawn } from "child_process"

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