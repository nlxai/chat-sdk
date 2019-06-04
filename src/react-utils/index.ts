import * as React from "react";
import createConversation, { Config, Conversation, Message } from "../index";

export const useChat = (
  config: Config
): {
  messages: Message[];
  inputValue: string;
  setInputValue: (val: string) => void;
  sendText: Conversation["sendText"];
  sendChoice: Conversation["sendChoice"];
  reset: Conversation["reset"];
} | null => {
  const [conversation, setConversation] = React.useState<null | Conversation>(
    null
  );

  const [messages, setMessages] = React.useState<Message[]>([]);

  const [inputValue, setInputValue] = React.useState<string>("");

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

  if (!conversation) {
    return null;
  }

  return {
    inputValue,
    setInputValue,
    sendText: conversation.sendText,
    sendChoice: conversation.sendChoice,
    reset: conversation.reset,
    messages
  };
};
