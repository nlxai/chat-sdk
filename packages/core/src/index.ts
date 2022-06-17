import fetch from "isomorphic-fetch";
import ReconnectingWebSocket from "reconnecting-websocket";
import { equals } from "ramda";

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
  conversationId?: string;
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
    conversationId: undefined,
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
    if (response) {
      setState({
        conversationId: response.conversationId,
        responses: [
          ...state.responses,
          {
            type: "bot",
            receivedAt: new Date().getTime(),
            payload: {
              conversationId: response.conversationId,
              messages: response.messages.map((message: any) => ({
                messageId: message.messageId,
                text: message.text,
                choices: message.choices || [],
              })),
              metadata: response.metadata,
              payload: response.payload,
              context: response.context,
            },
          },
        ],
      });
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

  if (isUsingWebSockets()) {
    // open websocket
    socket = new ReconnectingWebSocket(config.botUrl, []);

    const checkQueue = () => {
      if (socket?.readyState === 1 && socketMessageQueue[0]) {
        sendToBot(socketMessageQueue[0]);
        socketMessageQueue = socketMessageQueue.slice(1);
      }
    };

    socketMessageQueueCheckInterval = setInterval(checkQueue, 500);

    socket.onmessage = function(e) {
      if (typeof e?.data === "string") {
        messageResponseHandler(safeJsonParse(e.data));
      }
    };
  }

  const sendIntent = (intentId: string) => {
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
    sendIntent("NLX.Welcome");
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
      sendToBot({
        userId: state.userId,
        conversationId: state.conversationId,
        request: {
          structured,
        },
      });
    },
    sendSlots: (slots) => {
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
    sendChoice: (choiceId) => {
      const newResponses: Response[] = [
        ...state.responses.map((response) =>
          response.type === "bot"
            ? {
                ...response,
                payload: {
                  ...response.payload,
                  messages: response.payload.messages.map((botMessage) => ({
                    ...botMessage,
                    selectedChoiceId:
                      botMessage.choices
                        .map((choice) => choice.choiceId)
                        .indexOf(choiceId) > -1
                        ? choiceId
                        : botMessage.selectedChoiceId,
                  })),
                },
              }
            : response
        ),
        {
          type: "user",
          receivedAt: new Date().getTime(),
          payload: {
            type: "choice",
            choiceId,
          },
        },
      ];
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
        conversationId: undefined,
        responses: options?.clearResponses ? [] : state.responses,
      });
    },
    destroy: () => {
      subscribers = [];
      if (socket) {
        socket.close();
      }
      if (socketMessageQueueCheckInterval !== null) {
        clearInterval(socketMessageQueueCheckInterval);
      }
    },
  };
};

export default createConversation;
