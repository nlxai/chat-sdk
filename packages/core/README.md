# NLX Chat SDK Core

This is the core package of our official JavaScript SDK to communicate with NLX conversational bots.

## Getting started

```js
import createConversation from "@nlxchat/core";

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

The package exports a single function called `createConversation`, which is called with the bot configuration and returns a conversation handler object. This object has the following methods:

#### `sendText: (text: string) => void`

Send a simple text to your bot.

#### `sendChoice: (choiceId: string) => void`

Your bot may send a list of choices to choose from, each with a `choiceText` and a `choiceId` field. You can use `choiceText` as button labels, and include the `choiceId` in this method when sending responses.

#### `sendSlots: (slots: Array<{ slotId: string; value: unknown }>) => void`

Send slot values directly through custom widgets such as interactive maps.

#### `sendIntent: (intentId: string) => void`

Trigger a specific intent. The most common use of this method is to show welcome messages by sending the `NLX.Welcome` intent.

#### `subscribe: (subscriber: (responses: Response[]) => void) => void`

Subscribe to the current state of messages whenever there is a change.

#### `unsubscribe: (subscriber: (responses: Response[]) => void) => void`

Remove a subscription.

#### `unsubscribeAll: () => void`

Remove all subscriptions.

#### `reset: () => void`

Reset the conversation. This makes sure that information previously collected by your bot will not affect the logic of the conversation any longer.

## Usage with React

See the custom [React hook](https://www.npmjs.com/package/@nlxchat/react) for setting up your own React widget in a few dozen lines of code.

## Usage with Preact

Likewise, see the custom [Preact hook](https://www.npmjs.com/package/@nlxchat/preact) for setting up your own Preact widget in a few dozen lines of code.

## Usage with \*

Do you work with Vue? React without hooks? Custom elements? Elm? Let us know what framework you are looking to build web-based chat applications with so we can look into making utilities for those.

## TypeScript

This SDK is written in TypeScript so you can use our type definitions in your project.

## Contributing

Issues and feature requests are always welcome.

## License

MIT.
