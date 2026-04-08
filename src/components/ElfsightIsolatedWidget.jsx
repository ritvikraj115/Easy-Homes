import { useEffect, useMemo, useState } from "react";

const MIN_IFRAME_HEIGHT = 160;

const buildSrcDoc = (widgetId) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
      }

      body {
        min-height: ${MIN_IFRAME_HEIGHT}px;
      }

      .elfsight-app-${widgetId} {
        min-height: ${MIN_IFRAME_HEIGHT}px;
      }
    </style>
  </head>
  <body>
    <div class="elfsight-app-${widgetId}" data-elfsight-app-lazy></div>
    <script>
      (function () {
        var postHeight = function () {
          var height = Math.max(
            ${MIN_IFRAME_HEIGHT},
            document.body ? document.body.scrollHeight : 0,
            document.documentElement ? document.documentElement.scrollHeight : 0,
            document.body ? document.body.offsetHeight : 0,
            document.documentElement ? document.documentElement.offsetHeight : 0
          );

          parent.postMessage(
            {
              type: "elfsight-resize",
              widgetId: "${widgetId}",
              height: height
            },
            "*"
          );
        };

        var requestPostHeight = function () {
          if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(postHeight);
            return;
          }

          window.setTimeout(postHeight, 0);
        };

        if (document.body) {
          new MutationObserver(requestPostHeight).observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
          });
        }

        window.addEventListener("load", requestPostHeight);
        window.setInterval(postHeight, 1200);
        requestPostHeight();
      })();
    </script>
    <script src="https://elfsightcdn.com/platform.js" async></script>
  </body>
</html>`;

const ElfsightIsolatedWidget = ({ widgetId, title, className = "" }) => {
  const [height, setHeight] = useState(MIN_IFRAME_HEIGHT);

  useEffect(() => {
    const onMessage = (event) => {
      const data = event?.data;

      if (!data || data.type !== "elfsight-resize" || data.widgetId !== widgetId) {
        return;
      }

      setHeight(Math.max(MIN_IFRAME_HEIGHT, Number(data.height) || MIN_IFRAME_HEIGHT));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [widgetId]);

  const srcDoc = useMemo(() => buildSrcDoc(widgetId), [widgetId]);

  return (
    <iframe
      title={title}
      srcDoc={srcDoc}
      loading="lazy"
      scrolling="no"
      className={className}
      style={{
        width: "100%",
        height: `${height}px`,
        border: 0,
        background: "transparent",
        display: "block",
      }}
    />
  );
};

export default ElfsightIsolatedWidget;
