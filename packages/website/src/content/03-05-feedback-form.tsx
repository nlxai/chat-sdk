import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
`;

export const WebWidgetComponentsFeedbackForm = () => {
  return (
    <>
      <PageTitle pretitle="Web widget components" title="Feedback form" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
