export interface Config {
  botUrl: string;
  headers: {
    [key: string]: string;
  };
}

export type State = Message[];

export interface Conversation {
  sendText: (text: string) => void;
  sendChoice: (choiceId: string) => void;
  subscribe: (subscriber: Subscriber) => void;
  unsubscribe: (subscriber: Subscriber) => void;
  unsubscribeAll: () => void;
  reset: () => void;
}

type Time = number;

interface InternalState {
  messages: Message[];
  conversationId?: string;
}

const fromInternal = (internalState: InternalState): State =>
  internalState.messages;

export type Message = BotMessage | UserMessage;

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

type Subscriber = (state: State) => void;

const findChoice = (messages: Message[], choiceId: string): Choice | null => {
  if (messages.length === 0) {
    return null;
  }
  const [last, ...restReversed] = [ ...messages ].reverse();
  return (
    (last.author === "bot" &&
      last.choices.find(choice => choice.choiceId === choiceId)) ||
    findChoice(restReversed.reverse(), choiceId)
  );
};

const createConversation = (config: Config): Conversation => {
  let state: InternalState = {
    messages: [],
    conversationId: undefined
  };
  const setState = (change: Partial<InternalState>): void => {
    state = {
      ...state,
      ...change
    };
    subscribers.forEach(subscriber => subscriber(fromInternal(state)));
  };
  let subscribers: Subscriber[] = [];
  return {
    sendText: text => {
      setState({
        messages: [
          ...state.messages,
          {
            author: "user",
            receivedAt: new Date().getTime(),
            payload: {
              type: "text",
              text
            }
          }
        ]
      });
      fetch(config.botUrl, {
        method: "POST",
        headers: {
          ...config.headers,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          conversationId: state.conversationId,
          request: {
            unstructured: {
              text
            }
          }
        })
      })
        .then(res => res.json())
        .then(response => {
          setState({
            conversationId: response.conversationId,
            messages: [
              ...state.messages,
              ...response.messages.map((message: ResponseMessage) => ({
                author: "bot",
                receivedAt: new Date().getTime(),
                text: message.text,
                choices: message.choices || []
              }))
            ]
          });
        });
    },
    sendChoice: choiceId => {
      const choice = findChoice(state.messages, choiceId);
      setState({
        messages: [
          ...state.messages,
          {
            author: "user",
            receivedAt: new Date().getTime(),
            payload: {
              type: "choice",
              choiceId,
              choiceText: choice ? choice.choiceText : "Selection"
            }
          }
        ]
      });
      fetch(config.botUrl, {
        method: "POST",
        headers: {
          ...config.headers,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          conversationId: state.conversationId,
          request: {
            structured: {
              choiceId
            }
          }
        })
      })
        .then(res => res.json())
        .then(response => {
          setState({
            conversationId: response.conversationId,
            messages: [
              ...state.messages,
              ...response.messages.map((message: ResponseMessage) => ({
                author: "bot",
                receivedAt: new Date().getTime(),
                text: message.text,
                choices: message.choices || []
              }))
            ]
          });
        });
    },
    subscribe: subscriber => {
      subscribers = [...subscribers, subscriber];
      subscriber(fromInternal(state));
    },
    unsubscribe: subscriber => {
      subscribers = subscribers.filter(fn => fn !== subscriber);
    },
    unsubscribeAll: () => {
      subscribers = [];
    },
    reset: () => {
      setState({
        conversationId: undefined
      });
    }
  };
};

export default createConversation;
