import { useEffect, useState, type FormEvent } from "react";
import { useDesk } from "@/components/treasury/state";
import { submitInquiry } from "@/lib/inquiry.functions";
const postDirect = async (name: string, email: string, wechat: string) => {
  const res = await fetch("https://formsubmit.co/ajax/4kgor@nefu.edu.kg", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name,
      email,
      wechat,
      _replyto: email,
      _subject: `香港开户查询：${name}`,
      _captcha: "false",
      message: `名称：${name}\n电邮：${email}\n微信号：${wechat}`,
    }),
  });
  const payload = (await res.json().catch(() => null)) as { success?: string | boolean; message?: string } | null;
  if (payload?.success === true || payload?.success === "true") return "ok" as const;
  return /activat/i.test(payload?.message ?? "") ? ("activate" as const) : ("send" as const);
};

const WAYS = [
  {
    title: "QDII 美元债基金",
    body: "用人民币在支付宝、天天基金直接购买（例如易方达中短期美元债），不占用 5 万美元额度。最方便，但管理费年化约 0.5%–0.9%，经常限购或暂停申购，而且不是 100% 纯美债。",
  },
  {
    title: "银行美元理财",
    body: "先用个人 5 万美元额度换汇，再购买银行美元理财（底层含美债）。操作简单，但产品封闭期长、银行收费不低，实际收益通常低于直接持有美债。",
  },
  {
    title: "跨境理财通（南向通）",
    body: "仅限大湾区符合资产或收入门槛的人士（例如家庭净资产不低于 100 万元，或年收入不低于 40 万元），通过合作银行购买美债或相关产品。不占用个人购汇额度，但资格要求严格，个人额度有上限。",
  },
  {
    title: "海外券商直接买",
    body: "通过富途、老虎、IBKR 等购买原生美债，佣金极低、选择最多。但内地新开户已极其困难，存量客户在内地 IP 登录时多数只能卖不能买，合规风险较高。",
  },
  {
    title: "香港银行开户",
    body: "赴港或通过见证开立香港银行账户，入金后直接购买美国国债。可持有原生美债，利息填写 W-8BEN 后一般免 30% 预扣税，资金留在持牌银行较稳妥。全港唯一一家银行无需证明专业投资者（PI）身份即可购买美国国债，最低门槛约 5 万美元。想了解开户、入金及实际操作流程？欢迎私信我，我可以帮你讲清楚步骤和注意事项。",
  },
] as const;

export function AccessPanel() {
  const { lang } = useDesk();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wechat, setWechat] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<"" | "send" | "activate" | "wait">("");
  const [wait, setWait] = useState(0);

  useEffect(() => {
    const until = Number(sessionStorage.getItem("inquiry-until") || 0);
    const left = Math.ceil((until - Date.now()) / 1000);
    if (left > 0) setWait(left);
  }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setInterval(() => {
      setWait((left) => (left <= 1 ? 0 : left - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [wait]);

  if (lang !== "zh-Hans") return null;

  const hold = (seconds = 30) => {
    sessionStorage.setItem("inquiry-until", String(Date.now() + seconds * 1000));
    setWait(seconds);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending || wait > 0) return;
    hold();
    setSending(true);
    setError("");
    try {
      const result = await submitInquiry({ data: { name, email, wechat } });
      if (result.ok) {
        setName("");
        setEmail("");
        setWechat("");
        setDone(true);
        return;
      }
      if (result.reason === "wait") {
        setError("wait");
        return;
      }
      const direct = await postDirect(name, email, wechat);
      if (direct === "ok") {
        setName("");
        setEmail("");
        setWechat("");
        setDone(true);
        return;
      }
      setError(direct);
    } catch {
      try {
        const direct = await postDirect(name, email, wechat);
        if (direct === "ok") {
          setName("");
          setEmail("");
          setWechat("");
          setDone(true);
          return;
        }
        setError(direct);
      } catch {
        setError("send");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="access" className="scroll-mt-40 min-w-0 rounded-xl border border-line bg-elevated p-5 shadow-lg md:p-7">
      <p className="text-xs font-medium text-faint">06</p>
      <h2 className="mt-1 font-serif text-2xl text-fg md:text-3xl">内地资金接触美国国债的五个途径</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">下面只比较怎么买得到，不比较哪一个该买。门槛、额度与费用会变，下单前以银行或基金当时的规则为准。</p>
      <ol className="mt-5 grid gap-3">
        {WAYS.map((item, index) => (
          <li key={item.title} className="rounded-lg border border-line bg-subtle px-4 py-4">
            <p className="text-xs text-faint">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 text-base font-medium text-fg">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ol>

      <form onSubmit={onSubmit} className="mt-6 max-w-lg rounded-lg border border-line bg-subtle p-4">
        <h3 className="text-base font-medium text-fg">了解香港开户</h3>
        <p className="mt-1 text-sm text-muted">留下名称、电邮和微信号。资料只用于联络你说明开户步骤。</p>
        <label className="mt-4 block text-xs text-faint">
          名称
          <input
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-line bg-elevated px-3 text-sm text-fg outline-none"
          />
        </label>
        <label className="mt-3 block text-xs text-faint">
          电邮
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-line bg-elevated px-3 text-sm text-fg outline-none"
          />
        </label>
        <label className="mt-3 block text-xs text-faint">
          微信号
          <input
            required
            name="wechat"
            value={wechat}
            onChange={(event) => setWechat(event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-line bg-elevated px-3 text-sm text-fg outline-none"
          />
        </label>
        {error === "activate" ? (
          <p className="mt-3 text-sm text-down">请先打开收件邮箱里的 Activate Form 确认信，点一下链接，然后再提交。</p>
        ) : null}
        {error === "send" ? <p className="mt-3 text-sm text-down">暂时未能送出，请稍后再试。</p> : null}
        {error === "wait" ? <p className="mt-3 text-sm text-down">请隔 30 秒再提交。</p> : null}
        <button
          type="submit"
          disabled={sending || wait > 0}
          className="mt-4 h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
        >
          {sending ? "送出中" : wait > 0 ? `${wait} 秒后可再提交` : "提交"}
        </button>
      </form>

      {done ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="inquiry-done" className="w-full max-w-sm rounded-xl border border-line bg-elevated p-5 shadow-lg">
            <h3 id="inquiry-done" className="font-serif text-xl text-fg">资料已提交</h3>
            <p className="mt-2 text-sm text-muted">我们会按你留下的电邮或微信与你联系，说明开户安排。</p>
            <button type="button" onClick={() => setDone(false)} className="mt-4 h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">
              知道了
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
