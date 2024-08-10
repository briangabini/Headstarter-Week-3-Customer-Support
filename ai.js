import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: "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",
});
async function main() {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "Explain the importance of fast language models",
            },
        ],
        model: "llama3-70b-8192",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null,
    });

    for await (const chunk of chatCompletion) {
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
}

main();
