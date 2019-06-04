import * as React from "react";
import { render } from "react-dom";
import createConversation, { Config, Conversation, Message } from "../index";
import { useChat } from "../react-utils";
import genericStyled, { CreateStyled } from "@emotion/styled";
import { ThemeProvider } from "emotion-theming";

interface Theme {
  color: string;
}

const defaultTheme: Theme = {
  color: "#00F"
};

const styled = genericStyled as CreateStyled<Theme>;

const Widget: React.SFC<Config> = props => {
  const chat = useChat(props);
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container>
        {!chat ? (
          <p>Loading..</p>
        ) : (
          <>
            <Messages>
              {chat.messages.map((message, index) =>
                message.author === "bot" ? (
                  <div className="nw-bot-message" key={index}>
                    {message.text}
                    {message.choices.map((choice, choiceIndex) => (
                      <button
                        key={choiceIndex}
                        onClick={() => {
                          chat.sendChoice(choice.choiceId);
                        }}
                      >
                        {choice.choiceText}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div key={index} className="nw-user-message">
                    {message.payload.type === "text"
                      ? message.payload.text
                      : message.payload.choiceText}
                  </div>
                )
              )}
            </Messages>
            <Bottom>
              <Input
                value={chat.inputValue}
                onChange={e => {
                  chat.setInputValue(e.target.value);
                }}
              />
              <Button
                onClick={() => {
                  if (!chat) {
                    return;
                  }
                  chat.sendText(chat.inputValue);
                  chat.setInputValue("");
                }}
              >
                Send
              </Button>
            </Bottom>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};

const Container = styled.div<{}>`
  width: 320px;
  height: 480px;
  border: 1px solid ${props => props.theme.color};
`;

const Messages = styled.div<{}>`
  height: calc(100% - 40px);
`;

const Bottom = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
`;

const Message = styled.div``;

const Button = styled.button`
  height: 28px;
  border: 0;
  box-shadow: none;
`;

const Input = styled.input`
  display: block;
  flex: 1;
  height: 28px;
`;

export default Widget;
