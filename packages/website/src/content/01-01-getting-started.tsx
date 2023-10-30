import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
This is the official JavaScript SDK to communicate with conversational bots created using NLX Dialog Studio. It contains the following packages:
* [@nlxai/chat-widget](https://www.npmjs.com/package/@nlxai/chat-widget): the official out-of-the-box, lightly themeable NLX widget.
* [@nlxai/chat-react](https://www.npmjs.com/package/@nlxai/chat-react): React custom hook for building chat widgets.
* [@nlxai/chat-preact](https://www.npmjs.com/package/@nlxai/chat-preact): Preact custom hook for building chat widgets.
* [@nlxai/chat-core](https://www.npmjs.com/package/@nlxai/chat-core): vanilla JavaScript SDK for creating fully custom chat widgets.
`;

export const GettingStarted = () => {
  return (
    <>
      <PageTitle pretitle="Introduction" title="Getting started" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
