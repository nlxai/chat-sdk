export const documentModalityCode: string = `Documents: (handler, { createElement }) => {
    const html = htm.bind(createElement);
    return ({ data }: { data: any }) => {
      return html\`
        <div className="slides-container">
          <div className="slides">
            \$\{data.map(
              (document: { id: string; title: string; description: string }) =>
                html\`<div className="slide" key=\$\{document.id}>
                  <div className="slide-title">\$\{document.title}</div>
                  <div className="slide-description">
                    \$\{document.description.substr(0, 160)}...
                  </div>
                </div>\`
            )}
          </div>
        </div>
      \`;
    };
  },`;

export const sendWelcomeOnTimeoutSnippet = `setTimeout(() => {
  const conversationHandler = widget.getConversationHandler();
  if (conversationHandler) {
    conversationHandler.sendIntent("MyCustomIntent");
  }
}, 16000);`;
