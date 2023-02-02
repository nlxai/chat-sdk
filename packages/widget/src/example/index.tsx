import { render } from "react-dom";
import React from "react";
import { standalone, Widget, Props } from "../";

const botUrl = process.env.NLX_BOT_URL as string;

const apiKey = process.env.NLX_BOT_API_KEY as string;

const props: Props = {
  config: {
    botUrl,
    languageCode: "en-US",
    headers: {
      "nlx-api-key": apiKey,
    },
    userId: "1234",
    context: {
      a: "b",
    },
  },
  bubble: "Need help?",
  titleBar: {
    downloadable: true,
    title: "My Chat",
  },
};

// render(<Widget {...props} />, document.querySelector("#app"));
const app = standalone(props);
app.collapse();
