import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
`;

export const CustomWidgetsGettingStarted = () => {
  return (
    <>
      <PageTitle pretitle="Custom widgets" title="Getting started" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
