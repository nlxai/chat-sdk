import { standalone } from "../src/widget";

const botUrl = process.env.BOT_URL as string;
const nlxApiKey = process.env.NLX_API_KEY as string;

console.log(botUrl, nlxApiKey);

standalone({
  config: {
    botUrl,
    headers: {
      "nlx-api-key": nlxApiKey
    },
    greetingMessages: ["Hi there"]
  },
  bubble: "Need help?",
  titleBar: {
    title: "Support Chat",
    downloadable: true,
    logo:
      "https://images.unsplash.com/photo-1558470622-bd37a3c489e7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80"
  },
  inputPlaceholder: "Say something...",
  initiallyExpanded: true,
  lowLevel: _ => {
    // console.log(conversation);
    // conversation.subscribe(messages => {});
    // etc.
  }
});
