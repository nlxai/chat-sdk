import { marked } from "marked";
import React, {
  type FC,
  type ReactNode,
  createRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  ReactElement,
  forwardRef,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { render, unmountComponentAtNode } from "react-dom";
import createCache from "@emotion/cache";
import { ThemeProvider, CacheProvider } from "@emotion/react";

import { useChat, type ChatHook } from "@nlxchat/react";
import {
  type Response,
  type Config,
  type ConversationHandler,
} from "@nlxchat/core";
import { CloseIcon, ChatIcon, AirplaneIcon, DownloadIcon } from "./icons";
import * as constants from "./ui/constants";
import { type Props } from "./props";
import * as C from "./ui/components";

export { type Props, type TitleBar } from "./props";
export { type Theme } from "./theme";
export { defaultTheme } from "./ui/constants";

export interface WidgetInstance {
  teardown: () => void;
  expand: () => void;
  collapse: () => void;
  getConversationHandler: () => ConversationHandler | undefined;
}

interface WidgetRef {
  expand: () => void;
  collapse: () => void;
  conversationHandler: ConversationHandler;
}

export const standalone = (props: Props): WidgetInstance => {
  const node = document.createElement("div");
  node.setAttribute("id", "widget-container");
  node.setAttribute("style", `z-index: ${constants.largeZIndex};`);
  document.body.appendChild(node);
  const ref = createRef<WidgetRef>();
  render(<Widget {...props} ref={ref} />, node);
  return {
    teardown: () => {
      unmountComponentAtNode(node);
    },
    expand: () => {
      ref.current?.expand();
    },
    collapse: () => {
      ref.current?.collapse();
    },
    getConversationHandler: () => {
      return ref.current?.conversationHandler;
    },
  };
};

const toStringWithLeadingZero = (n: number): string => {
  if (n < 10) {
    return `0${n}`;
  }
  return `${n}`;
};

const Loader: FC<{ message?: string }> = (props) => {
  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMessage(true);
    }, 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, [setShowMessage]);

  return (
    <C.LoaderContainer>
      <C.PendingMessageDots />
      {showMessage && props.message && (
        <C.LoaderText>{props.message}</C.LoaderText>
      )}
    </C.LoaderContainer>
  );
};

