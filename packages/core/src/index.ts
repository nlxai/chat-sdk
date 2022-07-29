import fetch from "isomorphic-fetch";
import ReconnectingWebSocket from "reconnecting-websocket";
import { equals, findLastIndex, update } from "ramda";
import { v4 as uuid } from "uuid";

// Bot response

export interface BotResponse {
  type: "bot";
  receivedAt: Time;
  payload: BotResponsePayload;
}

export interface BotResponsePayload {
  conversationId?: string;
  messages: Array<BotMessage>;
  metadata?: BotResponseMetadata;
  payload?: string;
  context?: Record<string, any>;
}

export interface BotResponseMetadata {
  intentId?: string;
  escalation?: boolean;
  frustration?: boolean;
  incomprehension?: boolean;
}

export interface BotMessage {
  messageId?: string;
  text: string;
  choices: Choice[];
  selectedChoiceId?: string;
}

export interface Choice {
  choiceId: string;
  choiceText: string;
}

// User message

export interface UserResponse {
  type: "user";
  receivedAt: Time;
  payload: UserResponsePayload;
}

export type UserResponsePayload =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "choice";
      choiceId: string;
    }
  | {
      type: "structured";
    };

export type Response = BotResponse | UserResponse;

export type Time = number;

// Config and state

export interface Config {
  botUrl: string;
  userId?: string;
  failureMessages?: string[];
  greetingMessages?: string[];
  context?: Record<string, any>;
  triggerWelcomeIntent?: boolean;
  headers?: {
    [key: string]: string;
  };
  languageCode?: string;
  // Experimental settings
  experimental?: {
    channelType?: string;
  };
}

const welcomeIntent = "NLX.Welcome";

const defaultFailureMessages = [
  "We encountered an issue while contacting the server. Please try again in a few moments.",
];

export type State = Response[];

interface StructuredRequest {
  choiceId?: string;
  intentId?: string;
  slots?: Array<{ slotId: string; value: any }>;
}

interface BotRequest {
  conversationId?: string;
  userId?: string;
  context?: any;
  request: {
    unstructured?: {
      text: string;
    };
    structured?: StructuredRequest;
  };
}

export interface ConversationHandler {
  sendText: (text: string) => void;
  sendSlots: (slots: Array<{ slotId: string; value: any }>) => void;
  sendChoice: (choiceId: string) => void;
  sendWelcomeIntent: () => void;
  sendIntent: (intentId: string) => void;
  sendStructured: (request: StructuredRequest) => void;
  subscribe: (subscriber: Subscriber) => void;
  unsubscribe: (subscriber: Subscriber) => void;
  unsubscribeAll: () => void;
  currentConversationId: () => string | undefined;
  reset: (options?: { clearResponses?: boolean }) => void;
  destroy: () => void;
}

interface InternalState {
  responses: Response[];
  conversationId: string;
  userId?: string;
  contextSent: boolean;
}

const fromInternal = (internalState: InternalState): State =>
  internalState.responses;

const safeJsonParse = (val: string) => {
  try {
    const json = JSON.parse(val);
    return json;
  } catch (_err) {
    return null;
  }
};

type Subscriber = (response: Array<Response>) => void;

export const shouldReinitialize = (
  config1: Config,
  config2: Config
): boolean => {
  return (
    !equals(config1.botUrl, config2.botUrl) ||
    !equals(config1.userId, config2.userId) ||
    !equals(config1.context, config2.context) ||
    !equals(
      config1.experimental?.channelType,
      config2.experimental?.channelType
    ) ||
    !equals(config1.headers, config2.headers)
  );
};

