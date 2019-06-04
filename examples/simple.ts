import createConversation, { Config } from "../src/index";

const botUrl = process.env.BOT_URL as string;

const authorization = process.env.AUTHORIZATION as string;

const testConfig: Config = {
  botUrl,
  headers: {
    authorization
  }
};

const convo = createConversation(testConfig);

convo.sendText("I want seed");

convo.subscribe(messages => {
  console.log(messages);
});
