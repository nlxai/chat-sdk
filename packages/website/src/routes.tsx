import React, { type ReactNode, type FC } from "react";
import { flatten } from "ramda";
import { Routes, Route } from "react-router-dom";
import { GettingStarted } from "./content/01-01-getting-started";
import { Installation } from "./content/01-02-installation";

export const routes: {
  heading: string;
  items: { label: string; url: string; element: ReactNode }[];
}[] = [
  {
    heading: "Introduction",
    items: [
      {
        label: "Getting started",
        url: "#/getting-started",
        element: <GettingStarted />,
      },
      {
        label: "Installation",
        url: "#/installation",
        element: <Installation />,
      },
    ],
  },
  {
    heading: "Web Widget",
    items: [
      { label: "Setup", url: "#/widget/setup", element: <p>Setup</p> },
      { label: "Theming", url: "#/widget/theming", element: <p>Theming</p> },
      {
        label: "Custom behaviors",
        url: "#/widget/custom-behaviors",
        element: <p>Behaviors</p>,
      },
    ],
  },
  {
    heading: "Web Widget Components",
    items: [
      {
        label: "Getting started",
        url: "#/widget-components/getting-started",
        element: <p>comp</p>,
      },
      {
        label: "Date Picker",
        url: "#/widget-components/datepicker",
        element: <p>comp</p>,
      },
      {
        label: "Disclaimer",
        url: "#/widget-components/disclaimer",
        element: <p>comp</p>,
      },
      {
        label: "Carousel",
        url: "#/widget-components/carousel",
        element: <p>comp</p>,
      },
      { label: "Form", url: "#/widget-components/form", element: <p>comp</p> },
      {
        label: "Payments",
        url: "#/widget-components/payments",
        element: <p>comp</p>,
      },
    ],
  },
  {
    heading: "Building Your Own Widget",
    items: [
      {
        label: "Getting started",
        url: "#/custom-widget/getting-started",
        element: <p>comp</p>,
      },
      {
        label: "React & Preact",
        url: "#/custom-widget/react-preact",
        element: <p>comp</p>,
      },
      {
        label: "Svelte",
        url: "#/custom-widget/svelte",
        element: <p>comp</p>,
      },
      {
        label: "Other Frameworks",
        url: "#/custom-widget/other-frameworks",
        element: <p>comp</p>,
      },
    ],
  },
  {
    heading: "Headless API",
    items: [
      {
        label: "Getting Started",
        url: "#/headless/getting-started",
        element: <p>comp</p>,
      },
      { label: "Installation", url: "#/headless/", element: <p>comp</p> },
    ],
  },
];

export const ContentRoutes: FC<{}> = () => {
  return (
    <Routes>
      {flatten(routes.map((r) => r.items)).map(({ url, element }, index) => (
        <Route path={url.slice(1)} element={element} key={index} />
      ))}
      <Route path="*" element={<GettingStarted />} />
    </Routes>
  );
};
