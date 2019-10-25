import genericStyled, { CreateStyled } from "@emotion/styled";
import { Theme } from "../types";
import * as constants from "./constants";
import tinycolor from "tinycolor2";

const styled = genericStyled as CreateStyled<Theme>;

// Styled components

export const Container = styled.div<{}>`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  height: calc(100vh - 120px);
  border-radius: 10px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.3);
  background-color: ${props => props.theme.white};

  & > *,
  & > button {
    font-family: ${props => props.theme.fontFamily};
  }
`;

export const Main = styled.div<{}>`
  height: calc(100% - ${constants.bottomHeight}px);
  overflow: auto;
`;

export const MessageGroups = styled.div<{}>`
  padding: 20px;
  box-sizing: border-box;

  & > * {
    margin-bottom: 20px;
  }

  & > :last-child {
    margin-bottom: 0px;
  }
`;

export const MessageGroup = styled.div<{}>`
  display: flex;
  flex-direction: column;

  & > * {
    margin-bottom: 3px;
  }

  & > :last-child {
    margin-bottom: 0px;
  }
`;

export const Message = styled.div<{ type: "user" | "bot" }>`
  background-color: ${props =>
    props.type === "user"
      ? props.theme.darkMessageColor
      : props.theme.lightMessageColor};
  color: ${props => (props.type === "user" ? props.theme.white : "#000")};
  padding: 6px 10px;
  max-width: calc(100% - 20px);
  ${props =>
    props.type === "user"
      ? "margin-left: 20px; margin-right: 0; border-radius: 10px 10px 0 10px; align-self: flex-end;"
      : "margin-right: 20px; margin-left: 0; border-radius: 10px 10px 10px 0; align-self: flex-start;"}
`;

export const MessageBody = styled.p<{}>`
  margin: 0;
  font-size: ${constants.fontSize}px;
  a,
  a:visited {
    color: inherit;
  }
  img {
    max-width: 80px;
    max-height: 60px;
  }
`;

export const Bottom = styled.div<{}>`
  height: ${constants.bottomHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-top: 1px solid #cecece;

  > * {
    margin-right: 10px;
  }

  > :last-child {
    margin-right: 0;
  }
`;

export const hoverBg = `
  :hover::after {
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

export const focusShadow = (theme: Theme) => `
  box-shadow: 0 0 0 3px ${tinycolor(theme.primaryColor)
    .setAlpha(0.15)
    .toRgbString()};
`;

export const IconButton = styled.button<{ disabled?: boolean }>`
  height: 35px;
  width: 35px;
  border-radius: 18px;
  padding: 8px;
  font-size: ${constants.fontSize}px;
  ${props =>
    props.disabled
      ? `
  opacity: 0.6;
  `
      : `
  `}
  border: 0;
  box-shadow: none;
  background-color: ${props => props.theme.primaryColor};
  color: ${props => props.theme.white};
  position: relative;
  cursor: pointer;

  :focus {
    outline: none;
    ${props => focusShadow(props.theme)}
  }

  ${hoverBg}
`;

export const Input = styled.input<{}>`
  display: block;
  flex: 1;
  height: 35px;
  border-radius: 18px;
  padding: 0 14px;
  border: 1px solid #cecece;
  font-size: ${constants.fontSize}px;
  font-family: ${props => props.theme.fontFamily};

  :focus {
    outline: none;
    border: 1px solid ${props => props.theme.primaryColor};
    ${props => focusShadow(props.theme)}
  }
`;

export const Pin = styled.button<{}>`
  position: fixed;
  background-color: ${props => props.theme.primaryColor};
  border: 0;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  cursor: pointer;
  padding: 15px;
  color: ${props => props.theme.white};
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.6);

  :focus {
    outline: none;
  }

  > img {
    max-width: 30px;
    max-height: 30px;
  }

  ${hoverBg}
`;

export const ChoicesContainer = styled.div<{}>`
  margin-top: 10px;

  > * {
    margin-right: 10px;
  }

  > :last-child {
    margin-right: 0px;
  }
`;

export const ChoiceButton = styled.button<{
  disabled?: boolean;
  selected?: boolean;
}>`
  ${props =>
    props.selected
      ? `
  background-color: ${props.theme.primaryColor};
  color: ${props.theme.white};
  `
      : `
  background-color: ${props.theme.white};
  color: ${props.theme.primaryColor};
  `}
  ${props =>
    props.disabled
      ? `
  opacity: 0.4;
      `
      : `
  cursor: pointer;
  :hover {
    background-color: #efefef;
  }

  :focus {
    outline: none;
    ${focusShadow(props.theme)}
  }
      `}
  height: 30px;
  border-radius: 15px;
  border: 1px solid ${props => props.theme.primaryColor};
  font-size: ${constants.fontSize}px;
  font-family: ${props => props.theme.fontFamily};
  padding: 0 10px;

  :focus {
    outline: none;
  }
`;

export const TitleBar = styled.div<{}>`
  height: 48px;
  padding: 0 20px;
  border-bottom: 1px solid #cecece;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TitleContainer = styled.div<{}>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const Title = styled.p<{}>`
  font-size: 20px;
  font-weight: bold;
  font-family: ${props => props.theme.fontFamily};
`;

export const DiscreteIconButton = styled.button<{}>`
  width: 22px;
  height: 22px;
  display: block;
  padding: 2px;
  color: #ababab;
  border: 0;
  cursor: pointer;
  background: none;
  :hover {
    color: #000000;
  }
  :focus {
    outline: none;
    box-shadow: 0 0 0 3px #dedede;
  }
`;

export const DiscreteButton = styled.button<{}>`
  color: #ababab;
  border: 1px solid currentColor;
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  text-transform: uppercase;
  border-radius: 4px;
  padding: 4px 8px;
  :hover {
    color: #000000;
  }
  :focus {
    outline: none;
    box-shadow: 0 0 0 3px #dedede;
  }
  > svg {
    width: 10px;
    height: 10px;
    margin-right: 6px;
  }
`;

export const TitleIcon = styled.img<{}>`
  width: 24px;
  height: 24px;
  margin-right: 6px;
`;
