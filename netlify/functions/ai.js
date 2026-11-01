// Netlify Function: thin, server-side proxy to the Anthropic API.
// The API key lives in a Netlify environment variable and never reaches the browser.
exports.handler = async (event) => {
  const json = (statusCode, obj) => ({ statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(obj) });

  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(500, { error: "ANTHROPIC_API_KEY is not set" });

  let prompt;
  try { ({ prompt } = JSON.parse(event.body || "{}")); }
  catch { return json(400, { error: "Invalid JSON" }); }

  // Basic abuse guard: the app's prompts are a few thousand tokens; reject anything wildly larger.
  if (typeof prompt !== "string" || prompt.length < 10 || prompt.length > 40000) {
    return json(400, { error: "Invalid prompt" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) return json(502, { error: "Upstream error", status: r.status });
    const data = await r.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return json(200, { text });
  } catch (e) {
    return json(502, { error: "Upstream request failed" });
  }
};
