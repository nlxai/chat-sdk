import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
To install

\`\`\`css
npm instal @nlxai/chat-widget
\`\`\`
`;

export const Installation = () => {
  return (
    <>
      <PageTitle pretitle="Install" title="Installation" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
