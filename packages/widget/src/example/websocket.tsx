import { render } from "react-dom";
import React from "react";
import { Widget, Props } from "../";

const NLX_BOT_URL = process.env.NLX_BOT_URL as string;
const NLX_BOT_DEPLOY_KEY = process.env.NLX_BOT_DEPLOYMENT_KEY as string;
const NLX_BOT_CHANNEL_KEY = process.env.NLX_BOT_CHANNEL_KEY as string;
const NLX_BOT_API_KEY = process.env.NLX_BOT_API_KEY as string;
let botUrl = new URL(NLX_BOT_URL);
botUrl.searchParams.append("deploymentKey", NLX_BOT_DEPLOY_KEY);
botUrl.searchParams.append("channelKey", NLX_BOT_CHANNEL_KEY);
botUrl.searchParams.append("apiKey", NLX_BOT_API_KEY);

console.log(botUrl.href);
const props: Props = {
  config: {
    botUrl: botUrl.href,
    userId: "1234",
    context: {
      a: "b",
    },
  },
  initiallyExpanded: true,
  titleBar: {
    downloadable: true,
    title: "My Chat",
  },
};

render(<Widget {...props} />, document.querySelector("#app"));
