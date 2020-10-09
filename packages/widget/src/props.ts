import { Config, ConversationHandler } from "@nlxchat/core";
import { Theme } from "./theme";

export interface Props {
  config: Config;
  theme?: Partial<Theme>;
  chatIcon?: string;
  titleBar?: {
    downloadable?: boolean;
    logo?: string;
    title: string;
  };
  bubble?: string;
  inputPlaceholder?: string;
  initiallyExpanded?: boolean;
  lowLevel?: (conversationHandler: ConversationHandler) => void;
}
