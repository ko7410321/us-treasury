import { createServerFn } from "@tanstack/react-start";

const TO = "4kgor@nefu.edu.kg";
const GAP_MS = 30_000;
const recent = new Map<string, number>();

type Inquiry = { name: string; email: string; wechat: string };

async function rateLimited(): Promise<boolean> {
  let ip = "local";
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    ip = getRequest().headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  } catch {
    ip = "local";
  }
  const now = Date.now();
  const prev = recent.get(ip) ?? 0;
  if (now - prev < GAP_MS) return true;
  recent.set(ip, now);
  return false;
}

export const submitInquiry = createServerFn({ method: "POST" })
  .validator((input: Inquiry) => input)
  .handler(async ({ data }) => {
    const name = data.name.trim().slice(0, 80);
    const email = data.email.trim().slice(0, 120);
    const wechat = data.wechat.trim().slice(0, 64);
    if (!name || !wechat || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false as const, reason: "send" as const };
    }
    if (await rateLimited()) return { ok: false as const, reason: "wait" as const };
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${TO}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "https://ustreasury2026.grok.me",
          Referer: "https://ustreasury2026.grok.me/",
        },
        body: JSON.stringify({
          name,
          email,
          wechat,
          _replyto: email,
          _subject: `香港开户查询：${name}`,
          _template: "table",
          _captcha: "false",
          message: `名称：${name}\n电邮：${email}\n微信号：${wechat}`,
        }),
        signal: AbortSignal.timeout(8000),
      });
      const payload = (await res.json().catch(() => null)) as { success?: string | boolean; message?: string } | null;
      const success = payload?.success === true || payload?.success === "true";
      if (success) return { ok: true as const, reason: "" };
      const activate = /activat/i.test(payload?.message ?? "");
      return { ok: false as const, reason: activate ? ("activate" as const) : ("send" as const) };
    } catch {
      return { ok: false as const, reason: "send" as const };
    }
  });