const MessageGroups: FC<{ chat: ChatHook; children?: ReactNode }> = (props) => (
  <C.MessageGroups>
    {props.chat.responses.map((response, responseIndex) =>
      response.type === "bot" ? (
        <C.MessageGroup key={responseIndex}>
          {response.payload.messages.map((botMessage, botMessageIndex) => (
            <C.Message type="bot" key={botMessageIndex}>
              <C.MessageBody
                dangerouslySetInnerHTML={{
                  __html: marked(botMessage.text),
                }}
              />
              {botMessage.choices.length > 0 && (
                <C.ChoicesContainer>
                  {botMessage.choices.map((choice, choiceIndex) => (
                    <C.ChoiceButton
                      key={choiceIndex}
                      {...(() => {
                        return botMessage.selectedChoiceId
                          ? {
                              disabled: true,
                              selected:
                                botMessage.selectedChoiceId === choice.choiceId,
                            }
                          : {
                              onClick: () => {
                                props.chat.conversationHandler.sendChoice(
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
          ))}
        </C.MessageGroup>
      ) : response.payload.type === "text" ? (
        <C.MessageGroup key={responseIndex}>
          <C.Message type="user">
            <C.MessageBody
              dangerouslySetInnerHTML={{
                __html: marked(response.payload.text),
              }}
            />
          </C.Message>
        </C.MessageGroup>
      ) : null
    )}
    {props.children}
  </C.MessageGroups>
);

// Solution per https://github.com/emotion-js/emotion/issues/2102#issuecomment-727186154
const renderToStringWithStyles = (element: ReactElement): string => {
  const key = "foo";
  const cache = createCache({ key });
  let cssText = "";
  cache.sheet.insert = (rule) => {
    cssText += rule;
  };

  const markup = renderToStaticMarkup(
    <CacheProvider value={cache}>{element}</CacheProvider>
  );

  const html = `<!DOCTYPE html>
  <html>
    <head>
        <meta charset="UTF-8">
        <style>${cssText}</style>
    </head>
    <body>
        <div>${markup}</div>
    </body>
  </html>
`;

  return html;
};

const sessionStorageKey = "nlxchat-session";

interface SessionData {
  conversationId: string;
  responses: Response[];
}

const getConfigWithSession = (config: Config, session: SessionData) => {
  return !config.conversationId && !config.responses
    ? {
        ...config,
        triggerWelcomeIntent: false,
        conversationId: session.conversationId,
        responses: session.responses,
      }
    : config;
};

export const saveSession = (chat: ChatHook) => {
  sessionStorage.setItem(
    sessionStorageKey,
    JSON.stringify({
      savedAt: new Date().getTime(),
      responses: chat.responses,
      conversationId: chat.conversationHandler.currentConversationId(),
    })
  );
};

export const clearSession = () => {
  sessionStorage.removeItem(sessionStorageKey);
};

export const retrieveSession = (): SessionData | null => {
  try {
    const data = JSON.parse(sessionStorage.getItem(sessionStorageKey) || "");
    const responses = data?.responses;
    const conversationId = data?.conversationId;
    const savedAt = data?.savedAt;
    if (responses && conversationId && savedAt) {
      if (new Date().getTime() - savedAt < 60 * 60 * 1000) {
        return { responses, conversationId };
      } else {
        clearSession();
        return null;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const Widget = forwardRef<WidgetRef, Props>((props, ref) => {
  const [windowInnerHeightValue, setWindowInnerHeightValue] = useState<
    number | null
  >(null);

  useEffect(() => {
    setWindowInnerHeightValue(window.innerHeight);
    const handleResize = () => {
      setWindowInnerHeightValue(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [savedSessionData, setSavedSessionData] = useState<SessionData | null>(
    null
  );

  const configWithSession = useMemo(() => {
    if (!savedSessionData || !props.useSessionStorage) {
      return props.config;
    }
    return getConfigWithSession(props.config, savedSessionData);
  }, [props.config, savedSessionData]);

  // Chat

  const chat = useChat(configWithSession);

  useEffect(() => {
    const session = retrieveSession();
    if (session && props.useSessionStorage) {
      setSavedSessionData(session);
    }
  }, []);

  useEffect(() => {
    if (props.lowLevel && chat.conversationHandler) {
      props.lowLevel(chat.conversationHandler);
    }
  }, [chat.conversationHandler]);

  useEffect(() => {
    if (props.useSessionStorage) {
      saveSession(chat);
    }
  }, [chat.responses, props.useSessionStorage || false]);

  // Expanded state

  const [expanded, setExpanded] = useState(Boolean(props.initiallyExpanded));

  useEffect(() => {
    if (expanded) {
      props.onExpand?.(chat.conversationHandler);
    } else {
      props.onCollapse?.(chat.conversationHandler);
    }
  }, [expanded, chat.conversationHandler]);

  const expand = useCallback(() => {
    setExpanded(true);
  }, [setExpanded]);

  const collapse = useCallback(() => {
    setExpanded(false);
  }, [setExpanded]);

  useImperativeHandle(ref, () => {
    return {
      expand,
      collapse,
      conversationHandler: chat.conversationHandler,
    };
  });

  // Input focus

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      (inputRef as any).current.focus();
    }
  }, [expanded, chat.responses]);

  useEffect(() => {
    if (expanded) {
      chat.scrollToBottom();
    }
  }, [expanded]);

  // Escape handling

  useEffect(() => {
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

  const [bubble, setBubble] = useState(false);

  useEffect(() => {
    const timeout1 = setTimeout(() => {
      setBubble(true);
    }, 3000);

    const timeout2 = setTimeout(() => {
      setBubble(false);
    }, 20000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  // Download

  const downloadNodeRef = useRef<HTMLAnchorElement>(null);

  const submit =
    chat.inputValue.replace(/ /gi, "") !== "" &&
    (() => {
      chat.conversationHandler.sendText(chat.inputValue);
      chat.setInputValue("");
    });

  const dateTimestamp = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${toStringWithLeadingZero(
      d.getMonth() + 1
    )}-${toStringWithLeadingZero(d.getDate())}-${toStringWithLeadingZero(
      d.getHours()
    )}:${toStringWithLeadingZero(d.getMinutes())}`;
  }, [chat.responses]);

  const mergedTheme = useMemo(
    () => ({
      ...constants.defaultTheme,
      ...(props.theme || {}),
      windowInnerHeight: windowInnerHeightValue,
    }),
    [props.theme, windowInnerHeightValue]
  );

  return (
    <ThemeProvider theme={mergedTheme}>
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
        {expanded && (
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
                              renderToStringWithStyles(
                                <ThemeProvider theme={mergedTheme}>
                                  <MessageGroups chat={chat} />
                                </ThemeProvider>
                              ),
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
                          if (downloadNodeRef.current !== null) {
                            downloadNodeRef.current.click();
                          }
                        }}
                      >
                        <DownloadIcon />
                        <span>Download</span>
                      </C.DiscreteButton>
                    </>
                  )}
                </C.TitleBar>
              )}
              <MessageGroups chat={chat}>
                {chat.waiting && (
                  <C.MessageGroup>
                    <C.Message type="bot">
                      <Loader message={props.loaderMessage} />
                    </C.Message>
                  </C.MessageGroup>
                )}
              </MessageGroups>
            </C.Main>
            <C.Bottom>
              <C.Input
                ref={inputRef}
                value={chat.inputValue}
                placeholder={props.inputPlaceholder || "Type something..."}
                onChange={(event: any) => {
                  chat.setInputValue(event.target.value);
                }}
                onKeyPress={(event: any) => {
                  if (event.key === "Enter" && submit) {
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
});
