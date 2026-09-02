import { Router, type Response } from "express";
import { requireBusiness, type AuthRequest } from "../middlewares/auth";

const router = Router();

type ChatMessage = { role: "user" | "assistant"; content: string };

router.post("/chat", requireBusiness, async (req: AuthRequest, res: Response) => {
  const apiKey = process.env["GROQ_API_KEY"];
  const body = req.body as {
    message?: unknown;
    history?: unknown;
    store?: { name?: unknown; location?: unknown };
    products?: Array<{ title?: unknown; price?: unknown; stock?: unknown; status?: unknown }>;
  };

  if (typeof body.message !== "string" || !body.message.trim()) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  if (!apiKey) {
    res.status(503).json({ error: "AI assistant is not configured" });
    return;
  }

  const history: ChatMessage[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (item): item is ChatMessage =>
            Boolean(item) &&
            typeof item === "object" &&
            "role" in item &&
            "content" in item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string",
        )
        .slice(-10)
    : [];
  const productSummary = Array.isArray(body.products)
    ? body.products
        .slice(0, 50)
        .map((product) => `- ${String(product.title ?? "Product")}: KSh ${String(product.price ?? 0)}, ${String(product.stock ?? 0)} units, ${String(product.status ?? "active")}`)
        .join("\n")
    : "No products currently listed.";
  const storeName = String(body.store?.name ?? "StatusSeller");
  const location = String(body.store?.location ?? "Nairobi, Kenya");

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are the Business Assistant for ${storeName}, a Kenyan online store. Help customers with product information, delivery, payments, returns, and order status. Store location: ${location}. Delivery: same-day within Nairobi (KSh 200-500), 2-3 days upcountry. Payment: M-Pesa, Visa, Mastercard, and Cash on Delivery. Returns: 7 days in original condition. Current products:\n${productSummary}\nKeep responses concise, warm, and helpful. Use KSh for prices. If you do not know something, offer to connect the customer with the merchant.`,
          },
          ...history,
          { role: "user", content: body.message.trim() },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      console.error("Groq request failed", groqResponse.status);
      res.status(502).json({ error: "AI provider request failed" });
      return;
    }

    const data = (await groqResponse.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
    const message = data.choices?.[0]?.message?.content;
    if (typeof message !== "string" || !message.trim()) {
      res.status(502).json({ error: "AI provider returned an empty response" });
      return;
    }

    res.json({ message });
  } catch (error) {
    console.error("Groq request error", error);
    res.status(502).json({ error: "AI provider request failed" });
  }
});

export default router;