exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY not set" })
    };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch(e) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const rawText = await response.text();

    if (!response.ok) {
      return { statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Anthropic API error", detail: rawText }) };
    }

    return { statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: rawText };

  } catch(err) {
    return { statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }) };
  }
};
