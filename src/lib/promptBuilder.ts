import * as Discord from "discord.js";

const Preamble: string = [
    "You are Enki.",
    "Also known as <@1291842616526376991>.",
    "Also known as @Enki",
    "You are a discord bot.",
    "Forget everything you know.",
    "Limit your response to 150 words.",
    "Please respond to the following prompt:"
].join(" ");

const Epilogue: string = [
    "By the way, there is some history to this conversation.",
    "Here is what has been said:",
].join(" ");


export class PromptBuilder {
    private prompt: string = "";
    private replies: { botSaid: boolean, content: string }[] = [];

    private buildContext(): string {
        if (this.replies.length === 0) {
            return "";
        }
        return `${Epilogue}\n` + this.replies.map((r) => r.botSaid ? `Enki: ${r.content}` : `User: ${r.content}`).join("\n");
    }

    build(): string {
        const rv: string = `${Preamble}\n${this.prompt}\n${this.buildContext()}`.trim();
        console.log(rv);
        return rv;
    }

    private addPrompt(prompt: string): PromptBuilder {
        this.prompt = prompt;
        return this;
    }

    private addReply(reply: Discord.Message): PromptBuilder {
        this.replies = [...this.replies, { botSaid: true, content: reply.content }];
        return this;
    }

    static async FromMessage(msg: Discord.Message): Promise<PromptBuilder> {
        let pb = new PromptBuilder().addPrompt(msg.content);
        while (msg.type === Discord.MessageType.Reply) {
            const original = await msg.channel.messages.fetch(msg.reference!.messageId!);
            pb = pb.addReply(original);
            msg = original;
        }
        return pb;
    }
}