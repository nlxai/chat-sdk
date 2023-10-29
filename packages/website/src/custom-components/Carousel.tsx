import "./Carousel.css";
import { createElement, FC, useState } from "react";
import htm from "htm";

const html = htm.bind(createElement);

interface Document {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  url: string;
}

export const Carousel: FC<{ data: Document[] }> = ({ data }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return html`
    <div className="chat-carousel-container">
      <div className="chat-carousel-slides">
        ${data.map(
          document =>
            html`
              <div
                className=${`chat-carousel-slide ${
                  selectedId === document.id
                    ? "chat-carousel-slide--active"
                    : ""
                }`}
                key=${document.id}
                onClick=${() => {
                  setSelectedId(document.id);
                }}
              >
                <div className="chat-carousel-title">${document.name}</div>
                <div
                  className="chat-carousel-image"
                  style=${{
                    backgroundImage: `url(${document.imageUrl})`
                  }}
                />
                <div className="chat-carousel-description">
                  ${document.description.substr(0, 100)}${document.description
                    .length > 98
                    ? "..."
                    : ""}
                </div>
              </div>
            `
        )}
      </div>
    </div>
  `;
};
