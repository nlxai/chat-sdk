export interface Config {
  botUrl: string;
  headers: {
    [key: string]: string;
  };
}

export interface State {
  messages: Message[];
}

export interface Conversation {
  sendMessage: (text: string) => void;
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

const fromInternal = (internalState: InternalState): State => ({
  messages: internalState.messages
});

type Message = BotMessage | UserMessage;

interface Choice {
  choiceId: string;
  choiceText: string;
}

interface ResponseMessage {
  text: string;
  choices?: Choice[];
}

interface BotMessage {
  author: "bot";
  receivedAt: Time;
  text: string;
  choices: Choice[];
}

interface UserMessage {
  author: "user";
  receivedAt: Time;
  text: string;
}

type Subscriber = (state: State) => void;

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
    sendMessage: text => {
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
