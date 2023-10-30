import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
`;

export const CustomWidgetsOther = () => {
  return (
    <>
      <PageTitle pretitle="Custom widgets" title="Other frameworks" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
