import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    const openai = new OpenAI();
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            ...data,
        ],
        model: 'gpt-4',
        stream: true
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
        }
    })

    return new NextResponse(stream);
}