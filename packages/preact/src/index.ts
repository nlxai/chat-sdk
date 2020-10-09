import { Ref, useState, useEffect, useRef } from "preact/hooks";

// Code from here on out is identical in the React and Preact packages
import last from "ramda/src/last";
import createConversation, {
  Config,
  ConversationHandler,
  Message,
} from "@nlxchat/core";

export interface ChatHook {
  conversationHandler: ConversationHandler;
  inputValue: string;
  messages: Message[];
  messagesContainerRef: Ref<HTMLDivElement>;
  waiting: boolean;
  setInputValue: (val: string) => void;
}

export const useChat = (config: Config): ChatHook | null => {
  const [conversation, setConversation] = useState<null | ConversationHandler>(
    null
  );

  const [messages, setMessages] = useState<Message[]>([]);

  const [inputValue, setInputValue] = useState<string>("");

  const [waitTimeoutPassed, setWaitTimeoutPassed] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversation(createConversation(config));
    return () => {};
  }, []);

  useEffect(() => {
    conversation &&
      conversation.subscribe((msgs) => {
        setMessages(msgs);
      });
    return () => {
      conversation && conversation.unsubscribeAll();
    };
  }, [conversation]);

  const scrollToBottom = () => {
    const node = messagesContainerRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const lastMessage = last(messages);
  const isWaiting = lastMessage ? lastMessage.author === "user" : false;

  useEffect(() => {
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

  useEffect(() => {
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
    setInputValue,
  };
};
