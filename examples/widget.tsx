import { standalone } from "../src/widget";

const botUrl = process.env.BOT_URL as string;
const authorization = process.env.AUTHORIZATION as string;

standalone({
  config: {
    botUrl,
    headers: {
      authorization
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
  lowLevel: conversation => {
    // console.log(conversation);
    // conversation.subscribe(messages => {});
    // etc.
  }
});
