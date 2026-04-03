"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: (opts: {
      url: string;
      dom_id: string;
      deepLinking: boolean;
      persistAuthorization?: boolean;
    }) => void;
  }
}

/**
 * Documentação interativa (Swagger UI) consumindo GET /api/openapi.
 */
export default function OpenApiDocsPage() {
  useEffect(() => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";
    script.async = true;
    script.onload = () => {
      window.SwaggerUIBundle?.({
        url: "/api/openapi",
        dom_id: "#swagger-ui-root",
        deepLinking: true,
      });
    };
    document.body.appendChild(script);

    return () => {
      css.remove();
      script.remove();
    };
  }, []);

  return <div id="swagger-ui-root" className="min-h-dvh w-full" />;
}
