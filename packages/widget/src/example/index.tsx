import { render } from "react-dom";
import React from "react";
import { standalone, Widget, Props, clearSession } from "../";

const botUrl = process.env.NLX_BOT_URL as string;

const apiKey = process.env.NLX_BOT_API_KEY as string;

// clearSession();

const props: Props = {
  config: {
    botUrl,
    languageCode: "en-US",
    headers: {
      "nlx-api-key": apiKey,
    },
    userId: "1234",
    failureMessages: ["Something went wrong"],
    context: {
      a: "b",
    },
  },
  bubble: "Need help?",
  titleBar: {
    downloadable: true,
    title: "My Chat",
  },
  useSessionStorage: true,
};

const app = standalone(props);

setTimeout(() => {
  app.expand();
}, 500);

setTimeout(() => {
  app.getConversationHandler()?.sendIntent("abcd");
}, 100);
