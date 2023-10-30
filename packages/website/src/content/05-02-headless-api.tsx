import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
`;

export const HeadlessApi = () => {
  return (
    <>
      <PageTitle pretitle="Headless API" title="API Reference" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
