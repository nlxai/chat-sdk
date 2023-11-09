import { useState, useEffect, useRef, useMemo } from "react";

// Code from here on out is identical in the React and Preact packages
import { last } from "ramda";
import createConversation, {
  Config,
  ConversationHandler,
  shouldReinitialize,
  Response
} from "@nlxai/chat-core";

export interface ChatHook {
  conversationHandler: ConversationHandler;
  inputValue: string;
  setInputValue: (val: string) => void;
  responses: Array<Response>;
  waiting: boolean;
}

export const useChat = (config: Config): ChatHook => {
  const prevConversationHandler = useRef<ConversationHandler | null>(null);
  const prevConfig = useRef<Config | null>(null);

  useEffect(() => {
    prevConfig.current = config;
  }, [config]);

  const conversationHandler: ConversationHandler = useMemo(() => {
    // Prevent re-initialization if backend-related props have not changed
    if (
      prevConfig.current &&
      prevConversationHandler.current &&
      !shouldReinitialize(prevConfig.current, config)
    ) {
      return prevConversationHandler.current;
    }
    const newHandler = createConversation(config);
    prevConversationHandler.current = newHandler;
    return newHandler;
  }, [config]);

  const [responses, setResponses] = useState<Array<Response>>([]);

  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setResponses([]);
    conversationHandler.subscribe(setResponses);
    return () => {
      conversationHandler.destroy();
    };
  }, [conversationHandler]);

  const lastMessage = last<Response>(responses);
  const isWaiting = lastMessage ? lastMessage.type === "user" : false;

  return {
    conversationHandler,
    inputValue,
    responses,
    waiting: isWaiting,
    setInputValue
  };
};

export default useChat;
