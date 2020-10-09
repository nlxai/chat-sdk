/*
import React from "react";
import { FunctionComponent, useState, useCallback } from "react";
import { render } from "react-dom";
 */

import { h, render, FunctionComponent } from "preact";
import { useState, useCallback } from "preact/hooks";
import { useChat } from "@nlxchat/preact";

const botUrl = process.env.BOT_URL as string;

const nlxApiKey = process.env.NLX_API_KEY as string;

const FakeMapWidget: FunctionComponent<{
  onSelect: (latlng: [number, number]) => void;
}> = (props) => {
  const [coord, setCoord] = useState<null | { x: number; y: number }>(null);
  const [sentCoord, setSentCoord] = useState<null | { x: number; y: number }>(
    null
  );

  return (
    <div
      style={{
        width: 360,
        height: 180,
        position: "relative",
        borderRadius: 6,
        backgroundColor: "#fff",
      }}
      onMouseMove={(ev) => {
        const rect = ev.currentTarget.getBoundingClientRect();
        setCoord({
          x: ev.pageX - rect.left,
          y: ev.pageY - window.pageYOffset - rect.top,
        });
      }}
      onMouseLeave={() => {
        setCoord(null);
      }}
      onClick={() => {
        if (coord) {
          setSentCoord(coord);
          props.onSelect([coord.x, coord.y]);
        }
      }}
    >
      {coord && (
        <div
          style={{
            width: 8,
            height: 8,
            left: coord.x - 4,
            top: coord.y - 4,
            borderRadius: "50%",
            position: "absolute",
            background: "#343434",
            color: "#898989",
          }}
        >
          <span
            style={{
              position: "relative",
              top: 10,
              left: 10,
            }}
          >{`${coord.x},${coord.y}`}</span>
        </div>
      )}
      {sentCoord && (
        <div
          style={{
            width: 8,
            height: 8,
            left: sentCoord.x - 4,
            top: sentCoord.y - 4,
            borderRadius: "50%",
            position: "absolute",
            background: "#000",
            color: "#000",
          }}
        >
          <span
            style={{
              position: "relative",
              top: 10,
              left: 10,
            }}
          >{`${sentCoord.x},${sentCoord.y}`}</span>
        </div>
      )}
    </div>
  );
};

const App: FunctionComponent<{}> = () => {
  const chat = useChat({
    botUrl,
    headers: {
      "nlx-api-key": nlxApiKey,
    },
  });

  // Auto-focus input
  const inputRef = useCallback((node) => {
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
          style={{ height: 460 }}
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

render(<App />, document.getElementById("app"));
