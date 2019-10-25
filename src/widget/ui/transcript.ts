import snarkdown from "snarkdown";
import { Message } from "../../index";
import { defaultTheme } from "./constants";
import { Props } from "../types";

export const html = (messages: Message[], props: Props): string => {
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
    align-items: flex-start;
    justify-content: flex-start;
    margin-bottom: 20px;
  }

  .header img {
    width: 30px;
    height: 30px;
    margin-right: 10px;
    align-items: center;
  }

  .header h1 {
    margin: 0;
    align-items: center;
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

  .messages-container {
    max-width: 600px;
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
  props.titleBar
    ? `
<header class="header">
${
  props.titleBar.logo
    ? `
<img src="${props.titleBar.logo}" alt="Logo"></img>
`
    : ``
}
  <h1>${props.titleBar.title}</h1>
</header>
`
    : `
<header class="header">
  <h1>Transcript</h1>
</header>
`
}
<div class="messages-container">
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
