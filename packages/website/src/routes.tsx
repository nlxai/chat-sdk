import React, { type ReactNode, type FC } from "react";
import { flatten } from "ramda";
import { Routes, Route } from "react-router-dom";
// 1
import { GettingStarted } from "./content/01-01-getting-started";
import { Installation } from "./content/01-02-installation";
// 2
import { WebWidgetSetup } from "./content/02-01-web-widget-setup";
import { WebWidgetTheming } from "./content/02-02-web-widget-theming";
import { WebWidgetCustomBehaviors } from "./content/02-03-web-widget-custom-behaviors";
// 3
import { WebWidgetComponentsGettingStarted } from "./content/03-01-web-widget-components-getting-started";
import { WebWidgetComponentsDatePicker } from "./content/03-02-date-picker";
import { WebWidgetComponentsDisclaimer } from "./content/03-03-disclaimer";
import { WebWidgetComponentsCarousel } from "./content/03-04-carousel";
import { WebWidgetComponentsFeedbackForm } from "./content/03-05-feedback-form";
import { WebWidgetComponentsPayments } from "./content/03-06-payments";
// 4
import { CustomWidgetsGettingStarted } from "./content/04-01-custom-widgets-getting-started";
import { CustomWidgetsReact } from "./content/04-02-custom-widgets-react";
import { CustomWidgetsOther } from "./content/04-03-custom-widgets-other";
// 5
import { HeadlessSetup } from "./content/05-01-headless-setup";
import { HeadlessApi } from "./content/05-02-headless-api";

export const routes: {
  heading: string;
  items: { label: string; url: string; element: ReactNode }[];
}[] = [
  {
    heading: "Introduction",
    items: [
      {
        label: "Getting started",
        url: "/getting-started",
        element: <GettingStarted />,
      },
      {
        label: "Installation",
        url: "/installation",
        element: <Installation />,
      },
    ],
  },
  {
    heading: "Web widget",
    items: [
      { label: "Setup", url: "/widget-setup", element: <WebWidgetSetup /> },
      {
        label: "Theming",
        url: "/widget-theming",
        element: <WebWidgetTheming />,
      },
      {
        label: "Custom behaviors",
        url: "/widget-custom-behaviors",
        element: <WebWidgetCustomBehaviors />,
      },
    ],
  },
  {
    heading: "Web widget components",
    items: [
      {
        label: "Getting started",
        url: "/widget-components-getting-started",
        element: <WebWidgetComponentsGettingStarted />,
      },
      {
        label: "Date picker",
        url: "/widget-components-datepicker",
        element: <WebWidgetComponentsDatePicker />,
      },
      {
        label: "Disclaimer",
        url: "/widget-components-disclaimer",
        element: <WebWidgetComponentsDisclaimer />,
      },
      {
        label: "Carousel",
        url: "/widget-components-carousel",
        element: <WebWidgetComponentsCarousel />,
      },
      {
        label: "Feedback form",
        url: "/widget-components-feedback-form",
        element: <WebWidgetComponentsFeedbackForm />,
      },
      {
        label: "Payments",
        url: "/widget-components-payments",
        element: <WebWidgetComponentsPayments />,
      },
    ],
  },
  {
    heading: "Building your own widget",
    items: [
      {
        label: "Getting started",
        url: "/custom-widget-getting-started",
        element: <CustomWidgetsGettingStarted />,
      },
      {
        label: "React & Preact",
        url: "/custom-widget-react-preact",
        element: <CustomWidgetsReact />,
      },
      {
        label: "Other frameworks",
        url: "/custom-widget-other-frameworks",
        element: <CustomWidgetsOther />,
      },
    ],
  },
  {
    heading: "Headless API",
    items: [
      {
        label: "Getting Started",
        url: "/headless-getting-started",
        element: <HeadlessSetup />,
      },
      {
        label: "Installation",
        url: "/headless-installation",
        element: <HeadlessApi />,
      },
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
