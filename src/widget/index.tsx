import tinycolor from "tinycolor2";
import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import createConversation, { Config, Conversation, Message } from "../index";
import { useChat } from "../react-utils";
import genericStyled, { CreateStyled } from "@emotion/styled";
import { ThemeProvider } from "emotion-theming";
import { CloseIcon, ChatIcon, AirplaneIcon } from "./icons";
import * as utils from "./utils";

interface Props {
  config: Config;
  theme?: Partial<Theme>;
  chatIcon?: string;
  titleBar?: {
    logo?: string;
    title: string;
  };
}

interface Theme {
  primaryColor: string;
  darkMessageColor: string;
  lightMessageColor: string;
  fontFamily: string;
}

const defaultTheme: Theme = {
  primaryColor: "#003377",
  darkMessageColor: "#003377",
  lightMessageColor: "#EFEFEF",
  fontFamily: "'Source Sans Pro', sans-serif"
};

const styled = genericStyled as CreateStyled<Theme>;

export const standalone = (
  props: Props
): {
  teardown: () => void;
} => {
  const node = document.createElement("div");
  node.setAttribute("id", "widget-container");
  node.setAttribute("style", `z-index: ${largeZIndex};`);
  document.body.appendChild(node);
  render(<Widget {...props} />, node);
  return {
    teardown: () => {
      unmountComponentAtNode(node);
    }
  };
};

export const Widget: React.SFC<Props> = props => {
  const chat = useChat(props.config);

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
    <ThemeProvider theme={{ ...defaultTheme, ...(props.theme || {}) }}>
      <>
        {expanded && chat && (
          <Container>
            <Main ref={chat.messagesContainerRef}>
              {props.titleBar && (
                <TitleBar>
                  <Title>{props.titleBar.title}</Title>
                </TitleBar>
              )}
              <MessageGroups>
                {utils
                  .groupWhile(
                    chat.messages,
                    (prev, current) => prev.author !== current.author
                  )
                  .map((group, index) => (
                    <MessageGroup>
                      {group.map((message, index) =>
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
                    </MessageGroup>
                  ))}
              </MessageGroups>
            </Main>
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
              <IconButton
                onClick={() => {
                  if (submit) {
                    submit();
                  }
                }}
              >
                <AirplaneIcon />
              </IconButton>
            </Bottom>
          </Container>
        )}
        <Pin
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? (
            <CloseIcon />
          ) : props.chatIcon ? (
            <img src={props.chatIcon} />
          ) : (
            <ChatIcon />
          )}
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

  & > *,
  & > button {
    font-family: ${props => props.theme.fontFamily};
  }
`;

const Main = styled.div<{}>`
  height: calc(100% - ${bottomHeight}px);
  overflow: auto;
`;

const MessageGroups = styled.div<{}>`
  padding: 20px;
  box-sizing: border-box;

  & > * {
    margin-bottom: 20px;
  }

  & > :last-child {
    margin-bottom: 0px;
  }
`;

const MessageGroup = styled.div<{}>`
  display: flex;
  flex-direction: column;

  & > * {
    margin-bottom: 3px;
  }

  & > :last-child {
    margin-bottom: 0px;
  }
`;

const Message = styled.div<{ type: "user" | "bot" }>`
  background-color: ${props =>
    props.type === "user"
      ? props.theme.darkMessageColor
      : props.theme.lightMessageColor};
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

const IconButton = styled.button<{}>`
  height: 35px;
  width: 35px;
  border-radius: 18px;
  padding: 8px;
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
  font-family: ${props => props.theme.fontFamily};

  :focus {
    outline: none;
    border: 1px solid ${props => props.theme.primaryColor};
    box-shadow: 0 0 0 3px
      ${props =>
        tinycolor(props.theme.primaryColor)
          .setAlpha(0.15)
          .toRgbString()};
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
  padding: 15px;
  color: #fff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.6);

  :focus {
    outline: none;
  }

  > img {
    max-width: 30px;
    max-height: 30px;
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
  background-color: #fff;
  color: ${props => props.theme.primaryColor};
  font-size: ${fontSize}px;
  font-family: ${props => props.theme.fontFamily};
  padding: 0 10px;
  cursor: pointer;

  :hover {
    background-color: #efefef;
  }

  :focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.2);
  }
`;

const TitleBar = styled.div<{}>`
  height: 40px;
  padding: 0 20px;
  border-bottom: 1px solid #cecece;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const Title = styled.p<{}>`
  font-size: 18px;
  font-weight: bold;
  font-family: ${props => props.theme.fontFamily};
`;

const TitleIcon = styled.img<{}>`
  width: 28px;
  height: 28px;
`;
