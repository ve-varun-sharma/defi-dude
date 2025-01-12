# Telegram Bot

This repo holds multiple telegram bots for various use cases.

## DeFiDude Telegram Bot

This is DeFiDude! He's a sarcastic little bugger to help you in the world of Web3, and DeFi!
He can chat with you over Telegram.

To chat with DeFiDude on telegram, you can [get started here](https://t.me/DeFiDudeBot).

## YGG Guildy Telegram Bot

This is Guildy, the hilariously unhelpful (but secretly indispensable) Telegram bot for Yield Guild Games (YGG). He's known for his razor-sharp wit and uncanny ability to deliver information with a side of sarcastic sass. He assists both internal YGG team members and the external community.

To chat with Guidly on telegram, you can [get started here](https://t.me/YGGguildyBot).

## Installation

To install dependencies:

```bash
pnpm i
```

To run in dev:

```bash
pnpm run dev
```

To run in prod:

```bash
pnpm run start
```

## Using Docker

To use docker, build the local app from the Dockerfile, and run it as such.
Use the no cache flag if you want to hard start building the app. I recommend this especially when making package or dependency changes. Otherwise if you're rebuilding the app from code changes I recommend usin the default build option.

    ```bash
    docker build --no-cache -t telegram_bot .
    docker build -t telegram_bot .
    docker run telegram_bot

    ```

## Resources

This project uses:

-   [Telegraf](https://telegraf.js.org)
-   [Gemini AI](https://www.npmjs.com/package/@google/generative-ai)
