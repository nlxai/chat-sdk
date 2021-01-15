import { Ref, useState, useEffect, useRef, useMemo } from "react";

// Code from here on out is identical in the React and Preact packages
import last from "ramda/src/last";
import createConversation, {
  Config,
  ConversationHandler,
  Response,
} from "@nlxchat/core";

export interface ChatHook {
  conversationHandler: ConversationHandler;
  inputValue: string;
  responses: Array<Response>;
  messagesContainerRef: Ref<HTMLDivElement>;
  waiting: boolean;
  setInputValue: (val: string) => void;
}

export const useChat = (config: Config): ChatHook => {
  const conversation: ConversationHandler = useMemo(
    () => createConversation(config),
    []
  );

  const [responses, setResponses] = useState<Array<Response>>([]);

  const [inputValue, setInputValue] = useState<string>("");

  const [waitTimeoutPassed, setWaitTimeoutPassed] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversation.subscribe(setResponses);
    return () => {
      conversation.unsubscribeAll();
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
  }, [responses]);

  const lastMessage = last<Response>(responses);
  const isWaiting = lastMessage ? lastMessage.type === "user" : false;

  useEffect(() => {
    const lastMessage = last<Response>(responses);
    const isWaiting = lastMessage ? lastMessage.type === "user" : false;
    if (isWaiting) {
      setTimeout(() => {
        setWaitTimeoutPassed(true);
      }, 500);
    } else if (waitTimeoutPassed) {
      setWaitTimeoutPassed(false);
    }
  }, [responses]);

  useEffect(() => {
    if (waitTimeoutPassed) {
      scrollToBottom();
    }
  }, [waitTimeoutPassed]);

  return {
    conversationHandler: conversation,
    inputValue,
    responses,
    waiting: isWaiting && waitTimeoutPassed,
    messagesContainerRef,
    setInputValue,
  };
};
