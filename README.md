# Chat SDK for NLX bots

This is our official JavaScript SDK to communicate with NLX conversational bots.

## Getting started

```js
import createConversation from "nlx-chat-sdk"

// Create some configuration
const testConfig = {
  botUrl: "", // obtain from NLX deployments page
  headers: {
    authorization:
      ""
  }
};

// Start the conversation
const convo = createConversation(testConfig);

// Subscribe to new messages
convo.subscribe(messages => {
  console.log(messages)
})

// Send a message from the user's end
convo.sendMessage("hello");
```

## API reference

The package exports a single function called `createConversation`, which is called with the bot configuration and returns a conversation object. This object has the following methods:

### `sendMessage: (text: string) => void`

### `subscribe: (subscriber: (state: State) => void) => void`

### `unsubscribe: (subscriber: (state: State) => void) => void`

### `unsubscribeAll: () => void`

### `reset: () => void`

## React example

We provide a [React](https://reactjs.org/) example in TypeScript to illustrate how the project works in a modern application.

## TypeScript

This SDK is written in TypeScript so you can import typed methods into your project.

## Contributing

Issues and feature requests are always welcome.

## License

MIT
