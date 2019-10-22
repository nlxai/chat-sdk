import tinycolor from "tinycolor2";
import snarkdown from "snarkdown";
import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import createConversation, {
  Config,
  Conversation,
  Message,
  findSelectedChoice
} from "../index";
import { useChat } from "../react-utils";
import genericStyled, { CreateStyled } from "@emotion/styled";
import { ThemeProvider } from "emotion-theming";
import { CloseIcon, ChatIcon, AirplaneIcon } from "./icons";
import * as utils from "./utils";
import { Props, Theme } from "./types";

const defaultTheme: Theme = {
  primaryColor: "#003377",
  darkMessageColor: "#003377",
  lightMessageColor: "#EFEFEF",
  white: "#FFFFFF",
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

  const [expanded, setExpanded] = React.useState(
    Boolean(props.initiallyExpanded)
  );

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

  const downloadNodeRef = React.useRef(null);

  const downloadNode = (
    <a
      style={{ display: "none" }}
      ref={downloadNodeRef}
      href={window.URL.createObjectURL(
        new Blob(
          [
            chat
              ? chat.messages
                  .map(message => JSON.stringify(message, null, 0))
                  .join("\n\n")
              : ""
          ],
          { type: "text/plain" }
        )
      )}
      download="chat.txt"
    >
      Download
    </a>
  );

  const submit =
    chat &&
    chat.inputValue.replace(/ /gi, "") !== "" &&
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
                  {props.titleBar.logo && (
                    <TitleIcon src={props.titleBar.logo} />
                  )}
                  <Title>{props.titleBar.title}</Title>
                  {false && (
                    <>
                      {downloadNode}
                      <button
                        onClick={() => {
                          downloadNodeRef &&
                            downloadNodeRef.current &&
                            (downloadNodeRef as any).current.click();
                        }}
                      >
                        Download
                      </button>
                    </>
                  )}
                </TitleBar>
              )}
              <MessageGroups>
                {utils
                  .groupWhile(
                    chat.messages.filter(
                      message =>
                        !(
                          message.author === "user" &&
                          message.payload.type === "choice"
                        )
                    ),
                    (prev, current) => prev.author !== current.author
                  )
                  .map((group, groupIndex) => (
                    <MessageGroup key={groupIndex}>
                      {group.map((message, groupMessageIndex) =>
                        message.author === "bot" ? (
                          <Message type="bot" key={groupMessageIndex}>
                            <MessageBody
                              dangerouslySetInnerHTML={{
                                __html: snarkdown(message.text)
                              }}
                            />
                            {message.choices.length > 0 && (
                              <ChoicesContainer>
                                {message.choices.map((choice, choiceIndex) => (
                                  <ChoiceButton
                                    key={choiceIndex}
                                    {...(() => {
                                      const selectedChoice = findSelectedChoice(
                                        message,
                                        chat.messages
                                      );
                                      return selectedChoice
                                        ? {
                                            disabled: true,
                                            selected:
                                              selectedChoice &&
                                              selectedChoice.choiceId ===
                                                choice.choiceId
                                          }
                                        : {
                                            onClick: () => {
                                              chat.sendChoice(choice.choiceId);
                                            }
                                          };
                                    })()}
                                  >
                                    {choice.choiceText}
                                  </ChoiceButton>
                                ))}
                              </ChoicesContainer>
                            )}
                          </Message>
                        ) : (
                          message.payload.type === "text" && (
                            <Message type="user" key={groupMessageIndex}>
                              <MessageBody
                                dangerouslySetInnerHTML={{
                                  __html: snarkdown(message.payload.text)
                                }}
                              />
                            </Message>
                          )
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
                placeholder={props.inputPlaceholder || "Say something.."}
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
                disabled={Boolean(!submit)}
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
  background-color: ${props => props.theme.white};

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
  color: ${props => (props.type === "user" ? props.theme.white : "#000")};
  padding: 6px 10px;
  max-width: calc(100% - 20px);
  ${props =>
    props.type === "user"
      ? "margin-left: 20px; margin-right: 0; border-radius: 10px 10px 0 10px; align-self: flex-end;"
      : "margin-right: 20px; margin-left: 0; border-radius: 10px 10px 10px 0; align-self: flex-start;"}
`;

const MessageBody = styled.p<{}>`
  margin: 0;
  font-size: ${fontSize}px;
  a,
  a:visited {
    color: inherit;
  }
  img {
    max-width: 80px;
    max-height: 60px;
  }
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

const focusShadow = (theme: Theme) => `
  box-shadow: 0 0 0 3px ${tinycolor(theme.primaryColor)
    .setAlpha(0.15)
    .toRgbString()};
`;

const IconButton = styled.button<{ disabled?: boolean }>`
  height: 35px;
  width: 35px;
  border-radius: 18px;
  padding: 8px;
  font-size: ${fontSize}px;
  ${props =>
    props.disabled
      ? `
  opacity: 0.6;
  `
      : `
  `}
  border: 0;
  box-shadow: none;
  background-color: ${props => props.theme.primaryColor};
  color: ${props => props.theme.white};
  position: relative;
  cursor: pointer;

  :focus {
    outline: none;
    ${props => focusShadow(props.theme)}
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
    ${props => focusShadow(props.theme)}
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
  color: ${props => props.theme.white};
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

const ChoiceButton = styled.button<{ disabled?: boolean; selected?: boolean }>`
  ${props =>
    props.selected
      ? `
  background-color: ${props.theme.primaryColor};
  color: ${props.theme.white};
  `
      : `
  background-color: ${props.theme.white};
  color: ${props.theme.primaryColor};
  `}
  ${props =>
    props.disabled
      ? `
  opacity: 0.4;
      `
      : `
  cursor: pointer;
  :hover {
    background-color: #efefef;
  }

  :focus {
    outline: none;
    ${focusShadow(props.theme)}
  }
      `}
  height: 30px;
  border-radius: 15px;
  border: 1px solid ${props => props.theme.primaryColor};
  font-size: ${fontSize}px;
  font-family: ${props => props.theme.fontFamily};
  padding: 0 10px;

  :focus {
    outline: none;
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
  font-size: 20px;
  font-weight: bold;
  font-family: ${props => props.theme.fontFamily};
`;

const TitleIcon = styled.img<{}>`
  width: 24px;
  height: 24px;
  margin-right: 6px;
`;
