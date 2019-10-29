import snarkdown from "snarkdown";
import { Message } from "../../index";
import { defaultTheme } from "./constants";
import { Props } from "../types";

export const html = ({
  messages,
  titleBar,
  conversationId
}: {
  messages: Message[];
  titleBar: Props["titleBar"];
  conversationId?: string;
}): string => {
  return `
<head>
<style>
  @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

  * {
    box-sizing: border-box;
    font-family: 'Source Sans Pro', sans-serif;
  }

  .header {
    max-width: 600px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20px;
  }

  .header img {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }

  p {
    font-size: 16px;
    margin: 0;
  }

  h1 {
    font-size: 24px;
    margin: 0;
  }

  .choices {
    margin-top: 6px;
  }

  .choices button {
    margin-right: 10px;
    background-color: white;
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid #898989;
  }

  .container {
    max-width: 600px;
    padding: 20px;
    border: 1px solid #cecece;
    border-radius: 4px;
    margin: 30px 0;
  }

  .messages-container {
    display: flex;
    flex-direction: column;
  }

  .messages-container > * {
    margin-bottom: 20px;
  }

  .messages-container > *:last-child {
    margin-bottom: 0px;
  }

  .timestamp {
    font-size: 12px;
    color: #ababab;
  }

  .message-container--user .timestamp {
    text-align: right;
  }

  .message-container--bot .timestamp {
    text-align: left;
  }

  .message-container {
    max-width: calc(100% - 20px);
  }

  .message-container--user {
    margin-left: 20px;
    margin-right: 0;
    align-self: flex-end;
  }

  .message-container--bot {
    margin-right: 20px;
    margin-left: 0;
    align-self: flex-start;
  }

  .message {
    padding: 6px 12px;
  }

  .message p {
    margin: 0;
  }

  .message--user {
    background-color: ${defaultTheme.darkMessageColor};
    color: ${defaultTheme.white};
    border-radius: 10px 10px 0 10px;
  }

  .message--bot {
    background-color: ${defaultTheme.lightMessageColor};
    color: black;
    border-radius: 10px 10px 10px 0;
  }
</style>
</head>
<body>
${
  titleBar
    ? `
<header class="header">
${
  titleBar.logo
    ? `
<img src="${titleBar.logo}" alt="Logo"></img>
`
    : ""
}
  <h1>${titleBar.title}</h1>
</header>
`
    : `
<header class="header">
  <h1>Transcript</h1>
</header>
`
}
${
  conversationId
    ? `
<div class="container info-container">
  <p>Conversation ID: ${conversationId}</p>
</div>
`
    : ""
}
<div class="container messages-container">
  ${messages.map(messageToHtml).join("\n\n")}
</div>
</body>
`;
};

const messageToHtml = (message: Message): string =>
  message.author === "bot"
    ? `
<div class="message-container message-container--bot">
  <div class="message message--bot">
    <p>${snarkdown(message.text)}</p>
    ${
      message.choices && message.choices.length > 0
        ? `<div class="choices">${message.choices
            .map(
              choice => `
    <button>${choice.choiceText}</button>
    `
            )
            .join("")}</div>`
        : ""
    }
  </div>
  <div class="timestamp">${new Date(message.receivedAt).toLocaleString()}</div>
</div>
`
    : `
<div class="message-container message-container--user">
  <div class="message message--user">
    <p>${
      message.payload.type === "text"
        ? snarkdown(message.payload.text)
        : message.payload.choiceText
    }</p>
  </div>
  <div class="timestamp">${new Date(message.receivedAt).toLocaleString()}</div>
</div>
`;
