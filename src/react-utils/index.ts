import * as React from "react";
import last from "ramda/src/last";
import createConversation, {
  Config,
  ConversationHandler,
  Message
} from "../index";

export interface ChatHook {
  conversationHandler: ConversationHandler;
  inputValue: string;
  messages: Message[];
  messagesContainerRef: React.Ref<HTMLDivElement> | null;
  waiting: boolean;
  setInputValue: (val: string) => void;
}

export const useChat = (config: Config): ChatHook | null => {
  const [
    conversation,
    setConversation
  ] = React.useState<null | ConversationHandler>(null);

  const [messages, setMessages] = React.useState<Message[]>([]);

  const [inputValue, setInputValue] = React.useState<string>("");

  const [waitTimeoutPassed, setWaitTimeoutPassed] = React.useState(false);

  const messagesContainerRef = React.useRef(null);

  React.useEffect(() => {
    setConversation(createConversation(config));
    return () => {};
  }, []);

  React.useEffect(() => {
    conversation &&
      conversation.subscribe(msgs => {
        setMessages(msgs);
      });
    return () => {
      conversation && conversation.unsubscribeAll();
    };
  }, [conversation]);

  const scrollToBottom = () => {
    const node =
      messagesContainerRef !== null &&
      (messagesContainerRef as { current: HTMLElement | null }).current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const lastMessage = last(messages);
  const isWaiting = lastMessage ? lastMessage.author === "user" : false;

  React.useEffect(() => {
    const lastMessage = last(messages);
    const isWaiting = lastMessage ? lastMessage.author === "user" : false;
    if (isWaiting) {
      setTimeout(() => {
        setWaitTimeoutPassed(true);
      }, 500);
    } else if (waitTimeoutPassed) {
      setWaitTimeoutPassed(false);
    }
  }, [messages]);

  React.useEffect(() => {
    if (waitTimeoutPassed) {
      scrollToBottom();
    }
  }, [waitTimeoutPassed]);

  if (!conversation) {
    return null;
  }

  return {
    conversationHandler: conversation,
    inputValue,
    messages,
    waiting: isWaiting && waitTimeoutPassed,
    messagesContainerRef,
    setInputValue
  };
};
