import { Telegraf } from 'telegraf';
import { generateAiResponse } from './helpers/gemini.helpers';
import { systemPromptV1YGGGuildy } from './constants/systemPrompt.constants';
import { Content } from '@google/generative-ai';

import { config } from 'dotenv';
config();

const TELEGRAM_BOT_TOKEN_YGG_GUILDY = process.env.TELEGRAM_BOT_TOKEN_YGG_GUILDY;
if (!TELEGRAM_BOT_TOKEN_YGG_GUILDY) {
    throw 'Undetected TELEGRAM_BOT_TOKEN! Please ensure an env var for this is added.';
}

const TELEGRAM_BOT_WEBHOOK_DOMAIN = process.env.TELEGRAM_BOT_WEBHOOK_DOMAIN;
if (!TELEGRAM_BOT_WEBHOOK_DOMAIN) {
    throw 'Undetected TELEGRAM_BOT_WEBHOOK_DOMAIN! Please ensure an env var for this is added.';
}
const bot = new Telegraf(TELEGRAM_BOT_TOKEN_YGG_GUILDY);

// Mapping of user IDs to their chat histories
const userChatHistories: { [userId: string]: Content[] } = {};
// TODO: Pull chat history from telegram.

async function handleTextMessage(ctx: any) {
    const userId = ctx.message.from.id.toString();
    const userInput = ctx.message.text;

    // Initialize chat history for the user if it doesn't exist
    if (!userChatHistories[userId]) {
        userChatHistories[userId] = [];
    }
    try {
        // Send "typing..." action
        ctx.sendChatAction('typing');

        // Simulate a delay to show the typing action for a random duration between 2 to 5 seconds
        const typingDuration = Math.floor(Math.random() * 2000) + 2000;
        await new Promise((resolve) => setTimeout(resolve, typingDuration));

        const aiResponse = await generateAiResponse(systemPromptV1YGGGuildy, userInput, userChatHistories[userId]);
        ctx.reply(aiResponse);
    } catch (error) {
        console.error('Error generating AI response:', error);
        ctx.reply("Sorry, there was an error processing your request to Guildy - ya'll are wearing him out.");
    }
}
function setupBotCommands() {
    bot.start((ctx: any) => {
        ctx.reply('Welcome to  Guildy bot! Send a message to Guildy to get started!');
    });

    bot.help((ctx: any) => ctx.reply('Send me a sticker'));
    bot.on('text', handleTextMessage);
    bot.on('sticker', (ctx: any) => ctx.reply('Stickers are cool but I prefer text ;) 👍'));
}

export async function startYGGGuildyBot() {
    try {
        setupBotCommands();
        const webhookDomain = TELEGRAM_BOT_WEBHOOK_DOMAIN as string;
        const webhookPath = `/bot${TELEGRAM_BOT_TOKEN_YGG_GUILDY}` as string;
        // @ts-ignore
        bot.launch({
            webhook: {
                domain: webhookDomain,
                hookPath: webhookPath,
                port: Number(process.env.PORT) || 3000
            }
        });
        console.log('Bot is running...');
    } catch (error) {
        console.error('Failed to start the bot:', error);
    }
}
