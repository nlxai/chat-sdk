import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
`;

export const WebWidgetComponentsDatePicker = () => {
  return (
    <>
      <PageTitle pretitle="Web widget components" title="Date picker" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
