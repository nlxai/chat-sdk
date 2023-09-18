import { type Config, type ConversationHandler } from "@nlxchat/core";
import { type Theme } from "./theme";

export interface TitleBar {
  downloadable?: boolean;
  logo?: string;
  title: string;
}

export type StorageType = "localStorage" | "sessionStorage";

export interface Props {
  config: Config;
  theme?: Partial<Theme>;
  titleBar?: TitleBar;
  chatIcon?: string;
  bubble?: string;
  inputPlaceholder?: string;
  initiallyExpanded?: boolean;
  loaderMessage?: string;
  showLoaderMessageAfter?: number;
  persistIn?: StorageType;
  onExpand?: (conversationHandler: ConversationHandler) => void;
  onCollapse?: (conversationHandler: ConversationHandler) => void;
}
