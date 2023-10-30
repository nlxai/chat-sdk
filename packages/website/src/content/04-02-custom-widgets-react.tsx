import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
`;

export const CustomWidgetsReact = () => {
  return (
    <>
      <PageTitle pretitle="Custom widgets" title="React & Preact" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
