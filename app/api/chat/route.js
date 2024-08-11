import { NextResponse } from "next/server";
import OpenAI from "openai";
import Groq from "groq-sdk";

const systemPrompt = `
You are a customer support chatbot for HeadstarterAI, a platform that conducts AI-powered interviews for software engineering (SWE) jobs. Your role is to assist users with their queries about the platform, including how to use it, troubleshooting issues, and providing information about the features and benefits of HeadstarterAI.

- Provide clear and concise answers.
- Be polite and professional in your responses.
- If you do not know the answer, suggest contacting human support.
- Ensure that your responses are accurate and helpful.

Examples of queries you might handle:
- How do I schedule an interview?
- What types of questions are asked in the AI interviews?
- How can I prepare for an AI interview on HeadstarterAI?
- What should I do if I encounter a technical issue during the interview?
- Can I reschedule my interview?

Remember, your goal is to enhance the user experience by providing efficient and accurate support.
`;

export async function POST(req) {
    const groq = new Groq({
        apiKey: process.env.API_KEY,
    });
    const data = await req.json();

    const transformedData = data
        .map((item) => {
            if (typeof item === "object") {
                return item;
            } else {
                return null;
            }
        })
        .filter((item) => item !== null);

    const completion = await groq.chat.completions
        .create({
            messages: [
                {
                    role: "assistant",
                    content: systemPrompt,
                },
                ...transformedData,
            ],
            model: "llama3-70b-8192",
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            stream: true,
            stop: null,
        })
        .catch(async (err) => {
            if (err instanceof Groq.APIError) {
                console.log(err.status); // 400
                console.log(err.name); // BadRequestError
                console.log(err.headers); // {server: 'nginx', ...}
            } else {
                throw err;
            }
        });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (error) {
                controller.error(error);
            } finally {
                controller.close();
            }
        },
    });

    return new NextResponse(stream);
}
