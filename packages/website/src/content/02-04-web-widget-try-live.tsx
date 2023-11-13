import React, { useState, useEffect } from "react";
import { PageTitle } from "../components/PageTitle";
import { type Config } from "@nlxai/chat-core";
import {
  Widget,
  type Theme,
  type TitleBar,
  defaultTheme,
} from "@nlxai/chat-widget";
import { PageContent } from "../components/PageContent";
import {
  ThemeEditor,
  TitleBarEditor,
  ConfigEditor,
  getInitialConfig,
  saveTheme,
  saveTitleBar,
  retrieveTitleBar,
  retrieveTheme,
} from "../components/ChatConfiguration";
import { Note } from "../components/Note";
import { setupSnippet, Behavior } from "../snippets";

export const content = `
You can try your bots directly on this configuration widget.
`;

export const snippetContent = ({
  config,
  titleBar,
  theme,
  behavior,
}: {
  config: Config;
  titleBar: TitleBar;
  theme: Partial<Theme>;
  behavior: Behavior;
}) => `

### Setup snippet

\`\`\`html
${setupSnippet({ config, titleBar, theme, behavior })}
\`\`\`
`;

export const WebWidgetTryLive = () => {
  const [config, setConfig] = useState<Config>(getInitialConfig());

  const [theme, setTheme] = useState<Partial<Theme>>(
    retrieveTheme() || defaultTheme,
  );

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  const [titleBar, setTitleBar] = useState<TitleBar>(
    retrieveTitleBar() || {
      title: "Support",
    },
  );

  useEffect(() => {
    saveTitleBar(titleBar);
  }, [titleBar]);

  return (
    <>
      <PageTitle pretitle="Web widget" title="Try live" />
      <PageContent md={content} />
      <Note
        title="Important"
        body="In order for the bot communication to work, make sure that this webpage is added to the whitelisted URL list of your API channel."
      />
      <div className="mt-6 space-y-4">
        <ConfigEditor
          value={config}
          onChange={(val) => {
            setConfig((prev) => ({ ...prev, ...val }));
          }}
        />
        <ThemeEditor
          value={theme}
          onChange={(val) => {
            setTheme((prev) => ({ ...prev, ...val }));
          }}
        />
        <TitleBarEditor
          value={titleBar}
          onChange={(val) => {
            setTitleBar((prev) => ({ ...prev, ...val }));
          }}
        />
        <PageContent
          md={snippetContent({
            config,
            theme,
            titleBar,
            behavior: Behavior.Simple,
          })}
        />
      </div>
      <Widget config={config} theme={theme} titleBar={titleBar} />
    </>
  );
};
