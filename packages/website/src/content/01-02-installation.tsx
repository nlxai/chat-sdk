import React from "react";
import { PageTitle } from "../components/PageTitle";
import { PageContent } from "../components/PageContent";
import { umdScriptTags, packageUrls } from "../constants";

export const content = `
SDK packages can be installed as follows:

## Using script tags

The following packages are available as direct script tags:

* [@nlxai/chat-widget](${packageUrls.chatWidget}) - add a chat widget to your website with only HTML:

~~~html
<script defer src="${umdScriptTags.chatWidget}"></script>
~~~

* [@nlxai/chat-core](${packageUrls.chatCore}) - talk to a bot in plain JavaScript without a bundler:

~~~html
<script defer src="${umdScriptTags.chatCore}"></script>
~~~

* [@nlxai/voice-compass](${packageUrls.voiceCompass}) - add multimodal capabilities to a plain HTML page:

~~~html
<script defer src="${umdScriptTags.voiceCompass}"></script>
~~~

## Using npm

All packages are available on npm as CommonJS modules. They are written in TypeScript and include comprehensive type definitions.

~~~bash
# The Chat widget
npm install @nlxai/chat-widget

# React hooks, along with peer dependencies
npm install @nlxai/chat-react react react-dom

# Preact hooks, along with peer dependencies
npm install @nlxai/chat-preact preact

# Core chat SDK
npm install @nlxai/chat-core

# Voice Compass
npm install @nlxai/voice-compass
~~~
`;

export const Installation = () => {
  return (
    <>
      <PageTitle pretitle="Install" title="Installation" />
      <PageContent md={content} />
    </>
  );
};
