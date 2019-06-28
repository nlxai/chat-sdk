# Chat Widget

The chat widget is a styled, configurable UI widget you can drop in on your website or web application.

## Usage

You can render a chat widget in your document with just a few lines of code:

```jsx
import { standalone } from "nlx-chat-sdk/widget";

// This will render the widget as the last element in the <body>
standalone({
  config: {
    botUrl: ""
  }
});
```

If you are running a React application, you can use the component version with the same configuration API as props:

```jsx
import { Widget } from "nlx-chat-sdk/widget";

render(<Widget config={{ botUrl: "" }} />, document.getElementById("app"));
```

There is also a packaged version of the SDK that exposes the `chat.standalone` and `chat.widget` as a global on window:

```html
<body>
  <script src="https://unpkg.com/nlx-chat-sdk@0.0.2/lib/umd/widget.js"></script>
  <script>
    window.chat.standalone({
      config: {
        botUrl: ""
      }
    });
  </script>
</body>
```

## Configuration

Initiating the chat takes the following parameters:

### `config`

The configuration of the chat itself, containing `botUrl` and request headers.

### `theme`

Overrides for the visual theme constants. See [theme type definition](types.ts) for details.

### `chatIcon`

The URL of an image you can set to override the default chat icon in the chat pin in the lower right corner. PNG and SVG work best.

### `titleBar`

Renders an optional title bar at the top. If the object is provided, there is a mandatory `title` field and an optional `icon` field.

A complete example of the configuration options can be found [here](../../examples/standalone.html).

