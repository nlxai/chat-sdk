import { type Config, type ConversationHandler } from "@nlxchat/core";
import { type Theme } from "./theme";

export interface TitleBar {
  downloadable?: boolean;
  logo?: string;
  title: string;
}

export interface Props {
  config: Config;
  theme?: Partial<Theme>;
  chatIcon?: string;
  titleBar?: TitleBar;
  onExpand?: (conversationHandler: ConversationHandler) => void;
  onCollapse?: (conversationHandler: ConversationHandler) => void;
  bubble?: string;
  inputPlaceholder?: string;
  initiallyExpanded?: boolean;
  useSessionStorage?: boolean;
  lowLevel?: (conversationHandler: ConversationHandler) => void;
}
