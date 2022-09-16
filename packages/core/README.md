# NLX Chat SDK Core

This is the core package of our official JavaScript SDK to communicate with NLX conversational bots.

## Getting started

```js
import createConversation from "@nlxchat/core";

// Create some configuration
const config = {
  botUrl: "", // obtain from NLX deployments page
  headers: {
    "nlx-api-key": "" // obtain from NLX deployments page
  },
  conversationId: "", // optional Resume an existing conversation. Obtain from a response from the bot
  userId: "abcd-1234", // optional property to identify the user
  context: {}, // context that is shared with the bot
  triggerWelcomeIntent: true, // set whether the welcome intent should trigger when the conversation is initialized
  languageCode: "es-US" // optional language code for standard bots that do not run on US English
};

// Start the conversation
const convo = createConversation(config);

// Subscribe to changes in the list of responses
convo.subscribe(responses => {
  console.log(responses);
});

// Send a message from the user's end
convo.sendText("hello");
```

## API reference

The package exports a single function called `createConversation`, which is called with the bot configuration and returns a conversation handler object. 

This return object has the following methods:

#### `sendText: (text: string) => void`

Send a simple text to your bot.

#### `sendChoice: (choiceId: string) => void`

Your bot may send a list of choices to choose from, each with a `choiceText` and a `choiceId` field. You can use `choiceText` as button labels, and include the `choiceId` in this method when sending responses.

#### `sendSlots: (slots: Array<{ slotId: string; value: unknown }>) => void`

Send slot values directly through custom widgets such as interactive maps.

#### `sendIntent: (intentId: string) => void`

Trigger a specific intent. The most common use of this method is to show welcome messages by sending the `NLX.Welcome` intent.

#### `sendStructured: (request: StructuredRequest) => void`

Send a combination of choice, slots and intent ID in one request.

#### `subscribe: (subscriber: (responses: Response[]) => void) => void`

Subscribe to the current state of messages whenever there is a change.

#### `unsubscribe: (subscriber: (responses: Response[]) => void) => void`

Remove a subscription.

#### `unsubscribeAll: () => void`

Remove all subscriptions.

#### `reset: () => void`

Reset the conversation. This makes sure that information previously collected by your bot will not affect the logic of the conversation any longer.

## TypeScript

This SDK is written in TypeScript so you can use our type definitions in your project.

## Contributing

Issues and feature requests are always welcome.

## License

MIT.
