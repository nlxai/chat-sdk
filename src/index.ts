import Promise from "promise-polyfill";
import "whatwg-fetch";
import find from "ramda/src/find";

if (!global.Promise) {
  global.Promise = Promise;
}

// Domain

interface Choice {
  choiceId: string;
  choiceText: string;
}

interface ResponseMessage {
  text: string;
  choices?: Choice[];
}

export interface BotMessage {
  author: "bot";
  receivedAt: Time;
  text: string;
  choices: Choice[];
  selectedChoice: SelectedChoice;
  payload?: string;
}

export type UserMessagePayload =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "choice";
      choiceId: string;
      choiceText: string;
    };

export interface UserMessage {
  author: "user";
  receivedAt: Time;
  payload: UserMessagePayload;
}

export type SelectedChoice = undefined | { choiceId?: string };

export type Message = BotMessage | UserMessage;

export type Time = number;

export const findSelectedChoice = (
  botMessage: BotMessage,
  allMessages: Message[]
): SelectedChoice => {
  if (allMessages.length === 0) {
    return undefined;
  }
  const [head, ...tail] = allMessages;
  if (head.receivedAt <= botMessage.receivedAt) {
    return findSelectedChoice(botMessage, tail);
  }
  if (head.author === "bot" && head.choices.length > 0) {
    return { choiceId: undefined };
  }
  if (head.author === "bot") {
    return findSelectedChoice(botMessage, tail);
  }
  if (head.payload.type === "choice") {
    return { choiceId: head.payload.choiceId };
  }
  return findSelectedChoice(botMessage, tail);
};

// Config and state

export interface Config {
  botUrl: string;
  userId?: string;
  failureMessages?: string[];
  greetingMessages?: string[];
  headers: {
    [key: string]: string;
  };
}

const defaultFailureMessages = [
  "We encountered an issue while contacting the server. Please try again in a few moments.",
];

export type State = Message[];

export interface ConversationHandler {
  sendText: (text: string) => void;
  sendSlots: (slots: Array<{ slotId: string; value: any }>) => void;
  sendChoice: (choiceId: string) => void;
  subscribe: (subscriber: Subscriber) => void;
  unsubscribe: (subscriber: Subscriber) => void;
  unsubscribeAll: () => void;
  currentConversationId: () => string | undefined;
  reset: () => void;
}

interface InternalState {
  messages: Message[];
  conversationId?: string;
  userId?: string;
}

const fromInternal = (internalState: InternalState): State =>
  internalState.messages;

type Subscriber = (
  state: State,
  additionalInformation: {
    payload?: string;
  }
) => void;

const findChoice = (messages: Message[], choiceId: string): Choice | null => {
  if (messages.length === 0) {
    return null;
  }
  const [last, ...restReversed] = [...messages].reverse();
  return (
    (last.author === "bot" &&
      find((choice) => choice.choiceId === choiceId, last.choices)) ||
    findChoice(restReversed.reverse(), choiceId)
  );
};

const createConversation = (config: Config): ConversationHandler => {
  let state: InternalState = {
    messages: (config.greetingMessages || []).map((greetingMessage) => ({
      author: "bot",
      receivedAt: new Date().getTime(),
      text: greetingMessage,
      choices: [],
      selectedChoice: undefined,
    })),
    userId: config.userId,
    conversationId: undefined,
  };
  const setState = (
    change: Partial<InternalState> & { payload?: string }
  ): void => {
    state = {
      ...state,
      ...change,
    };
    subscribers.forEach((subscriber) =>
      subscriber(fromInternal(state), {
        payload: change.payload,
      })
    );
  };

  const failureHandler = () => {
    setState({
      messages: [
        ...state.messages,
        ...(config.failureMessages || defaultFailureMessages).map(
          (messageBody: string): BotMessage => ({
            author: "bot",
            receivedAt: new Date().getTime(),
            text: messageBody,
            choices: [],
            selectedChoice: undefined,
          })
        ),
      ],
    });
  };

  const messageResposeHandler = (response: any) => {
    setState({
      conversationId: response.conversationId,
      messages: [
        ...state.messages,
        ...response.messages.map((message: ResponseMessage, index: number) => ({
          author: "bot",
          receivedAt: new Date().getTime(),
          text: message.text,
          choices: message.choices || [],
          payload:
            response.messages.length === index + 1
              ? response.payload
              : undefined,
        })),
      ],
      payload: response.payload,
    });
  };

  let subscribers: Subscriber[] = [];
  return {
    sendText: (text) => {
      setState({
        messages: [
          ...state.messages,
          {
            author: "user",
            receivedAt: new Date().getTime(),
            payload: {
              type: "text",
              text,
            },
          },
        ],
      });
      fetch(config.botUrl, {
        method: "POST",
        headers: {
          ...config.headers,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          userId: state.userId,
          conversationId: state.conversationId,
          request: {
            unstructured: {
              text,
            },
          },
        }),
      })
        .then((res) => res.json())
        .then(messageResposeHandler)
        .catch(failureHandler);
    },
    sendSlots: (slots) => {
      setState({
        messages: [...state.messages],
      });
      fetch(config.botUrl, {
        method: "POST",
        headers: {
          ...config.headers,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          userId: state.userId,
          conversationId: state.conversationId,
          request: {
            structured: {
              slots,
            },
          },
        }),
      })
        .then((res) => res.json())
        .then(messageResposeHandler)
        .catch(failureHandler);
    },
    sendChoice: (choiceId) => {
      const choice = findChoice(state.messages, choiceId);
      const newMessages: Message[] = [
        ...state.messages,
        {
          author: "user",
          receivedAt: new Date().getTime(),
          payload: {
            type: "choice",
            choiceId,
            choiceText: choice ? choice.choiceText : "Selection",
          },
        },
      ];
      setState({
        messages: newMessages,
      });
      fetch(config.botUrl, {
        method: "POST",
        headers: {
          ...config.headers,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          userId: state.userId,
          conversationId: state.conversationId,
          request: {
            structured: {
              choiceId,
            },
          },
        }),
      })
        .then((res) => res.json())
        .then(messageResposeHandler)
        .catch(failureHandler);
    },
    currentConversationId: () => {
      return state.conversationId;
    },
    subscribe: (subscriber) => {
      subscribers = [...subscribers, subscriber];
      subscriber(fromInternal(state), {});
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
