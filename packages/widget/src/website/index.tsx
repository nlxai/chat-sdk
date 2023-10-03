import React, {
  type FC,
  type ReactNode,
  useState,
  useEffect,
  useRef,
  createElement,
} from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import htm from "htm";
import {
  Widget,
  type Theme,
  type CustomModalityComponent,
  type TitleBar,
  defaultTheme,
  useConversationHandler,
} from "../";
import { type Config } from "@nlxchat/core";
import "./index.css";
import { documentModalityCode, sendWelcomeOnTimeoutSnippet } from "./snippets";

const CodeEditor: FC<{ code: string }> = (props) => {
  const codeRef = useRef(null);

  useEffect(() => {
    (window as any).hljs.highlightElement(codeRef.current);
  }, [props.code]);

  return (
    <div className="code-editor">
      <a
        href={window.URL.createObjectURL(
          new Blob([props.code], {
            type: "text/plain",
          })
        )}
        download={`index.html`}
      >
        <DownloadIcon />
      </a>
      <pre key={props.code}>
        <code
          ref={codeRef}
          className="language-html"
          dangerouslySetInnerHTML={{ __html: escapeForHighlightJs(props.code) }}
        ></code>
      </pre>
    </div>
  );
};

interface Document {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  url: string;
}

const html = htm.bind(createElement);

const customModalities: Record<string, CustomModalityComponent> = {
  Hotels: ({ data }: { data: Document[] }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = data.find((document) => document.id === selectedId);

    const portalContainer = document.querySelector("#portal");

    const handler = useConversationHandler();

    return html`
      ${selected && portalContainer
        ? createPortal(
            html`<div className="popover-container">
              <div className="popover">
                <div className="popover-title">
                  <h1>${selected.name}</h1>
                  <button
                    className="popover-close"
                    onClick=${() => {
                      setSelectedId(null);
                    }}
                  >
                    <${CloseIcon} />
                  </button>
                </div>
                <img src=${selected.imageUrl} alt="${selected.name} photo" />
                <div className="popover-content">
                  <p>${selected.description}</p>
                  <button
                    className="cta-button"
                    onClick=${() => {
                      handler?.sendChoice(selected.id);
                    }}
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>`,
            portalContainer
          )
        : null}
      <div className="slides-container">
        <div className="slides">
          ${data.map(
            (document) =>
              html`<div
                className=${`slide ${
                  selectedId === document.id ? "slide--active" : ""
                }`}
                key=${document.id}
                onClick=${() => {
                  setSelectedId(document.id);
                }}
              >
                <div className="slide-title">${document.name}</div>
                <div
                  className="slide-image"
                  style=${{
                    backgroundImage: `url(${document.imageUrl})`,
                  }}
                />
                <div className="slide-description">
                  ${document.description.substr(0, 100)}${document.description
                    .length > 98
                    ? "..."
                    : ""}
                </div>
              </div>`
          )}
        </div>
      </div>
    `;
  },
};

const CloseIcon: FC<{}> = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const GitHubIcon: FC<{}> = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0012 1.27" />
  </svg>
);

const DownloadIcon: FC<{}> = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
  </svg>
);

const Labeled: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => {
  return (
    <label>
      <p className="label-text">{label}</p>
      <div>{children}</div>
    </label>
  );
};

const TitleBarEditor: FC<{
  value: TitleBar;
  onChange: (val: Partial<TitleBar>) => void;
}> = (props) => {
  const titleBar = props.value;
  return (
    <>
      <Labeled label="Title">
        <input
          type="text"
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
          placeholder="Enter full icon URL"
          value={titleBar.logo}
          onInput={(ev: any) => {
            props.onChange({ logo: ev.target.value });
          }}
        />
      </Labeled>
      <Labeled label="Downloadable">
        <input
          type="checkbox"
          checked={titleBar.downloadable}
          onChange={(ev: any) => {
            props.onChange({ downloadable: ev.target.checked });
          }}
        />
      </Labeled>
    </>
  );
};

