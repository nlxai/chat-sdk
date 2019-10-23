import createConversation, { Config } from "../index";

export interface Props {
  config: Config;
  theme?: Partial<Theme>;
  chatIcon?: string;
  titleBar?: {
    downloadable?: boolean;
    logo?: string;
    title: string;
  };
  inputPlaceholder?: string;
  initiallyExpanded?: boolean;
}

// Colors may be in any CSS-compatible format like rgb(50, 50, 50) or #aaa
export interface Theme {
  primaryColor: string;
  darkMessageColor: string;
  lightMessageColor: string;
  white: string;
  fontFamily: string;
}
