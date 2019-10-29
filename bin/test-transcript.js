const fs = require("fs");
const path = require("path");
const transcript = require("../lib/widget/ui/transcript");

const html = transcript.html({
  messages: [
    {
      author: "bot",
      receivedAt: 1572378387248,
      text: "Hello",
      choices: []
    },
    {
      author: "user",
      receivedAt: 1572378387248,
      payload: {
        type: "text",
        text: "Hello"
      }
    }
  ],
  titleBar: {
    title: "Something",
    logo: "https://apple.jpg"
  },
  conversationId: "1234-5678-9012"
});

fs.writeFileSync(path.join(__dirname, "../index.html"), html);
