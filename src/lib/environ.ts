import { env as E, exit } from "process"

if (E.ENKI_BOT_DISCORD_API_TOKEN === undefined) {
    console.error("ENKI_BOT_DISCORD_API_TOKEN is not defined in the environment.");
    exit(1);
}

if (E.ENKI_BOT_OLLAMA_MODEL_NAME === undefined) {
    console.log("ENKI_BOT_OLLAMA_MODEL_NAME is not defined in the environment.");
    exit(1);
}

export const DiscordAPIToken: string = E.ENKI_BOT_DISCORD_API_TOKEN;
export const OllamaModelName: string = E.ENKI_BOT_OLLAMA_MODEL_NAME;