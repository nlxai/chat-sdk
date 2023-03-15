import { render } from "react-dom";
import React, { useState } from "react";
import { standalone, Widget, Props, clearSession } from "../";

const botUrl = process.env.NLX_BOT_URL as string;

const apiKey = process.env.NLX_BOT_API_KEY as string;

clearSession();

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

const App = () => {
  const [color, setColor] = useState("#f00");
  const theme = {
    primaryColor: color,
  };
  return (
    <>
      <input
        type="color"
        value={color}
        onInput={(ev: any) => {
          setColor(ev.target.value);
        }}
      />
      <Widget {...props} theme={theme} />
    </>
  );
};

render(<App />, document.getElementById("app"));
