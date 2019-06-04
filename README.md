# Chat SDK for NLX bots

This is our official JavaScript SDK to communicate with NLX conversational bots.

## Getting started

```js
import createConversation from "nlx-chat-sdk";

// Create some configuration
const testConfig = {
  botUrl: "" // obtain from NLX deployments page
};

// Start the conversation
const convo = createConversation(testConfig);

// Subscribe to changes in the list of messages
convo.subscribe(messages => {
  console.log(messages);
});

// Send a message from the user's end
convo.sendText("hello");
```

## API reference

The package exports a single function called `createConversation`, which is called with the bot configuration and returns a conversation object. This object has the following methods:

#### `sendText: (text: string) => void`

Send a simple text to your bot.

#### `sendChoice: (choiceId: string) => void`

Your bot may send a list of choices to choose from, each with a `choiceText` and a `choiceId` field. You can use `choiceText` as button labels, and include the `choiceId` in this method when sending responses.

#### `subscribe: (subscriber: (messages: Message[]) => void) => void`

Subscribe to the current state of messages whenever there is a change.

#### `unsubscribe: (subscriber: (messages: Message[]) => void) => void`

Remove a subscription.

#### `unsubscribeAll: () => void`

Remove all subscriptions.

#### `reset: () => void`

Reset the conversation. This makes sure that information previously collected by your bot will not affect the logic of the conversation any longer.

## Usage with React

We provide a [React](https://reactjs.org/) example in TypeScript to illustrate how the project works in a modern web application framework. This implementation uses our `useChat` [hook](https://reactjs.org/docs/hooks-intro.html) which you can use to build your own chat widget:

```jsx
import { useChat } from "nlx-chat-sdk/react-utils";

const ChatWidget = () => {
  const chat = useChat({
    botUrl: ""
  });

  return (
    <div>
      {chat.messages.map(/* render messages in the current conversation */)}
    </div>
  );
};
```

See [full example](examples/with-react.tsx).

The API of the hook is similar to the vanilla API. It leaves out subscribe and unsubscribe methods as they are used internally in effect hooks, making sure things are properly cleaned up. Instead, messages are readily available in the `chat.messages` field, and we added state hooks for taking care of the value of the chat input field. You are free to not use these and manage things on your own.

## Usage with *

Do you work with Vue? React without hooks? Custom elements? Elm? Let us know what framework you are looking to build web-based chat applications with so we can look into making utilities for those.

## TypeScript

This SDK is written in TypeScript so you can use our type definitions in your project.

## Widget (WIP)

We are working on a styled, themeable chat widget. Stay tuned!

## Contributing

Issues and feature requests are always welcome.

## License

MIT
