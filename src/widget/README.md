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

Initiating the chat takes the following parameters (see [type definition](types.ts) for details):

### `config`

The configuration of the chat itself, containing `botUrl` and request headers.

### `theme`

Overrides for the visual theme constants. See [Theme type definition](types.ts) for details.

### `chatIcon`

The URL of an image you can set to override the default chat icon in the chat pin in the lower right corner. PNG and SVG work best.

### `titleBar`

Renders an optional title bar at the top. If the object is provided, it has the following fields:
* `title` (mandatory): title text.
* `icon` (optional): a URL for an icon image.
* `downloadable` (optional): if set to true, the title bar will include a button that allows chat history to be downloaded.

### `bubble`

When set to a non-empty string, a small bubble will appear above the chat pin when the chat is not expanded, helping the user understand what the chat is for. This bubble appears 3s after the chat is loaded, and disappears after 20s.

A complete example of the configuration options can be found [here](../../examples/standalone.html).

