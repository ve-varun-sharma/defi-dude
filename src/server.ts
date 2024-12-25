import { Telegraf } from "telegraf";
import { config } from "dotenv";
config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_BOT_TOKEN) {
  throw "Undetected TELEGRAM_BOT_TOKEN! Please ensure an env var for this is added.";
}
// const bot = new Telegraf<BotContext>(TELEGRAM_BOT_TOKEN);
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Wrap the top-level await in an async function

bot.launch();
// bot.start((ctx: any) => ctx.reply("Welcome"));
bot.start((ctx: any) => {
  ctx.reply(
    "Welcome to your Telegram bot! Use /help to see available commands."
  );
});

bot.on("text", (ctx: any) => ctx.reply("Hello there"));
bot.help((ctx: any) => ctx.reply("Send me a sticker"));
bot.hears("hi", (ctx: any) => ctx.reply("Hey there"));
