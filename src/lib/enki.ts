import * as Discord from "discord.js"
import * as E from "./environ"
import { spawn } from "child_process"

async function askLLM(prompt: string): Promise<string> {
    // TODO (@carsonRadtke): handle the possibility of an error.
    return new Promise<string>((resolve, _) => {
        const promptProcess = spawn("echo", [prompt]);
        const modelProcess = spawn("ollama", ["run", E.OllamaModelName]);

        promptProcess.stdout.pipe(modelProcess.stdin);

        let resp: string[] = [];

        modelProcess.stdout.on('data', (data: Buffer) => {
            resp = [...resp, data.toLocaleString()];
        });

        modelProcess.stdout.on('end', () => {
            modelProcess.kill();
            resolve(resp.join("").trim());
        });

        modelProcess.on('error', (err) => {
            console.error("oh shit", err);
        });
    });
}

export async function Respond(msg: Discord.Message, prompt: string): Promise<void> {
    const reply = await askLLM(prompt);
    await msg.reply(reply);
}