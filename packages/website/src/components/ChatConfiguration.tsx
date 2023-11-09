import React, { type FC, type ReactNode } from "react";
import {
  type Theme,
  type TitleBar,
  defaultTheme,
} from "@nlxai/chat-widget";
import { type Config } from "@nlxai/chat-core";
import { Behavior } from "../snippets";

export const getInitialConfig = (): Config => {
  const searchParams = new URLSearchParams(window.location.search);
  const botUrl = searchParams.get("botUrl") || "";
  const apiKey = searchParams.get("apiKey") || "";
  const languageCode = searchParams.get("languageCode") || "en-US";
  return {
    botUrl,
    headers: {
      "nlx-api-key": apiKey,
    },
    languageCode,
  };
};

const Labeled: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => {
  return (
    <label className="block space-y-0.5">
      <p className="text-xs text-gray-600">{label}</p>
      <div className="flex items-center space-x-2">{children}</div>
    </label>
  );
};

const inputClass = "text-sm px-1.5 py-1 block w-full rounded border border-gray-300";

export const TitleBarEditor: FC<{
  value: TitleBar;
  onChange: (val: Partial<TitleBar>) => void;
}> = (props) => {
  const titleBar = props.value;
  return (
    <div className="space-y-4">
      <Labeled label="Title">
        <input
          type="text"
          className={inputClass}
          placeholder="Enter title"
          value={titleBar.title}
          onInput={(ev: any) => {
            props.onChange({ title: ev.target.value });
          }}
        />
      </Labeled>
      <Labeled label="Icon URL (square)">
        <input
          type="text"
          className={inputClass}
          placeholder="Enter full icon URL"
          value={titleBar.logo}
          onInput={(ev: any) => {
            props.onChange({ logo: ev.target.value });
          }}
        />
      </Labeled>
    </div>
  );
};

export const ConfigEditor: FC<{
  value: Config;
  onChange: (val: Partial<Config>) => void;
}> = (props) => {
  const config = props.value;
  return (
    <div className="space-y-4">
      <Labeled label="Bot URL">
        <input
          type="url"
          placeholder="Enter bot URL"
          className={inputClass}
          value={config.botUrl}
          onInput={(ev: any) => {
            props.onChange({ botUrl: ev.target.value });
          }}
        />
      </Labeled>
      <Labeled label="API key">
        <input
          type="text"
          placeholder="Enter API key"
          className={inputClass}
          value={config.headers?.["nlx-api-key"]}
          onInput={(ev: any) => {
            props.onChange({ headers: { "nlx-api-key": ev.target.value } });
          }}
        />
      </Labeled>
      <Labeled label="Language code">
        <input
          type="text"
          placeholder="Enter language code"
          className={inputClass}
          value={config.languageCode}
          onInput={(ev: any) => {
            props.onChange({ headers: { languageCode: ev.target.value } });
          }}
        />
      </Labeled>
    </div>
  );
};

export const ThemeEditor: FC<{
  value: Partial<Theme>;
  onChange: (val: Partial<Theme>) => void;
}> = (props) => {
  const theme = props.value;
  return (
    <div className="space-y-4">
      <Labeled label="Font">
        <select
          className={inputClass}
          value={theme.fontFamily}
          onChange={(ev: any) => {
            props.onChange({
              fontFamily: ev.target.value || defaultTheme.fontFamily,
            });
          }}
        >
          <option value={""}>Default (system)</option>
          {["Helvetica", "Arial", "Monaco", "Georgia", "monospace"].map(
            (val) => (
              <option key={val} value={val}>
                {val}
              </option>
            )
          )}
        </select>
      </Labeled>
      <Labeled label="Primary color">
        <input
          type="color"
          value={theme.primaryColor}
          onInput={(ev: any) => {
            props.onChange({ primaryColor: ev.target.value });
          }}
        />
      </Labeled>
      <Labeled label="Dark message color">
        <input
          type="color"
          value={theme.darkMessageColor}
          onInput={(ev: any) => {
            props.onChange({ darkMessageColor: ev.target.value });
          }}
        />
      </Labeled>
      <Labeled label="Light message color">
        <input
          type="color"
          value={theme.lightMessageColor}
          onInput={(ev: any) => {
            props.onChange({ lightMessageColor: ev.target.value });
          }}
        />
      </Labeled>
      <Labeled label="Default white">
        <input
          type="color"
          value={theme.white}
          onInput={(ev: any) => {
            props.onChange({ white: ev.target.value });
          }}
        />
      </Labeled>
      <Labeled label="Spacing unit">
        <input
          type="range"
          min="6"
          max="24"
          step="1"
          value={theme.spacing}
          onInput={(ev: any) => {
            props.onChange({ spacing: Number(ev.target.value) });
          }}
        />
        <span className="text-xs text-gray-700">{theme.spacing}px</span>
      </Labeled>
      <Labeled label="Border radius">
        <input
          type="range"
          min="2"
          max="18"
          step="1"
          value={theme.borderRadius}
          onInput={(ev: any) => {
            props.onChange({ borderRadius: Number(ev.target.value) });
          }}
        />
        <span className="text-xs text-gray-700">{theme.borderRadius}px</span>
      </Labeled>
    </div>
  );
};

const RadioList = <T extends unknown>({
  selected,
  options,
  onChange,
}: {
  selected: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
}): ReactNode => {
  return (
    <div className="space-y-1">
      {options.map((option) => (
        <label key={option.label} className="flex items-center space-x-2">
          <input
            type="radio"
            checked={option.value === selected}
            onChange={() => {
              onChange(option.value);
            }}
          />{" "}
          <p className="text-sm text-gray-800">{option.label}</p>
        </label>
      ))}
    </div>
  );
};

export const BehaviorEditor: FC<{
  behavior: Behavior;
  setBehavior: (val: Behavior) => void;
}> = ({ behavior, setBehavior }) => {
  return (
    <RadioList
      selected={behavior}
      onChange={setBehavior}
      options={[
        { value: Behavior.Simple, label: "Simple chat" },
        {
          value: Behavior.WelcomeIntentOnOpen,
          label: "Send welcome intent when the chat is opened",
        },
        {
          value: Behavior.CustomIntentOnInactivity,
          label: "Send custom intent after a period of inactivity",
        },
        {
          value: Behavior.UseSessionStorage,
          label: "Retain conversation through refreshes (SessionStorage)",
        },
        {
          value: Behavior.UseLocalStorage,
          label:
            "Retain conversation through refreshes and closed browser sessions (LocalStorage)",
        },
      ]}
    />
  );
};

export const saveTheme = (theme: Partial<Theme>) => {
  localStorage.setItem("nlxchat-theme", JSON.stringify(theme));
};

export const retrieveTheme = (): Partial<Theme> | null => {
  try {
    const themeString = localStorage.getItem("nlxchat-theme");
    const theme = JSON.parse(themeString || "");
    if (typeof theme !== "object") {
      throw new Error("Invalid theme");
    }
    return theme;
  } catch (_err) {
    return null;
  }
};

export const saveTitleBar = (theme: TitleBar) => {
  localStorage.setItem("nlxchat-titleBar", JSON.stringify(theme));
};

export const retrieveTitleBar = (): TitleBar | null => {
  try {
    const titleBarString = localStorage.getItem("nlxchat-titleBar");
    const titleBar = JSON.parse(titleBarString || "");
    if (typeof titleBar !== "object") {
      throw new Error("Invalid theme");
    }
    return titleBar;
  } catch (_err) {
    return null;
  }
};
