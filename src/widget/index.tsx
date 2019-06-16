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
  const submit =
    chat &&
    chat.inputValue !== "" &&
    (() => {
      chat.sendText(chat.inputValue);
      chat.setInputValue("");
    });
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container>
        {!chat ? (
          <></>
        ) : (
          <>
            <Messages>
              {chat.messages.map((message, index) =>
                message.author === "bot" ? (
                  <Message type="bot" key={index}>
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
                  </Message>
                ) : (
                  <Message type="user" key={index}>
                    {message.payload.type === "text"
                      ? message.payload.text
                      : message.payload.choiceText}
                  </Message>
                )
              )}
            </Messages>
            <Bottom>
              <Input
                value={chat.inputValue}
                onChange={e => {
                  chat.setInputValue(e.target.value);
                }}
                onKeyPress={e => {
                  if (e.key === "Enter" && submit) {
                    submit();
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (submit) {
                    submit();
                  }
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
  padding: 10px;
  box-sizing: border-box;

  & > * {
    margin-bottom: 10px;
  }

  & > :last-child {
    margin-bottom: 0px;
  }
`;

const Message = styled.div<{ type: "user" | "bot" }>`
  background-color: ${props => props.theme.color};
  padding: 4px 10px;
  ${props => props.type === "user" ? "margin-left: 20px;" : "margin-right: 20px;"}
`;

const Bottom = styled.div<{}>`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
`;

const Button = styled.button<{}>`
  height: 28px;
  border: 0;
  box-shadow: none;
`;

const Input = styled.input<{}>`
  display: block;
  flex: 1;
  height: 28px;
`;

export default Widget;