const ConfigEditor: FC<{
  value: Config;
  onChange: (val: Partial<Config>) => void;
}> = (props) => {
  const config = props.value;
  return (
    <>
      <Labeled label="Bot URL">
        <input
          type="url"
          placeholder="Enter bot URL"
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
          value={config.languageCode}
          onInput={(ev: any) => {
            props.onChange({ headers: { languageCode: ev.target.value } });
          }}
        />
      </Labeled>
    </>
  );
};

const ThemeEditor: FC<{
  value: Partial<Theme>;
  onChange: (val: Partial<Theme>) => void;
}> = (props) => {
  const theme = props.value;
  return (
    <>
      <Labeled label="Font">
        <select
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
        <span>{theme.spacing}px</span>
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
        <span>{theme.borderRadius}px</span>
      </Labeled>
    </>
  );
};

const escapeForHighlightJs = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

enum Behavior {
  Simple,
  WelcomeIntentOnOpen,
  CustomIntentOnInactivity,
  UseSessionStorage,
  UseLocalStorage,
  CustomModalities,
}

const indentBy = (indendStr: string, str: string) =>
  str
    .split("\n")
    .map((str, index) => `${index === 0 ? "" : indendStr}${str}`)
    .join("\n");

const getInitialConfig = (): Config => {
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
    <div>
      {options.map((option) => (
        <label key={option.label} className="radio">
          <input
            type="radio"
            checked={option.value === selected}
            onChange={() => {
              onChange(option.value);
            }}
          />{" "}
          <p>{option.label}</p>
        </label>
      ))}
    </div>
  );
};

const App = () => {
  const [theme, setTheme] = useState<Partial<Theme>>(defaultTheme);

  const [config, setConfig] = useState<Config>(getInitialConfig());

  const [titleBar, setTitleBar] = useState<TitleBar>({
    title: "Support",
    downloadable: false,
  });

  const [loaderMessage, setLoaderMessage] = useState<string>(
    "Your request is taking longer than expected, please wait"
  );

  const [behavior, setBehavior] = useState<Behavior>(Behavior.Simple);

  const code = `<!-- Chat widget sample HTML -->
<!-- Downloaded from https://nlxai.github.io/chat-sdk -->
<html lang="en">
  <head>
    <title>NLX Widget Sample HTML</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <script defer src="https://unpkg.com/@nlxchat/widget@2.0.0-alpha.13/lib/umd/index.js"></script>
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/htm/3.1.1/htm.js" integrity="sha512-RilD4H0wcNNxG2GvB+L1LRXCntT0zgRvRLnmGu+e9wWaLKGkPifz3Ozb6+WPsyEkTBLw6zWCwwEjs9JLL1KIHg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script>
      window.addEventListener("DOMContentLoaded", () => {
        const widget = nlxChat.widget.create({
          config: {
            botUrl: "${config.botUrl}",
            headers: {
              "nlx-api-key": "${config.headers?.["nlx-api-key"] || ""}"
            },
            languageCode: "${config.languageCode}"
          },
          titleBar: ${indentBy(
            "          ",
            JSON.stringify(titleBar, null, 2)
          )},${
    behavior === Behavior.WelcomeIntentOnOpen
      ? indentBy(
          "          ",
          `
// CUSTOM BEHAVIOR SNIPPET
onExpand: (conversationHandler) => {
  const checkMessages = (messages) => {
    if (messages.length === 0) {
      conversationHandler.sendWelcomeIntent();
    }
    conversationHandler.unsubscribe(checkMessages);
  }
  conversationHandler.subscribe(checkMessages);
},
// CUSTOM BEHAVIOR SNIPPET END`
        )
      : behavior === Behavior.UseSessionStorage
      ? indentBy(
          "          ",
          `
// CUSTOM BEHAVIOR SNIPPET
storeIn: "sessionStorage",
// CUSTOM BEHAVIOR SNIPPET END`
        )
      : behavior === Behavior.UseLocalStorage
      ? indentBy(
          "          ",
          `
// CUSTOM BEHAVIOR SNIPPET
storeIn: "localStorage",
// CUSTOM BEHAVIOR SNIPPET END`
        )
      : behavior === Behavior.CustomModalities
      ? indentBy(
          "          ",
          `
// CUSTOM BEHAVIOR SNIPPET
customModalities: {
  ${documentModalityCode}
},
// CUSTOM BEHAVIOR SNIPPET END`
        )
      : ""
  }
          theme: ${indentBy("          ", JSON.stringify(theme, null, 2))}
        });${
          behavior === Behavior.CustomIntentOnInactivity
            ? indentBy(
                "        ",
                `
// CUSTOM BEHAVIOR SNIPPET
${sendWelcomeOnTimeoutSnippet}
// CUSTOM BEHAVIOR SNIPPET END`
              )
            : ""
        }
      });
    </script>
    <div id="portal"></div>
  </body>
