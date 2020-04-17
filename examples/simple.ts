import createConversation, { Config } from "../src/index";

const botUrl = process.env.BOT_URL as string;
const nlxApiKey = process.env.NLX_API_KEY as string;

const testConfig: Config = {
  botUrl,
  headers: {
    "nlx-api-key": nlxApiKey
  }
};

const convo = createConversation(testConfig);

convo.sendText("I want seed");

convo.subscribe(messages => {
  console.log(messages);
});
