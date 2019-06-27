import { standalone } from "../src/widget";

const botUrl = process.env.BOT_URL as string;
const authorization = process.env.AUTHORIZATION as string;

standalone({
  config: {
    botUrl,
    headers: {
      authorization
    }
  },
  titleBar: {
    title: "Hello"
  }
});
