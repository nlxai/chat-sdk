# Chat Widget

The chat widget is a styled, configurable UI widget you can drop in on your website or web application.

## Installation

`npm install --save @nlxchat/widget react react-dom`

## Usage

You can render a chat widget in your document with just a few lines of code:

```jsx
import { standalone } from "@nlxchat/widget";

// This will render the widget as the last element in the <body>

standalone({
  config: {
    botUrl: "",
    headers: {
      "nlx-api-key": "",
    },
    triggerWelcomeIntent: true,
  },
  initiallyExpanded: true,
  theme: {
    primaryColor: "teal",
    darkMessageColor: "#000",
    lightMessageColor: "#fff",
    fontFamily: "Helvetica",
  },
});
```

If you are running a React application, you can use the component version with the same configuration API as props:

```jsx
import { Widget } from "@nlxchat/widget";

render(<Widget config={{ botUrl: "" }} />, document.getElementById("app"));
```

There is also a packaged version of the SDK that exposes the `chat.standalone` and `chat.widget` as a global on window:

```html
<body>
  <script src="https://unpkg.com/@nlxchat/widget@0.5.0/lib/umd/widget.js"></script>
  <script>
    window.chat.standalone({
      config: {
        botUrl: "",
        headers: {
          "nlx-api-key": "",
        },
      },
      initiallyExpanded: true,
      theme: {
        primaryColor: "teal",
        darkMessageColor: "#000",
        lightMessageColor: "#fff",
        fontFamily: "Helvetica",
      },
    });
  </script>
</body>
```

## Configuration

Initiating the chat takes the following parameters (see [type definition](https://github.com/nlxai/chat-sdk/blob/master/packages/widget/src/props.ts) for details):

### `config`

The configuration of the chat itself, containing `botUrl` and request headers. See the [core SDK example](https://github.com/nlxai/chat-sdk/tree/master/packages/core#getting-started).

### `theme`

Overrides for the visual theme constants. See [Theme type definition](https://github.com/nlxai/chat-sdk/blob/master/packages/widget/src/theme.ts) for details.

### `chatIcon`

The URL of an image you can set to override the default chat icon in the chat pin in the lower right corner. PNG and SVG work best.

### `titleBar`

Renders an optional title bar at the top. If the object is provided, it has the following fields:

- `title` (mandatory): title text.
- `icon` (optional): a URL for an icon image.
- `downloadable` (optional): if set to true, the title bar will include a button that allows chat history to be downloaded.

### `bubble`

When set to a non-empty string, a small bubble will appear above the chat pin when the chat is not expanded, helping the user understand what the chat is for. This bubble appears 3s after the chat is loaded, and disappears after 20s.

### `initiallyExpanded`

Sets whether the widget is initially expanded.

### `useSessionStorage`

When this option is set to `true`, the state of the chat conversation is persisted in [session storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) for an hour. This allows the state and history of the conversation to persist between full page refreshes.

The information stored in session storage clears if:
- the browser window is closed.
- the widget is active on a page with session data set more than an hour before.

> When using the session storage feature, it is your responsibility to make sure that your website complies with your data protection and privacy policy requirements.

### `lowLevel`

If you need low-level control of the widget, this configuration value gives access to the [conversationHandler](https://github.com/nlxai/chat-sdk/blob/94d5fade43c6ed05ddf95de7140bf5bf1e6f916e/packages/core/src/index.ts#L84-L95) object through a callback, called once on widget initialization:

```jsx
<Widget
  config={{
    botUrl: ""
  }}
  lowLevel={(conversationHandler) => {
    // Send e.g. custom slot values, or save the handler in a ref or on the window global
    conversationHandler.sendSlots([
      {
        slotId: "name",
        value: "Alex"
      }
    ]);
  }
/>
```

## The widget instance

The `standalone` function (`window.chat.standalone` if you are using the packaged version) returns an object that you can use to control the widget programmatically. It has the following methods:
* `expand`: expand the widget programmatically. You can do this as a response to e.g. a button on your page being clicked.
* `collapse`: collapse the widget programmatically.
* `teardown`: remove the chat widget from the page. This cleans up all internal event listeners.

## Recipes

### Fine-grain control on triggering the welcome intent

When using the `config.triggerWelcomeIntent` configuration option, the welcome intent is triggered on widget initialization regardless of whether the widget is expanded or not (through the `initiallyExpanded` option). If you want to trigger the welcome intent only when the widget is expanded by the user (especially helpful for managing costs), you can use the following pattern:

```js
let welcomeIntentSent = false;

const handleExpand = (conversationHandler) => {
  if (!welcomeIntentSent) {
    conversationHandler.sendWelcomeIntent();
    welcomeIntentSent = true;
  }
};

window.chat.standalone({
  config: {
    // usual bot configuration
  },
  initiallyExpanded: false,
  onExpand: handleExpand,
});
```

### Open the widget from the outside

```js
const widget = window.chat.standalone({
  config: {
    // usual bot configuration
  },
  initiallyExpanded: false,
});

// Expand the widget as a result of a button on the page being clicked
document.querySelector("#my-button").addEventListener("click", () => {
  widget.expand();
});
```

## License

MIT.
