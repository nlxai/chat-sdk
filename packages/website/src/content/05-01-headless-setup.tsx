import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
`;

export const HeadlessSetup = () => {
  return (
    <>
      <PageTitle pretitle="Headless API" title="Setup" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
