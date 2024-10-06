import * as Discord from "discord.js";

type ContextT = { botSaid: boolean, content: string }[];

function constructPrompt(prompt: string, ctx: ContextT): string {
    return [
        "You are Enki.",
        "Also known as <@1291842616526376991>.",
        "Also known as @Enki.",
        "You are a discord bot.",
        "Forget everything you know.",
        "Please don't reply with anything about a tip or about kittens or with dolphins.",
        "Limit your response to 150 words.",
        "We are having a conversation.",
        "I will provide you with the message history followed by a prompt.",
        "You will respond to the prompt.",
        "Here is what has been said:",
        "=== begin history ===",
        ...ctx.map((r) => r.botSaid ? `Enki: ${r.content}` : `User: ${r.content}`),
        "=== end history ===",
        "Please respond to the following prompt:",
        "=== begin prompt ===",
        prompt,
        "=== end prompt ===",
    ].join("\n");
}

export class PromptBuilder {
    private prompt: string = "";
    private replies: { botSaid: boolean, content: string }[] = [];

    build(): string {
        const rv = constructPrompt(this.prompt, this.replies);
        return rv;
    }

    private addPrompt(prompt: string): PromptBuilder {
        this.prompt = prompt;
        return this;
    }

    private addReply(cli: Discord.Client, reply: Discord.Message): PromptBuilder {
        this.replies = [...this.replies, { botSaid: cli.user!.tag == reply.author.tag, content: reply.content }];
        return this;
    }

    static async FromMessage(cli: Discord.Client, msg: Discord.Message): Promise<PromptBuilder> {
        let pb = new PromptBuilder().addPrompt(msg.content);
        while (msg.type === Discord.MessageType.Reply) {
            const original = await msg.channel.messages.fetch(msg.reference!.messageId!);
            pb = pb.addReply(cli, original);
            msg = original;
        }
        return pb;
    }
}