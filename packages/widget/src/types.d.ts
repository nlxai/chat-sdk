import { type Theme as ThemeType } from "./theme";
import "@emotion/react";

declare module "snarkdown";

declare module "@emotion/react" {
  export interface Theme {
    /** Primary color for interactive UI elements like buttons */
    primaryColor: string; 
    /** Background color for the dark chat bubbles (sent by the user) */
    darkMessageColor: string; 
    /** Background color for the light chat bubbles (sent by the bot) */
    lightMessageColor: string;
    /** Customized shade of white */
    white: string;
     /** Widget font family */
    fontFamily: string;
  }
}
