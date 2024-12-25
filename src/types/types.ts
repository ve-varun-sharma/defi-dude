import { Context } from "telegraf";

export interface BotContext extends Context {
  session: {
    // Add any session data you need here
    counter?: number;
  };
}
