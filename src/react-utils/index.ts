import * as React from "react";
import createConversation, {
  Config,
  ConversationHandler,
  Message
} from "../index";

export const useChat = (
  config: Config
): {
  conversationHandler: ConversationHandler;
  inputValue: string;
  messages: Message[];
  messagesContainerRef: React.Ref<HTMLDivElement> | null;
  setInputValue: (val: string) => void;
} | null => {
  const [
    conversation,
    setConversation
  ] = React.useState<null | ConversationHandler>(null);

  const [messages, setMessages] = React.useState<Message[]>([]);

  const [inputValue, setInputValue] = React.useState<string>("");

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

  React.useEffect(() => {
    const node =
      messagesContainerRef !== null &&
      (messagesContainerRef as { current: HTMLElement | null }).current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  if (!conversation) {
    return null;
  }

  return {
    conversationHandler: conversation,
    inputValue,
    messages,
    messagesContainerRef,
    setInputValue
  };
};
