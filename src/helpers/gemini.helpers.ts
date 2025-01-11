import { z, ZodObject } from 'zod';
import { GoogleGenerativeAI, FunctionDeclaration, FunctionDeclarationSchema, FunctionDeclarationsTool, Content } from '@google/generative-ai';
import { config } from 'dotenv';
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw 'No GEMINI_API_KEY detected!';
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain'
};

// Utility function to convert Zod schema to JSON schema
function zodToJsonSchema(zodSchema: ZodObject<any>): any {
    const jsonSchema: any = { type: 'object', properties: {}, required: [] };
    for (const key in zodSchema.shape) {
        const zodType = zodSchema.shape[key];
        if (zodType instanceof z.ZodNumber) {
            jsonSchema.properties[key] = { type: 'number' };
        } else if (zodType instanceof z.ZodString) {
            jsonSchema.properties[key] = { type: 'string' };
        }
        jsonSchema.required.push(key);
    }
    return jsonSchema;
}

// Define the Zod schema for the parameters
const getWeatherParametersSchema = z.object({
    latitude: z.number().describe('Latitude coordinate'),
    longitude: z.number().describe('Longitude coordinate')
});

// Convert the Zod schema to a plain JSON schema
const getWeatherParametersJsonSchema = zodToJsonSchema(getWeatherParametersSchema);

// Define the function declaration
const getWeatherFunctionDeclaration: FunctionDeclaration = {
    name: 'getWeather',
    description: 'Get the current weather at a location',
    parameters: getWeatherParametersJsonSchema as unknown as FunctionDeclarationSchema
};

// Define the execute function separately
async function getWeather({ latitude, longitude }: { latitude: number; longitude: number }) {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
    );
    const weatherData = await response.json();
    return weatherData;
}

// Define the Zod schema for the getCurrentTime parameters
const getCurrentTimeParametersSchema = z.object({
    timeZone: z.string().describe('Timezone in IANA format. Example America/Bogotá, Europe/Berlin')
});

// Convert the Zod schema to a plain JSON schema
const getCurrentTimeParametersJsonSchema = zodToJsonSchema(getCurrentTimeParametersSchema);

// Define the function declaration for getCurrentTime
const getCurrentTimeFunctionDeclaration: FunctionDeclaration = {
    name: 'getCurrentTime',
    description: 'Get the current time in a specific location',
    parameters: getCurrentTimeParametersJsonSchema as unknown as FunctionDeclarationSchema
};

// Define the execute function for getCurrentTime
function getCurrentTime({ timeZone }: { timeZone: string }): string {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { timeZone });
    const time = now.toLocaleTimeString('en-US', { timeZone });
    return `${date} ${time}`;
}

// Register the functions as tools
const tools: FunctionDeclarationsTool[] = [
    {
        functionDeclarations: [getWeatherFunctionDeclaration, getCurrentTimeFunctionDeclaration]
    }
];

// Define a mapping of keywords to functions and their schemas
const functionMapping: { [key: string]: { func: Function; schema: ZodObject<any> } } = {
    weather: {
        func: getWeather,
        schema: getWeatherParametersSchema
    },
    time: {
        func: getCurrentTime,
        schema: getCurrentTimeParametersSchema
    }
};

// Extract parameters from user input based on the schema
function extractParameters(userInput: string, schema: ZodObject<any>): any {
    const params: any = {};
    const schemaKeys = Object.keys(schema.shape);
    schemaKeys.forEach((key) => {
        const regex = new RegExp(`${key}:\\s*([^,\\s]+)`, 'i');
        const match = userInput.match(regex);
        if (match) {
            params[key] = match[1];
        }
    });
    return params;
}

// Generate AI response with retry mechanism and chat history
export async function generateAiResponse(systemPrompt: string, userInput: string, chatHistory: Content[], retries = 3): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
        tools: tools // Register the tools with the AI model
    });

    const chatSession = model.startChat({
        generationConfig,
        history: chatHistory // Pass the chat history to the model
    });

    // Check if the user input matches any keyword in the function mapping
    for (const keyword in functionMapping) {
        if (userInput.toLowerCase().includes(keyword)) {
            const { func, schema } = functionMapping[keyword];
            const params = extractParameters(userInput, schema);
            const result = await func(params);
            console.log(`${keyword} Data:`, result);

            // Format the result into a readable message
            let message = '';
            if (keyword === 'weather') {
                message = `Current temperature at latitude ${params.latitude}, longitude ${params.longitude}: ${result.current.temperature_2m}°C`;
            } else if (keyword === 'time') {
                message = `Current time in ${params.timeZone}: ${result}`;
            }

            chatHistory.push({ role: 'user', parts: [{ text: userInput }] });
            chatHistory.push({ role: 'model', parts: [{ text: message }] });

            return message;
        }
    }

    try {
        const result = await chatSession.sendMessage(userInput); // Process user input
        if (result.response && result.response.text) {
            console.log(result.response.text());

            // Update chat history
            chatHistory.push({ role: 'user', parts: [{ text: userInput }] });
            chatHistory.push({ role: 'model', parts: [{ text: result.response.text() }] });
            return result.response.text();
        } else {
            console.error('No response from AI model');
            return 'Sorry, I could not process your request.';
        }
    } catch (error: any) {
        if (error.status === 429 && retries > 0) {
            console.warn(`Rate limited. Retrying after delay... (${retries} retries left)`);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
            return generateAiResponse(systemPrompt, userInput, chatHistory, retries - 1);
        } else {
            throw error;
        }
    }
}
