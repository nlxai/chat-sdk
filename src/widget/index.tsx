import snarkdown from "snarkdown";
import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { ThemeProvider } from "emotion-theming";

import { findSelectedChoice } from "../index";
import { useChat } from "../react-utils";
import { CloseIcon, ChatIcon, AirplaneIcon, DownloadIcon } from "./icons";
import * as utils from "./utils";
import * as constants from "./ui/constants";
import { Props } from "./types";
import * as C from "./ui/components";
import * as transcript from "./ui/transcript";

export const standalone = (
  props: Props
): {
  teardown: () => void;
} => {
  const node = document.createElement("div");
  node.setAttribute("id", "widget-container");
  node.setAttribute("style", `z-index: ${constants.largeZIndex};`);
  document.body.appendChild(node);
  render(<Widget {...props} />, node);
  return {
    teardown: () => {
      unmountComponentAtNode(node);
    },
  };
};

const toStringWithLeadingZero = (n: number): string => {
  if (n < 10) {
    return `0${n}`;
  }
  return `${n}`;
};

export const Widget: React.FunctionComponent<Props> = (props) => {
  // Chat

  const chat = useChat(props.config);

  React.useEffect(() => {
    if (props.lowLevel && chat && chat.conversationHandler) {
      props.lowLevel(chat.conversationHandler);
    }
  }, [chat && chat.conversationHandler]);

  // Expanded state

  const [expanded, setExpanded] = React.useState(
    Boolean(props.initiallyExpanded)
  );

  // Input focus

  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (inputRef && inputRef.current) {
      (inputRef as any).current.focus();
    }
  }, [expanded, chat && chat.messages]);

  // Escape handling

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

  // Bubble

  const [bubble, setBubble] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setBubble(true);
    }, 3000);

    setTimeout(() => {
      setBubble(false);
    }, 20000);
  }, []);

  // Download

  const downloadNodeRef = React.useRef(null);

  const submit =
    chat &&
    chat.inputValue.replace(/ /gi, "") !== "" &&
    (() => {
      chat.conversationHandler.sendText(chat.inputValue);
      chat.setInputValue("");
    });

  const dateTimestamp = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${toStringWithLeadingZero(
      d.getMonth() + 1
    )}-${toStringWithLeadingZero(d.getDate())}-${toStringWithLeadingZero(
      d.getHours()
    )}:${toStringWithLeadingZero(d.getMinutes())}`;
  }, [chat && chat.messages]);

  return (
    <ThemeProvider
      theme={{ ...constants.defaultTheme, ...(props.theme || {}) }}
    >
      <>
        {props.bubble ? (
          <C.PinBubble
            isActive={!expanded && bubble}
            onClick={() => {
              setBubble(false);
            }}
            content={props.bubble}
          />
        ) : null}
        {expanded && chat && (
          <C.Container>
            <C.Main ref={chat.messagesContainerRef}>
              {props.titleBar && (
                <C.TitleBar>
                  <C.TitleContainer>
                    {props.titleBar.logo && (
                      <C.TitleIcon src={props.titleBar.logo} />
                    )}
                    <C.Title>{props.titleBar.title}</C.Title>
                  </C.TitleContainer>
                  {props.titleBar.downloadable && (
                    <>
                      <a
                        style={{ display: "none" }}
                        ref={downloadNodeRef}
                        href={window.URL.createObjectURL(
                          new Blob(
                            [
                              chat
                                ? transcript.html({
                                    messages: chat.messages,
                                    titleBar: props.titleBar,
                                    conversationId: chat.conversationHandler.currentConversationId(),
                                  })
                                : "",
                            ],
                            {
                              type: "text/plain",
                            }
                          )
                        )}
                        download={`chat-${dateTimestamp}.html`}
                      >
                        Download
                      </a>
                      <C.DiscreteButton
                        onClick={() => {
                          downloadNodeRef &&
                            downloadNodeRef.current &&
                            (downloadNodeRef as any).current.click();
                        }}
                      >
                        <DownloadIcon />
                        <span>Download</span>
                      </C.DiscreteButton>
                    </>
                  )}
                </C.TitleBar>
              )}
              <C.MessageGroups>
                {utils
                  .groupWhile(
                    chat.messages.filter(
                      (message) =>
                        !(
                          message.author === "user" &&
                          message.payload.type === "choice"
                        )
                    ),
                    (prev, current) => prev.author !== current.author
                  )
                  .map((group, groupIndex) => (
                    <C.MessageGroup key={groupIndex}>
                      {group.map((message, groupMessageIndex) =>
                        message.author === "bot" ? (
                          <C.Message type="bot" key={groupMessageIndex}>
                            <C.MessageBody
                              dangerouslySetInnerHTML={{
                                __html: snarkdown(message.text),
                              }}
                            />
                            {message.choices.length > 0 && (
                              <C.ChoicesContainer>
                                {message.choices.map((choice, choiceIndex) => (
                                  <C.ChoiceButton
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
                                                choice.choiceId,
                                          }
                                        : {
                                            onClick: () => {
                                              chat.conversationHandler.sendChoice(
                                                choice.choiceId
                                              );
                                            },
                                          };
                                    })()}
                                  >
                                    {choice.choiceText}
                                  </C.ChoiceButton>
                                ))}
                              </C.ChoicesContainer>
                            )}
                          </C.Message>
                        ) : (
                          message.payload.type === "text" && (
                            <C.Message type="user" key={groupMessageIndex}>
                              <C.MessageBody
                                dangerouslySetInnerHTML={{
                                  __html: snarkdown(message.payload.text),
                                }}
                              />
                            </C.Message>
                          )
                        )
                      )}
                    </C.MessageGroup>
                  ))}
                {chat.waiting && (
                  <C.MessageGroup>
                    <C.Message type="bot">
                      <C.PendingMessageDots />
                    </C.Message>
                  </C.MessageGroup>
                )}
              </C.MessageGroups>
            </C.Main>
            <C.Bottom>
              <C.Input
                ref={inputRef}
                value={chat.inputValue}
                placeholder={props.inputPlaceholder || "Say something.."}
                onChange={(e) => {
                  chat.setInputValue(e.target.value);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && submit) {
                    submit();
                  }
                }}
              />
              <C.IconButton
                disabled={Boolean(!submit)}
                onClick={() => {
                  if (submit) {
                    submit();
                  }
                }}
              >
                <AirplaneIcon />
              </C.IconButton>
            </C.Bottom>
          </C.Container>
        )}
        <C.Pin
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
        </C.Pin>
      </>
    </ThemeProvider>
  );
};
