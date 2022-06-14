# Examples

There are two production ready examples provided in this repository.

- [Synchronous HTTP Chat Widget](./index.tsx)
- [Asynchronous HTTP Chat Widget](./websocket.tsx)

The environment variables are made available in the application via the Bot Deployment screens.

## Synchronous HTTP Chat Widget

This widget uses HTTP POST methods to the `NLX_BOT_URL`. Requests are synchrnous. Messages from the bot will be returned in the POST response.

## Asynchronous HTTP Chat Widget

This widget opens a websocket to `NLX_BOT_URL` upon rendering. Requests and responses are handled via the websocket asynchronously.