export const createConversation = (config: Config): ConversationHandler => {
  let socket: ReconnectingWebSocket | undefined;
  let state: InternalState = {
    responses:
      config.greetingMessages && config.greetingMessages.length > 0
        ? [
            {
              type: "bot",
              receivedAt: new Date().getTime(),
              payload: {
                conversationId: undefined,
                messages: config.greetingMessages.map(
                  (greetingMessage: string) => ({
                    messageId: undefined,
                    text: greetingMessage,
                    choices: [] as Array<Choice>,
                    selectedChoiceId: undefined,
                  })
                ),
              },
            },
          ]
        : [],
    userId: config.userId,
    conversationId: uuid(),
    contextSent: false,
  };

  const setState = (change: Partial<InternalState>): void => {
    state = {
      ...state,
      ...change,
    };
    subscribers.forEach((subscriber) => subscriber(fromInternal(state)));
  };

  const failureHandler = () => {
    setState({
      responses: [
        ...state.responses,
        {
          type: "bot",
          receivedAt: new Date().getTime(),
          payload: {
            messages: (config.failureMessages || defaultFailureMessages).map(
              (messageBody: string): BotMessage => ({
                text: messageBody,
                choices: [] as Array<Choice>,
              })
            ),
          },
        },
      ],
    });
  };

  const messageResponseHandler = (response: any) => {
    if (!state.contextSent) {
      state = { ...state, contextSent: true };
    }
    if (response && response.messages) {
      setState({
        responses: [
          ...state.responses,
          {
            type: "bot",
            receivedAt: new Date().getTime(),
            payload: {
              ...response,
              messages: response.messages.map((message: any) => ({
                messageId: message.messageId,
                text: message.text,
                choices: message.choices || [],
              })),
            },
          },
        ],
      });
    } else {
      failureHandler();
    }
  };

  let socketMessageQueue: BotRequest[] = [];

  let socketMessageQueueCheckInterval: ReturnType<
    typeof setInterval
  > | null = null;

  const sendToBot = (body: BotRequest) => {
    const bodyWithContext = {
      ...(config.context && !state.contextSent
        ? { context: config.context }
        : {}),
      ...body,
      languageCode: config.languageCode,
      channelType: config.experimental?.channelType,
    };
    if (isUsingWebSockets()) {
      if (socket && socket.readyState === 1) {
        socket.send(JSON.stringify(bodyWithContext));
      } else {
        socketMessageQueue = [...socketMessageQueue, bodyWithContext];
      }
    } else {
      return fetch(config.botUrl, {
        method: "POST",
        headers: {
          ...(config.headers || {}),
          "content-type": "application/json",
        },
        body: JSON.stringify(bodyWithContext),
      })
        .then((res: any) => res.json())
        .then(messageResponseHandler)
        .catch(failureHandler);
    }
  };

  const isUsingWebSockets = () => {
    return config.botUrl && config.botUrl.indexOf("wss://") === 0;
  };

  let subscribers: Subscriber[] = [];

  const checkQueue = () => {
    if (socket?.readyState === 1 && socketMessageQueue[0]) {
      sendToBot(socketMessageQueue[0]);
      socketMessageQueue = socketMessageQueue.slice(1);
    }
  };

  const setupWebsocket = () => {
    const url = new URL(config.botUrl);
    url.searchParams.append("conversationId", state.conversationId);
    socket = new ReconnectingWebSocket(url.href);
    socketMessageQueueCheckInterval = setInterval(checkQueue, 500);
    socket.onmessage = function(e) {
      if (typeof e?.data === "string") {
        messageResponseHandler(safeJsonParse(e.data));
      }
    };
  };

  const teardownWebsocket = () => {
    if (socketMessageQueueCheckInterval) {
      clearInterval(socketMessageQueueCheckInterval);
    }
    if (socket) {
      socket.onmessage = null;
      socket.close();
      socket = undefined;
    }
  };

  if (isUsingWebSockets()) {
    setupWebsocket();
  }

  const appendStructuredUserResponse = () => {
    setState({
      responses: [
        ...state.responses,
        {
          type: "user",
          receivedAt: new Date().getTime(),
          payload: {
            type: "structured",
          },
        },
      ],
    });
  };

  const sendIntent = (intentId: string) => {
    appendStructuredUserResponse();
    sendToBot({
      userId: state.userId,
      conversationId: state.conversationId,
      request: {
        structured: {
          intentId,
        },
      },
    });
  };

  if (config.triggerWelcomeIntent) {
    sendIntent(welcomeIntent);
  }

  return {
    sendText: (text) => {
      setState({
        responses: [
          ...state.responses,
          {
            type: "user",
            receivedAt: new Date().getTime(),
            payload: {
              type: "text",
              text,
            },
          },
        ],
      });
      sendToBot({
        userId: state.userId,
        conversationId: state.conversationId,
        request: {
          unstructured: {
            text,
          },
        },
      });
    },
    sendStructured: (structured: StructuredRequest) => {
      appendStructuredUserResponse();
      sendToBot({
        userId: state.userId,
        conversationId: state.conversationId,
        request: {
          structured,
        },
      });
    },
    sendSlots: (slots) => {
      appendStructuredUserResponse();
      sendToBot({
        userId: state.userId,
        conversationId: state.conversationId,
        request: {
          structured: {
            slots,
          },
        },
      });
    },
    sendIntent,
    sendWelcomeIntent: () => {
      sendIntent(welcomeIntent);
    },
    sendChoice: (choiceId) => {
      const containsChoice = (botMessage: BotMessage) =>
        (botMessage.choices || [])
          .map((choice) => choice.choiceId)
          .indexOf(choiceId) > -1;

      const lastBotResponseIndex = findLastIndex(
        (response) =>
          response.type === "bot" &&
          Boolean(response.payload.messages.find(containsChoice)),
        state.responses
      );

      let newResponses: Response[] = [...state.responses];

      const choiceResponse: Response = {
        type: "user",
        receivedAt: new Date().getTime(),
        payload: {
          type: "choice",
          choiceId,
        },
      };

      if (lastBotResponseIndex > -1) {
        const lastBotResponse = state.responses[
          lastBotResponseIndex
        ] as BotResponse;

        const updatedBotResponse = {
          ...lastBotResponse,
          payload: {
            ...lastBotResponse.payload,
            messages: lastBotResponse.payload.messages.map((botMessage) => ({
              ...botMessage,
              selectedChoiceId: containsChoice(botMessage)
                ? choiceId
                : botMessage.selectedChoiceId,
            })),
          },
        };

        newResponses = update(
          lastBotResponseIndex,
          updatedBotResponse,
          newResponses
        );
      }

      newResponses = [...newResponses, choiceResponse];

      setState({
        responses: newResponses,
      });

      sendToBot({
        userId: state.userId,
        conversationId: state.conversationId,
        request: {
          structured: {
            choiceId,
          },
        },
      });
    },
    currentConversationId: () => {
      return state.conversationId;
    },
    subscribe: (subscriber) => {
      subscribers = [...subscribers, subscriber];
      subscriber(fromInternal(state));
    },
    unsubscribe: (subscriber) => {
      subscribers = subscribers.filter((fn) => fn !== subscriber);
    },
    unsubscribeAll: () => {
      subscribers = [];
    },
    reset: (options) => {
      setState({
        conversationId: uuid(),
        responses: options?.clearResponses ? [] : state.responses,
      });
      if (isUsingWebSockets()) {
        teardownWebsocket();
        setupWebsocket();
      }
      if (config.triggerWelcomeIntent) {
        sendIntent(welcomeIntent);
      }
    },
    destroy: () => {
      subscribers = [];
      if (isUsingWebSockets()) {
        teardownWebsocket();
      }
    },
  };
};

export default createConversation;
