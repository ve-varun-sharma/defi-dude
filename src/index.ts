import { Telegraf } from 'telegraf';
import { generateAiResponse } from './helpers/gemini.helpers';
import { config } from 'dotenv';
config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_BOT_TOKEN) {
    throw 'Undetected TELEGRAM_BOT_TOKEN! Please ensure an env var for this is added.';
}

const TELEGRAM_BOT_WEBHOOK_DOMAIN = process.env.TELEGRAM_BOT_WEBHOOK_DOMAIN;
if (!TELEGRAM_BOT_WEBHOOK_DOMAIN) {
    throw 'Undetected TELEGRAM_BOT_WEBHOOK_DOMAIN! Please ensure an env var for this is added.';
}
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

async function handleTextMessage(ctx: any) {
    const userInput = ctx.message.text;
    try {
        const aiResponse = await generateAiResponse(userInput);
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

export async function startBot() {
    try {
        setupBotCommands();
        // await bot.launch();
        const webhookDomain = TELEGRAM_BOT_WEBHOOK_DOMAIN as string;
        const webhookPath = `/bot${TELEGRAM_BOT_TOKEN}` as string;
        await bot.telegram.setWebhook(`${webhookDomain}${webhookPath}`);
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
