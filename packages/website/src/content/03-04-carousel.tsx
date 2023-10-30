import React from "react";
import { PageTitle } from "../components/PageTitle";
import Markdown from "react-markdown";
import { Prose } from "../components/Prose";

const content = `
`;

export const WebWidgetComponentsCarousel = () => {
  return (
    <>
      <PageTitle pretitle="Web widget components" title="Carousel" />
      <Prose>
        <Markdown>{content}</Markdown>
      </Prose>
    </>
  );
};
