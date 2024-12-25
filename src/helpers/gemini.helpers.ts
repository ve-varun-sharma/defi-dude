import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { systemPromptV1 } from '../constants/systemPrompt.constants';
import { config } from 'dotenv';
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw 'No GEMINI_API_KEY detected!';
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: systemPromptV1
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain'
};

export async function generateAiResponse(userInput: string) {
    const chatSession = model.startChat({
        generationConfig,
        // @ts-ignore
        history: []
    });

    const result = await chatSession.sendMessage(userInput);
    console.log(result.response.text());
    return result;
}
