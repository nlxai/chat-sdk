export const documentModalityCode: string = `Hotels: ({ data }) => {
    const { React, ReactDOM } = nlxChat.widget;

    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const selected = data.find((document) => document.id === selectedId);

    const portalContainer = document.querySelector("#portal");

    const handler = nlxChat.widget.useConversationHandler();

    return html\`
      \${selected && portalContainer
        ? ReactDOM.createPortal(
            html\`<div className="popover-container">
              <div className="popover">
                <div className="popover-title">
                  <h1>\${selected.name}</h1>
                  <button
                    className="popover-close"
                    onClick=\${() => {
                      setSelectedId(null);
                    }}
                  >
                    Close
                  </button>
                </div>
                <img src=\${selected.imageUrl} alt="\${selected.name} photo" />
                <div className="popover-content">
                  <p>\${selected.description}</p>
                  <button
                    className="cta-button"
                    onClick=\${() => {
                      handler?.sendChoice(selected.id);
                    }}
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>\`,
            portalContainer
          )
        : null}
      <div className="slides-container">
        <div className="slides">
          \${data.map(
            (document) =>
              html\`<div
                className=\${\`slide \${
                  selectedId === document.id ? "slide--active" : ""
                }\`}
                key=\${document.id}
                onClick=\${() => {
                  setSelectedId(document.id);
                }}
              >
                <div className="slide-title">\${document.name}</div>
                <div
                  className="slide-image"
                  style=\${{
                    backgroundImage: \`url(\${document.imageUrl})\`,
                  }}
                />
                <div className="slide-description">
                  \${document.description.substr(0, 100)}\${document.description
                    .length > 98
                    ? "..."
                    : ""}
                </div>
              </div>\`
          )}
        </div>
      </div>
    \`;
  },
`

export const sendWelcomeOnTimeoutSnippet = `setTimeout(() => {
  const conversationHandler = widget.getConversationHandler();
  if (conversationHandler) {
    conversationHandler.sendIntent("MyCustomIntent");
  }
}, 16000);`;
