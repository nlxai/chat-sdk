# React hook wrapper for the NLX Chat SDK

This package provides a custom `useChat` [hook](https://reactjs.org/docs/hooks-intro.html) which you can use to build your own chat widget in React like so:

```jsx
import { useChat } from "@nlxchat/react";

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

The API of the hook is similar to the vanilla API. It leaves out subscribe and unsubscribe methods as they are used internally in effect hooks, making sure things are properly cleaned up. Instead, messages are readily available in the `chat.messages` field, and we added state hooks for taking care of the value of the chat input field. You are free to not use these and manage things on your own.

See the [standalone chat widget implemention](https://github.com/nlxai/chat-sdk/blob/master/packages/widget/src/index.tsx) for a production-grade example.

## License

MIT.
