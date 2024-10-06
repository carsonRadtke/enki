import * as Discord from "discord.js"
import * as E from "./environ"
import { spawn } from "child_process"

async function askLLM(prompt: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const promptProcess = spawn("echo", [prompt]);
        const modelProcess = spawn("ollama", ["run", E.OllamaModelName]);

        promptProcess.stdout.on('data', (data) => {
            modelProcess.stdin.write(data);
        });

        promptProcess.on('close', (code) => {
            if (code !== 0) {
                reject(`echo exited with code ${code}`);
            }
            modelProcess.stdin.end();
        });

        let resp: string[] = [];

        modelProcess.stdout.on('data', (data: Buffer) => {
            resp = [...resp, data.toLocaleString()];
        });

        modelProcess.on('close', (code) => {
            if (code !== 0) {
                reject(`ollama exited with code ${code}`);
            } else {
                resolve(resp.join("").trim());
            }
        })
    });
}

export async function Respond(msg: Discord.Message, prompt: string): Promise<void> {
    const reply = await askLLM(prompt);
    await msg.reply(reply);
}