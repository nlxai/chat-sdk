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
  headers: {
    [key: string]: string;
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
  reset: () => void;
}

interface InternalState {
  responses: Response[];
  conversationId?: string;
  userId?: string;
  contextSent: boolean;
}

const fromInternal = (internalState: InternalState): State =>
  internalState.responses;

type Subscriber = (response: Array<Response>) => void;

const createConversation = (config: Config): ConversationHandler => {
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

  const messageResposeHandler = (response: any) => {
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
          },
        },
      ],
    });
  };

  const sendToBot = (body: any) => {
    const bodyWithContext = {
      ...(config.context && !state.contextSent
        ? { context: config.context }
        : {}),
      ...body,
    };
    if (!state.contextSent) {
      state = { ...state, contextSent: true };
    }
    return fetch(config.botUrl, {
      method: "POST",
      headers: {
        ...config.headers,
        "content-type": "application/json",
      },
      body: JSON.stringify(bodyWithContext),
    }).then((res) => res.json());
  };

  let subscribers: Subscriber[] = [];

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
      })
        .then(messageResposeHandler)
        .catch(failureHandler);
    },
    sendStructured: () => {
      // TODO: implement
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
      })
        .then(messageResposeHandler)
        .catch(failureHandler);
    },
    sendIntent: (intentId) => {
      sendToBot({
        userId: state.userId,
        conversationId: state.conversationId,
        request: {
          structured: {
            intentId,
          },
        },
      })
        .then(messageResposeHandler)
        .catch(failureHandler);
    },
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
      })
        .then(messageResposeHandler)
        .catch(failureHandler);
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
    reset: () => {
      setState({
        conversationId: undefined,
      });
    },
  };
};

export default createConversation;
