import * as React from "react";
import { render } from "react-dom";
import createConversation, {
  Config,
  ConversationHandler,
  Message
} from "../src/index";
import { useChat } from "../src/react-utils";

const botUrl = process.env.BOT_URL as string;
const authorization = process.env.AUTHORIZATION as string;

const testConfig: Config = {
  botUrl,
  headers: {
    authorization
  }
};

const App = () => {
  const chat = useChat(testConfig);
  if (!chat) {
    return <p>Loading..</p>;
  }

  return (
    <div>
      {chat.messages.map((message, index) =>
        message.author === "bot" ? (
          <div key={index}>
            {message.text}
            {message.choices.map((choice, choiceIndex) => (
              <button
                key={choiceIndex}
                onClick={() => {
                  chat.conversationHandler.sendChoice(choice.choiceId);
                }}
              >
                {choice.choiceText}
              </button>
            ))}
          </div>
        ) : (
          <div key={index}>
            {message.payload.type === "text"
              ? message.payload.text
              : message.payload.choiceText}
          </div>
        )
      )}
      <input
        value={chat.inputValue}
        onChange={e => {
          chat.setInputValue(e.target.value);
        }}
      />
      <button
        onClick={() => {
          if (!chat) {
            return;
          }
          chat.conversationHandler.sendText(chat.inputValue);
          chat.setInputValue("");
        }}
      >
        Send
      </button>
    </div>
  );
};

render(<App />, document.querySelector("#app"));
