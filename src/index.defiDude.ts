import { Telegraf } from 'telegraf';
import { generateAiResponse } from './helpers/gemini.helpers';
import { systemPromptV1DefDude } from './constants/systemPrompt.constants';

import { config } from 'dotenv';
config();

const TELEGRAM_BOT_TOKEN_DEFI_DUDE = process.env.TELEGRAM_BOT_TOKEN_DEFI_DUDE;
if (!TELEGRAM_BOT_TOKEN_DEFI_DUDE) {
    throw 'Undetected TELEGRAM_BOT_TOKEN! Please ensure an env var for this is added.';
}

const TELEGRAM_BOT_WEBHOOK_DOMAIN = process.env.TELEGRAM_BOT_WEBHOOK_DOMAIN;
if (!TELEGRAM_BOT_WEBHOOK_DOMAIN) {
    throw 'Undetected TELEGRAM_BOT_WEBHOOK_DOMAIN! Please ensure an env var for this is added.';
}
const bot = new Telegraf(TELEGRAM_BOT_TOKEN_DEFI_DUDE);

async function handleTextMessage(ctx: any) {
    const userInput = ctx.message.text;
    try {
        // Send "typing..." action
        ctx.sendChatAction('typing');

        // Simulate a delay to show the typing action for a random duration between 2 to 5 seconds
        const typingDuration = Math.floor(Math.random() * 2000) + 2000;
        await new Promise((resolve) => setTimeout(resolve, typingDuration));

        const aiResponse = await generateAiResponse(systemPromptV1DefDude, userInput);
        ctx.reply(aiResponse.response.text());
    } catch (error) {
        console.error('Error generating AI response:', error);
        ctx.reply("Sorry, there was an error processing your request to DeFi Dude - ya'll are wearing him out.");
    }
}
function setupBotCommands() {
    bot.start((ctx: any) => {
        ctx.reply('Welcome to DeFiDude bot! Send a message to DeFiDude to get started!');
    });

    bot.help((ctx: any) => ctx.reply('Send me a sticker'));
    bot.on('text', handleTextMessage);
    bot.on('sticker', (ctx: any) => ctx.reply('Stickers are cool but I prefer text ;) 👍'));
}

export async function startDefiDudeBot() {
    try {
        setupBotCommands();
        const webhookDomain = TELEGRAM_BOT_WEBHOOK_DOMAIN as string;
        const webhookPath = `/bot${TELEGRAM_BOT_TOKEN_DEFI_DUDE}` as string;
        // @ts-ignore
        await bot.launch({
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
