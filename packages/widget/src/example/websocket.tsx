import { render } from "react-dom";
import React from "react";
import { Widget, Props } from "../";

const botUrl = new URL("");
botUrl.searchParams.append("apiKey", "");
botUrl.searchParams.append("channelKey", "");
botUrl.searchParams.append("deploymentKey", "");

const props: Props = {
  config: {
    botUrl: botUrl.href,
    userId: "1234",
    triggerWelcomeIntent: true,
  },
  initiallyExpanded: true,
  titleBar: {
    downloadable: true,
    title: "My Chat",
  },
};

render(<Widget {...props} />, document.querySelector("#app"));
