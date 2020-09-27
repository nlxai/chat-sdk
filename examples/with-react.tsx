import React from "react";
import ReactDOM from "react-dom";
import { useChat } from "../src/react-utils";

const botUrl = process.env.BOT_URL as string;

const nlxApiKey = process.env.NLX_API_KEY as string;

const FakeMapWidget: React.FC<{
  onSelect: (latlng: [number, number]) => void;
}> = (props) => (
  <div
    style={{ width: 80, height: 80, borderRadius: 6, backgroundColor: "#fff" }}
    onClick={() => {
      props.onSelect([80, 90]);
    }}
  ></div>
);

const App: React.FC<{}> = () => {
  const chat = useChat({
    botUrl,
    headers: {
      "nlx-api-key": nlxApiKey,
    },
  });

  // Auto-focus input
  const inputRef = React.useCallback((node) => {
    node.focus();
  }, []);

  if (!botUrl) {
    return (
      <p>
        No bot URL found. Make sure you defined the BOT_URL environment variable
        in .env.
      </p>
    );
  }

  if (chat === null) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4">
      <div className="shadow-lg rounded max-w-xl m-auto">
        <div className="p-3 border-b border-gray-300">
          <p className="text-xl">My Widget</p>
        </div>
        <div
          style={{ height: 360 }}
          className="p-3 max-h-full overflow-y-auto space-y-2"
          ref={chat.messagesContainerRef}
        >
          {chat.messages.map((message, index) => {
            if (message.author === "bot") {
              return (
                <div
                  className="static bg-blue-600 text-white rounded px-2 py-1 self-start space-y-2"
                  key={index}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: ((global as unknown) as any).marked(message.text),
                    }}
                  />
                  {message.payload === "showWidget=map" ? (
                    <FakeMapWidget
                      onSelect={([lat, lng]: [number, number]) => {
                        chat.conversationHandler.sendSlots([
                          { slotId: "Location", value: `${lat},${lng}` },
                        ]);
                      }}
                    />
                  ) : null}
                </div>
              );
            }
            if (message.author === "user" && message.payload.type === "text") {
              return (
                <div
                  className="bg-gray-200 rounded px-2 py-1 self-end"
                  key={index}
                >
                  {message.payload.text}
                </div>
              );
            }
            return null;
          })}
          {chat.waiting && <div>...</div>}
        </div>
        <div className="p-3 border-t border-gray-300">
          <input
            ref={inputRef}
            className="border px-2 py-1 border-gray-300 rounded block w-full"
            value={chat.inputValue}
            placeholder="Type your message"
            onChange={(ev) => {
              chat.setInputValue(ev.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                chat.conversationHandler.sendText(chat.inputValue);
                chat.setInputValue("");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
