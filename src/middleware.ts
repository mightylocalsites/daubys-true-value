import { defineMiddleware } from "astro:middleware";

const FAVICON_TAGS = `<meta name="theme-color" content="#a00c24" />
<link rel="icon" href="/favicon.png" type="image/png" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/favicon.png" />`;

/** Inject favicon links into every HTML response (framework + override pages). */
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) return response;

  const html = await response.text();
  const responseInit = {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
  if (!html.includes("</head>") || html.includes('rel="icon"')) {
    return new Response(html, responseInit);
  }

  return new Response(html.replace("</head>", `${FAVICON_TAGS}</head>`), responseInit);
});
