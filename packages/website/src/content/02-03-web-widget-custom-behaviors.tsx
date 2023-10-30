import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
`;

export const WebWidgetCustomBehaviors = () => {
  return (
    <>
      <PageTitle pretitle="Web widget" title="Custom behaviors" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
