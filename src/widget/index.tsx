import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import createConversation, { Config, Conversation, Message } from "../index";
import { useChat } from "../react-utils";
import genericStyled, { CreateStyled } from "@emotion/styled";
import { ThemeProvider } from "emotion-theming";

interface Theme {
  primaryColor: string;
  userMessageColor: string;
  botMessageColor: string;
}

const defaultTheme: Theme = {
  primaryColor: "#003377",
  userMessageColor: "#003377",
  botMessageColor: "#EFEFEF"
};

const styled = genericStyled as CreateStyled<Theme>;

const standalone = (
  config: Config
): {
  teardown: () => void;
} => {
  const node = document.createElement("div");
  node.setAttribute("id", "widget-container");
  node.setAttribute("style", `z-index: ${largeZIndex};`);
  document.body.appendChild(node);
  render(<Widget {...config} />, node);
  return {
    teardown: () => {
      unmountComponentAtNode(node);
    }
  };
};

export const Widget: React.SFC<Config> = props => {
  const chat = useChat(props);

  const [expanded, setExpanded] = React.useState(false);

  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (inputRef && inputRef.current) {
      (inputRef as any).current.focus();
    }
  }, [expanded, chat && chat.messages]);

  React.useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        setExpanded(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);

  const submit =
    chat &&
    chat.inputValue !== "" &&
    (() => {
      chat.sendText(chat.inputValue);
      chat.setInputValue("");
    });
  return (
    <ThemeProvider theme={defaultTheme}>
      <>
        {expanded && chat && (
          <Container>
            <>
              <Messages ref={chat.messagesContainerRef}>
                {chat.messages.map((message, index) =>
                  message.author === "bot" ? (
                    <Message type="bot" key={index}>
                      {message.text}
                      {message.choices.length > 0 && (
                        <ChoicesContainer>
                          {message.choices.map((choice, choiceIndex) => (
                            <ChoiceButton
                              key={choiceIndex}
                              onClick={() => {
                                chat.sendChoice(choice.choiceId);
                              }}
                            >
                              {choice.choiceText}
                            </ChoiceButton>
                          ))}
                        </ChoicesContainer>
                      )}
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
                  ref={inputRef}
                  value={chat.inputValue}
                  placeholder="Say something.."
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
          </Container>
        )}
        <Pin
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded && <CloseIcon />}
        </Pin>
      </>
    </ThemeProvider>
  );
};

// Style constants

const bottomHeight = 60;

const fontSize = 15;

const largeZIndex = 2147483000;

// Styled components

const Container = styled.div<{}>`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  height: calc(100vh - 120px);
  border-radius: 10px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.3);

  > * {
    font-family: "Source Sans Pro", sans-serif;
  }
`;

const Messages = styled.div<{}>`
  height: calc(100% - ${bottomHeight}px);
  padding: 20px;
  box-sizing: border-box;
  overflow: auto;
  display: flex;
  flex-direction: column;

  & > * {
    margin-bottom: 10px;
  }

  & > :last-child {
    margin-bottom: 0px;
  }
`;

const Message = styled.div<{ type: "user" | "bot" }>`
  background-color: ${props =>
    props.type === "user"
      ? props.theme.userMessageColor
      : props.theme.botMessageColor};
  color: ${props => (props.type === "user" ? "#FFF" : "#000")};
  font-size: ${fontSize}px;
  padding: 6px 10px;
  width: fit-content;
  ${props =>
    props.type === "user"
      ? "margin-left: 20px; margin-right: 0; border-radius: 10px 10px 0 10px; align-self: flex-end;"
      : "margin-right: 20px; margin-left: 0; border-radius: 10px 10px 10px 0; align-self: flex-start;"}
`;

const Bottom = styled.div<{}>`
  height: ${bottomHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-top: 1px solid #cecece;

  > * {
    margin-right: 10px;
  }

  > :last-child {
    margin-right: 0;
  }
`;

const hoverBg = `
  :hover::after {
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Button = styled.button<{}>`
  height: 35px;
  border-radius: 18px;
  padding: 0 14px;
  font-size: ${fontSize}px;
  border: 0;
  box-shadow: none;
  background-color: ${props => props.theme.primaryColor};
  color: #fff;
  position: relative;
  cursor: pointer;

  :focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.2);
  }

  ${hoverBg}
`;

const Input = styled.input<{}>`
  display: block;
  flex: 1;
  height: 35px;
  border-radius: 18px;
  padding: 0 14px;
  border: 1px solid #cecece;
  font-size: ${fontSize}px;

  :focus {
    outline: none;
    border: 1px solid ${props => props.theme.primaryColor};
    box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.2);
  }
`;

const Pin = styled.button<{}>`
  position: fixed;
  background-color: ${props => props.theme.primaryColor};
  border: 0;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  cursor: pointer;
  padding: 20px;
  color: #fff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.6);

  :focus {
    outline: none;
  }

  ${hoverBg}
`;

const ChoicesContainer = styled.div<{}>`
  margin-top: 10px;

  > * {
    margin-right: 10px;
  }

  > :last-child {
    margin-right: 0px;
  }
`;

const ChoiceButton = styled.button<{}>`
  background-color: ${props => props.theme.primaryColor};
  height: 30px;
  border-radius: 15px;
  border: 1px solid ${props => props.theme.primaryColor};
  background-color: #FFF;
  color: ${props => props.theme.primaryColor};
  font-size: ${fontSize}px;
  padding: 0 10px;
  cursor: pointer;

  :hover {
    background-color: #EFEFEF;
  }

  :focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.2);
  }
`;

const CloseIcon = () => (
  <svg viewBox="0 0 360 360" stroke="none" fill="currentColor">
    <path d="M180,151.716l105.858,-105.858c9.428,9.428 18.856,18.856 28.284,28.284l-105.858,105.858l105.858,105.858l-28.284,28.284l-105.858,-105.858l-105.858,105.858l-28.284,-28.284l105.858,-105.858l-105.858,-105.858l28.284,-28.284l105.858,105.858Z" />
  </svg>
);

export default standalone;
