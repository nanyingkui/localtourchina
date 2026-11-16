function unavailable() {
  return Response.json(
    { error: "Service temporarily unavailable" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    if (env.LTC_ORIGIN !== undefined) {
      try {
        const origin = new URL(env.LTC_ORIGIN);
        if (
          origin.protocol !== "https:" || origin.username || origin.password ||
          origin.pathname !== "/" || origin.search || origin.hash ||
          origin.origin === requestUrl.origin
        ) {
          return unavailable();
        }
        origin.pathname = requestUrl.pathname;
        origin.search = requestUrl.search;
        const upstream = new Request(origin, request);
        return await fetch(upstream, { redirect: "manual" });
      } catch {
        return unavailable();
      }
    }

    if (requestUrl.pathname === "/api" || requestUrl.pathname.startsWith("/api/")) {
      return unavailable();
    }
    if (!env.ASSETS) return unavailable();
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    requestUrl.pathname = "/index.html";
    requestUrl.search = "";
    return env.ASSETS.fetch(new Request(requestUrl, request));
  },
};
