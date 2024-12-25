# DeFiDude Telegram Bot

This is DeFiDude! He's a sarcastic little bugger to help you in the world of Web3, and DeFi!
He can chat with you over Telegram.

To chat with DeFiDude on telegram, you can [get started here](https://t.me/DeFiDudeBot).

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
    docker build --no-cache -t defi_dude .
    docker build -t defi_dude .
    docker run defi_dude

    ```

## Resources

This project uses:

-   [Telegraf](https://telegraf.js.org)
-   [Gemini AI](https://www.npmjs.com/package/@google/generative-ai)
