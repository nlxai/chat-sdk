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
  useContext,
  useMemo,
  ReactElement,
  createContext,
  forwardRef,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot } from "react-dom/client";
import createCache from "@emotion/cache";
import { ThemeProvider, CacheProvider } from "@emotion/react";

import { useChat, type ChatHook } from "@nlx/chat-react";
import { type Response, type ConversationHandler } from "@nlx/chat-core";
import { CloseIcon, ChatIcon, AirplaneIcon, DownloadIcon } from "./icons";
import * as constants from "./ui/constants";
import {
  type Props,
  type StorageType,
  type CustomModalityComponent,
} from "./props";
import * as C from "./ui/components";

export { default as React } from "react";
export { default as ReactDOM } from "react-dom";

export {
  type Props,
  type TitleBar,
  type CustomModalityComponent,
} from "./props";
export { type Theme } from "./theme";
export { defaultTheme } from "./ui/constants";

export interface WidgetInstance {
  teardown: () => void;
  expand: () => void;
  collapse: () => void;
  getConversationHandler: () => ConversationHandler | undefined;
}

export interface WidgetRef {
  expand: () => void;
  collapse: () => void;
  conversationHandler: ConversationHandler;
}

export const create = (props: Props): WidgetInstance => {
  const node = document.createElement("div");
  node.setAttribute("id", "widget-container");
  node.setAttribute("style", `z-index: ${constants.largeZIndex};`);
  document.body.appendChild(node);
  const root = createRoot(node);
  const ref = createRef<WidgetRef>();
  root.render(<Widget {...props} ref={ref} />);
  return {
    teardown: () => {
      root.unmount();
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

const Loader: FC<{ message?: string; showAfter?: number }> = (props) => {
  const [showMessage, setShowMessage] = useState(props.showAfter === 0);
  useEffect(() => {
    const timeoutDuration =
      typeof props.showAfter === "number" ? props.showAfter : 2500;
    const timeout = setTimeout(() => {
      setShowMessage(true);
    }, timeoutDuration);
    return () => {
      clearTimeout(timeout);
    };
  }, [setShowMessage, props.showAfter]);

  return (
    <C.LoaderContainer>
      <C.PendingMessageDots />
      {showMessage && props.message && (
        <C.LoaderText>{props.message}</C.LoaderText>
      )}
    </C.LoaderContainer>
  );
};

const MessageGroups: FC<{
  chat: ChatHook;
  children?: ReactNode;
  customModalities: Record<string, CustomModalityComponent>;
}> = (props) => (
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
                      dangerouslySetInnerHTML={{
                        __html: marked(
                          choice.choiceText +
                            (false ? " asdf fadsfds  fdsa fdsa fdsa " : "")
                        ),
                      }}
                    ></C.ChoiceButton>
                  ))}
                </C.ChoicesContainer>
              )}
            </C.Message>
          ))}
          {Object.entries(response.payload.modalities || {}).map(
            ([key, value]) => {
              const Component = props.customModalities[key];
              if (Component) {
                return <Component key={key} data={value} />;
              }
              return null;
            }
          )}
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

const storageKey = "nlxchat-session";

interface SessionData {
  conversationId?: string;
  responses: Response[];
}

const saveSession = (chat: ChatHook, storeIn: StorageType) => {
  const storage = storeIn === "sessionStorage" ? sessionStorage : localStorage;
  storage.setItem(
    storageKey,
    JSON.stringify({
      responses: chat.responses,
      conversationId: chat.conversationHandler.currentConversationId(),
    })
  );
};

export const clearSession = (storeIn: StorageType) => {
  const storage = storeIn === "sessionStorage" ? sessionStorage : localStorage;
  storage.removeItem(storageKey);
};

export const retrieveSession = (storeIn: StorageType): SessionData | null => {
  try {
    const storage =
      storeIn === "sessionStorage" ? sessionStorage : localStorage;
    const data = JSON.parse(storage.getItem(storageKey) || "");
    const responses: Response[] | undefined = data?.responses;
    const conversationId: string | undefined = data?.conversationId;
    if (responses) {
      let expirationTimestamp: number | undefined = undefined;
      responses.forEach((response) => {
        if (response.type === "bot" && response.payload.expirationTimestamp) {
          expirationTimestamp = response.payload.expirationTimestamp;
        }
      });
      if (!expirationTimestamp || new Date().getTime() < expirationTimestamp) {
        return { responses, conversationId };
      } else {
        return { responses };
      }
    }
    return null;
  } catch (err) {
    return null;
  }
};

const ConversationHandlerContext = createContext<ConversationHandler | null>(
  null
);

export const useConversationHandler = () => {
  return useContext(ConversationHandlerContext);
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

  const savedSessionData = useMemo(
    () => (props.storeIn ? retrieveSession(props.storeIn) : null),
    [props.storeIn]
  );

  const configWithSession = useMemo(() => {
    if (!savedSessionData) {
      return props.config;
    }
    return {
      ...props.config,
      conversationId:
        savedSessionData.conversationId || props.config.conversationId,
      responses: savedSessionData.responses || props.config.responses,
    };
  }, [props.config, savedSessionData]);

  // Chat

  const chat = useChat(configWithSession);

  useEffect(() => {
    if (props.storeIn) {
      saveSession(chat, props.storeIn);
    }
  }, [chat.responses, props.storeIn]);

  // Expanded state

  const [expanded, setExpanded] = useState(false);

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
    <ConversationHandlerContext.Provider value={chat.conversationHandler}>
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
                        <C.DiscreteLink
                          href={window.URL.createObjectURL(
                            new Blob(
                              [
                                renderToStringWithStyles(
                                  <ThemeProvider theme={mergedTheme}>
                                    <MessageGroups
                                      chat={chat}
                                      customModalities={{}}
                                    />
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
                          <DownloadIcon />
                        </C.DiscreteLink>
                      </>
                    )}
                  </C.TitleBar>
                )}
                <MessageGroups chat={chat} customModalities={props.customModalities || {}}>
                  {chat.waiting && (
                    <C.MessageGroup>
                      <C.Message type="bot">
                        <Loader
                          message={props.loaderMessage}
                          showAfter={props.showLoaderMessageAfter}
                        />
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
                <C.BottomButtonsContainer>
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
                </C.BottomButtonsContainer>
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
    </ConversationHandlerContext.Provider>
  );
});