</html>`;

  return (
    <>
      <header>
        <a className="logo">
          <svg viewBox="0 -5 24 24" fill="currentColor" stroke="none">
            <path d="M13.4947 11.5021C12.8648 11.5021 12.4698 11.0728 12.4698 10.5147V1.3282C12.4698 0.73558 11.9917 0.255005 11.4021 0.255005C10.8126 0.255005 10.3345 0.73558 10.3345 1.3282V10.5147C10.3345 11.1073 10.8126 11.5879 11.4021 11.5879C11.9327 11.5879 12.363 11.9957 12.363 12.6074C12.363 13.2297 12.865 13.7343 13.484 13.7343C14.103 13.7343 14.605 13.2297 14.605 12.6074C14.605 11.9852 14.1246 11.5021 13.4947 11.5021Z"></path>
            <path d="M7.40712 5.859C6.87545 5.859 6.4484 5.44925 6.4484 4.83753C6.4484 4.20435 5.97865 3.68922 5.33808 3.68922C4.69751 3.68922 4.20641 4.26874 4.20641 4.83753C4.20641 5.40633 3.75801 5.81414 3.24555 5.81414C2.7331 5.81414 2.2847 5.41706 2.2847 4.84827C2.2847 4.20435 1.75089 3.68922 1.11032 3.68922C0.469751 3.68922 0 4.21508 0 4.84827C0 5.50291 0.501993 5.96439 1.121 5.96439C1.66548 5.96439 2.11345 6.39259 2.11345 6.95108C2.11345 7.50957 1.67637 7.89613 1.15302 7.89613C0.563488 7.89613 0.0854093 8.33378 0.0854093 8.9264C0.0854093 8.9264 0.0854092 12.747 0.0890391 12.7455C0.0890391 13.305 0.591673 13.7343 1.15302 13.7343C1.71438 13.7343 2.21701 13.305 2.21701 12.7455L2.2232 8.9264C2.22064 8.49712 2.7331 8.06999 3.2432 8.06999L3.24555 8.06784L3.24534 8.06763C3.85601 8.06205 4.35587 7.57417 4.35587 6.93026C4.35587 6.40877 4.76715 5.98372 5.2814 5.96503L5.33872 5.96503C5.8721 5.96503 6.27758 6.40418 6.27758 6.93026V12.6611C6.27758 13.2537 6.75566 13.7343 7.3452 13.7343C7.93473 13.7343 8.41281 13.2537 8.41281 12.6611V6.93026C8.41281 6.35846 7.939 5.859 7.40712 5.859ZM5.33808 5.96439L5.30807 5.96443C5.31095 5.9644 5.31384 5.96439 5.31673 5.96439H5.33808ZM5.33786 5.96417L5.33808 5.96439C5.33808 5.96439 5.33808 5.96417 5.33786 5.96417Z"></path>
            <path d="M24 6.8444C24 7.43702 23.5302 7.9176 22.8256 7.9176C22.2512 7.9176 21.843 8.20714 21.8231 8.71712C21.843 9.22711 22.2512 9.51665 22.8256 9.51665C23.5302 9.51665 24 9.99723 24 10.5898V12.6718C24 13.2645 23.5219 13.745 22.9324 13.745C22.3428 13.745 21.8648 13.2645 21.8648 12.6718C21.8648 12.6718 21.8652 11.1479 21.8652 10.6107C21.8652 10.0734 21.4345 9.64544 20.9039 9.64544H19.4093C18.8786 9.64544 18.448 10.0734 18.448 10.6107C18.448 11.1479 18.4484 12.6718 18.4484 12.6718C18.4484 13.2645 17.9703 13.745 17.3808 13.745C16.7912 13.745 16.3132 13.2645 16.3132 12.6718V10.5898C16.3132 9.99723 16.7829 9.51665 17.4875 9.51665C18.0621 9.51665 18.4702 9.22711 18.49 8.71712C18.4702 8.20714 18.0619 7.9176 17.4875 7.9176C16.7829 7.9176 16.3132 7.43702 16.3132 6.8444V4.78388C16.3132 4.19126 16.7912 3.71068 17.3808 3.71068C17.9703 3.71068 18.4484 4.19126 18.4484 4.78388C18.4484 4.78388 18.448 6.28634 18.448 6.82358C18.448 7.36082 18.8786 7.76735 19.4093 7.76735H20.9039C21.4345 7.76735 21.8652 7.36082 21.8652 6.82358C21.8652 6.28634 21.8648 4.78388 21.8648 4.78388C21.8648 4.19126 22.3428 3.71068 22.9324 3.71068C23.5219 3.71068 24 4.19126 24 4.78388V6.8444Z"></path>
          </svg>
          <span>Chat SDK</span>
        </a>
        <nav>
          <a href="https://github.com/nlxai/chat-sdk">
            <GitHubIcon />
          </a>
        </nav>
      </header>
      <main>
        <div>
          <section>
            <p className="body">
              The Chat SDK contains a number of packages designed to seamlessly
              integrate with NLX conversational experiences on your website,
              mobile app or web server.
            </p>
          </section>
          <section>
            <div className="section-title">
              <h2>Configuration</h2>
            </div>
            <ConfigEditor
              value={config}
              onChange={(val) => {
                setConfig((prev) => ({ ...prev, ...val }));
              }}
            />
          </section>
          <section>
            <div className="section-title">
              <h2>Theme</h2>
            </div>
            <ThemeEditor
              value={theme}
              onChange={(val) => {
                setTheme((prev) => ({ ...prev, ...val }));
              }}
            />
          </section>
          <section>
            <div className="section-title">
              <h2>User interface</h2>
            </div>
            <TitleBarEditor
              value={titleBar}
              onChange={(val) => {
                setTitleBar((prev) => ({ ...prev, ...val }));
              }}
            />
            <Labeled label="Loader message">
              <input
                type="text"
                value={loaderMessage}
                onChange={(ev) => setLoaderMessage(ev.target.value)}
              />
            </Labeled>
          </section>
          <section>
            <div className="section-title">
              <h2>Behavior</h2>
            </div>
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
                  label:
                    "Retain conversation through refreshes (SessionStorage)",
                },
                {
                  value: Behavior.UseLocalStorage,
                  label:
                    "Retain conversation through refreshes and closed browser sessions (LocalStorage)",
                },
                {
                  value: Behavior.CustomModalities,
                  label: "Custom UI element rendering (advanced)",
                },
              ]}
            />
            <blockquote>
              Note: these behavior settings only change the generated code
              snippet below and are not available interactively on this page.
            </blockquote>
          </section>
        </div>
        <div>
          <CodeEditor code={code} />
        </div>
      </main>
      <Widget
        config={config}
        theme={theme}
        titleBar={titleBar}
        loaderMessage={loaderMessage}
        customModalities={customModalities}
      />
    </>
  );
};

createRoot(document.getElementById("app") as Element).render(<App />);
