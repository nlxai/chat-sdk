import { render } from "react-dom";
import React from "react";
import { Widget } from "../";
import { Config } from "@nlxchat/core";

const botUrl = process.env.NLX_BOT_URL as string;

const apiKey = process.env.NLX_BOT_API_KEY as string;

const config: Config = {
  botUrl,
  headers: {
    "nlx-api-key": apiKey,
  },
};

console.log(config);

render(<Widget config={config} />, document.querySelector("#app"));
