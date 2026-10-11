export type Lang = "zh-Hant" | "zh-Hans" | "en";

export type Copy = {
  appName: string;
  kicker: string;
  lede: string;
  tenorAria: string;
  tenor: (n: number) => string;
  asOf: (n: number, date: string) => string;
  semi: string;
  modDur: string;
  years: (n: string) => string;
  totalCoupon: string;
  principal: string;
  principalAria: string;
  usd: string;
  hkd: string;
  preset: (n: number) => string;
  navAria: string;
  langAria: string;
  intro: string;
  introMore: string;
  more: string;
  less: string;
  reset: string;
  presetHint: (semi: string) => string;
  tips: { duration: string; basis: string; mark: string };
  feed: { FRED: string; Treasury: string; bundled: string };
  play: {
    play: string;
    pause: string;
    convexity: (n: string, up: string, down: string) => string;
    reinvest: string;
    reinvestNote: (interest: string, total: string) => string;
    replay: string;
    simulate: string;
    simulateOff: string;
    simulateNote: string;
    share: string;
    copied: string;
    ladder: string;
    ladderNote: (semi: string, total: string, dur: string) => string;
    sellWhen: (when: string) => string;
  };
  jumps: { shock: string; cash: string; backtest: string; outlook: string; hold: string };
  footer: (date: string) => string;
  date: (iso: string) => string;
  horizon: (m: number) => string;
  horizonAfter: (m: number) => string;
  axisBuy: string;
  axisMature: string;
  axisYear: (n: number) => string;
  scenarios: Record<"ease" | "firm" | "slump", { name: string; blurb: string }>;
  chart: { yield: string; price: string; entry: string };
  shock: {
    title: string;
    lede: string;
    caption: string;
    yieldAfter: string;
    today: (p: string) => string;
    price: string;
    per100: string;
    vsPar: (p: string) => string;
    pnl: string;
    principalHint: (m: string) => string;
    nearZero: string;
    low2020: string;
    bpUp: (n: number) => string;
    bpDown: (n: number) => string;
    bpFlat: string;
    sliderAria: string;
    todayMark: string;
    plusMax: (n: number) => string;
    mechanics: (dur: string, perPoint: string, perBp: string, date: string, low: string, price: string, pnl: string) => string;
    loss: (amount: string, date: string, principal: string) => string;
    gain: (amount: string) => string;
    flat: string;
    tipBp: string;
    tipPrice: string;
    tipPct: string;
  };
  cash: {
    title: string;
    lede: (coupon: string, date: string) => string;
    principal: string;
    parBack: string;
    semi: string;
    semiHint: (n: number) => string;
    interest: string;
    hold: (n: number) => string;
    total: string;
    period: string;
    date: string;
    interestCol: string;
    principalCol: string;
    sumCol: string;
    collapse: string;
    expand: (n: number) => string;
    note: (semi: string, principal: string) => string;
  };
  backtest: {
    title: string;
    lede: string;
    locked: string;
    beat: (n: number, beat: number) => string;
    underwater: string;
    stillPar: string;
    richer: string;
    count: (n: number) => string;
    richest: (p: string, date: string) => string;
    richestNow: string;
    barTitle: string;
    barNote: string;
    yearEnd: (year: number) => string;
    matured: (date: string) => string;
    open: (price: string, coupons: string) => string;
    more: (amount: string) => string;
    thenHigher: string;
    similar: string;
    pathTitle: (year: number, tenor: number) => string;
    pathDone: (min: string, coupon: string, spot: string) => string;
    pathOpen: (entry: string, years: string, price: string, min: string, date: string, coupon: string) => string;
    gapWin: (principal: string, now: string, year: number, gap: string) => string;
    gapLose: (year: number) => string;
    gapFlat: string;
    untilEnd: string;
    close: string;
    pathNote: (end: string) => string;
  };
  outlook: {
    title: string;
    lede: string;
    yield: (name: string) => string;
    here: string;
    matured: string;
    priceThen: string;
    redeemed: string;
    per100: string;
    pnl: string;
    redeemedWord: string;
    weighted: (p: string) => string;
    done: string;
    live: (name: string, price: string) => string;
  };
  hold: {
    title: string;
    lede: string;
    lossLead: string;
    flatLead: string;
    setup: (move: string, ytm: string) => string;
    flatMove: string;
    upMove: (n: number) => string;
    downMove: (n: number) => string;
    note: string;
    sell: string;
    vsPrincipal: string;
    sellLoss: string[];
    sellGain: string[];
    sellFlat: string[];
    sellRest: (amount: string) => string;
    keep: string;
    keepSub: (interest: string) => string;
    keepPoints: (semi: string, n: number, principal: string) => string[];
    close: string;
  };
};

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function zhDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function enDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${MONTHS_EN[Number(m) - 1]} ${Number(d)}, ${y}`;
}

function wan(n: number, unit: string): string {
  if (n >= 1_000_000) return `${n / 10_000}${unit}`;
  if (n >= 10_000) return `${n / 10_000}${unit}`;
  return String(n);
}

const hant: Copy = {
  appName: "美國國債研究室",
  kicker: "U.S. TREASURY",
  lede: "利率上升，帳面價格下跌；持有至到期，仍可收回本金及利息。",
  tenorAria: "國債年期",
  tenor: (n) => `${n}年`,
  asOf: (n, date) => `${n} 年期孳息 · 截至 ${date}`,
  semi: "每半年",
  modDur: "修正存續期",
  years: (n) => `${n} 年`,
  totalCoupon: "到期總利息",
  principal: "本金",
  principalAria: "本金，美元",
  usd: "美元",
  hkd: "港元",
  preset: (n) => wan(n, "萬"),
  navAria: "章節",
  langAria: "語言",
  intro: "美國國債由財政部發行，每半年派息一次。持有至到期按面值償還本金，所以常被視為保本保息。",
  introMore:
    "市場把國債孳息稱為無風險利率，是因為違約風險被視為極低，並用它作為其他資產的比較基準。穆迪對美國主權的評級現為 Aa1（2025年5月16日由 Aaa 下調一級，展望穩定）；標普自 2011 年、惠譽自 2023 年為 AA+。評級已不是最高一檔。「無風險」指相對其他債券幾乎可忽略的違約風險，不是保證市價不會波動。",
  more: "了解更多",
  less: "收起",
  reset: "回到今日",
  presetHint: (semi) => `每半年 ${semi}`,
  tips: {
    duration: "修正存續期衡量孳息上升 1 個百分點時，價格大約下跌的百分比。年期愈長，數字愈大。",
    basis: "1 基點等於 0.01 個百分點。100 基點就是 1%。",
    mark: "帳面盈虧是今日賣出才會實現的差價。不賣出，就不需要確認這筆虧損。",
  },
  feed: {
    FRED: "孳息跟 FRED 固定期限序列自動更新。",
    Treasury: "最新交易日用美國財政部每日殖利率；過往月份仍是 FRED 固定期限。頁面會自動更新。",
    bundled: "暫時連不上報價來源，顯示最近一次已核對的 FRED 數字。",
  },
  play: {
    play: "播放",
    pause: "暫停",
    convexity: (n, up, down) => `凸性 ${n}。孳息下降 100 基點，價格約升 ${up}；上升 100 基點，價格約跌 ${down}。升幅大於跌幅。`,
    reinvest: "假設利息按鎖定利率再投資至到期",
    reinvestNote: (interest, total) => `按此假設，利息終值為 ${interest}，連同本金一共 ${total}。現金流表仍是每期實際入帳，未計再投資。`,
    replay: "重播市價",
    simulate: "隨機路徑",
    simulateOff: "收起隨機路徑",
    simulateNote: "淡線是示意用的隨機遊走，波幅按年期縮放，不是預測，也不是市場報價。",
    share: "複製連結",
    copied: "已複製",
    ladder: "四期限平均持有",
    ladderNote: (semi, total, dur) => `把本金平均分成 2、5、10、30 年。每半年合計 ${semi}，到期陸續收回的本金加利息約 ${total}，加權修正存續期 ${dur}。下面各節仍只計算目前選中的單一期限。`,
    sellWhen: (when) => `如果在${when}賣出`,
  },
  jumps: { shock: "加減息", cash: "利息", backtest: "回測", outlook: "走勢", hold: "持有到期" },
  footer: (date) =>
    `教學模型：平價新債、每半年派息、半年複利。剩餘年期以固定期限曲線線性插值，不計買賣價差、應計利息、稅項及再投資。港元按聯繫匯率 7.80 折算，僅為約數。情境概率不是市場報價。國債中途可能出現價格虧損；持有至到期才按面值贖回。本頁不是投資建議。資料為 FRED 固定期限孳息率，截至 ${date}。`,
  date: zhDate,
  horizon: (m) => (m === 0 ? "現在" : m < 12 ? `${m}個月` : `${m / 12}年`),
  horizonAfter: (m) => (m < 12 ? `${m}個月後` : `${m / 12}年後`),
  axisBuy: "買入",
  axisMature: "到期",
  axisYear: (n) => `${n}年`,
  scenarios: {
    ease: {
      name: "溫和回落",
      blurb: "通脹逐步回落，聯邦基金利率由約 3.9% 慢慢下調。長債跌幅小於短債，期限溢價仍然存在。",
    },
    firm: {
      name: "高息延續",
      blurb: "通脹黏性較高，國債供應推升期限溢價。孳息再上一個台階，其後才輕微回落。這是帳面價格受損最大的路徑。",
    },
    slump: {
      name: "增長失速",
      blurb: "增長明顯轉弱，減息加快。兩年期跌幅最大，三十年期受期限溢價支撐，跌幅小得多。",
    },
  },
  chart: { yield: "孳息", price: "市價", entry: "買入息" },
  shock: {
    title: "買入之後，加減息對價格",
    lede: "由今日滑動孳息。滑到的一邊才填色：高於本金為綠，低於本金為紅。",
    caption: "橫軸為孳息變動（基點），虛線 100 為本金成本。由今日滑向一邊，該段才填色：高於本金為綠，低於本金為紅。色塊內只有一個百分比，是這一點相對本金的漲跌。",
    yieldAfter: "假設其後孳息",
    today: (p) => `今日 ${p}`,
    price: "帳面價格",
    per100: "每 100 面值",
    vsPar: (p) => `較本金 ${p}`,
    pnl: "帳面盈虧",
    principalHint: (m) => `本金 ${m}`,
    nearZero: "近零息",
    low2020: "2020低位",
    bpUp: (n) => `加 ${n} 基點`,
    bpDown: (n) => `減 ${n} 基點`,
    bpFlat: "不變",
    sliderAria: "假設孳息變動，單位為基點。拉至最左時，孳息接近零。",
    todayMark: "今日",
    plusMax: (n) => `加 ${n}`,
    mechanics: (dur, perPoint, perBp, date, low, price, pnl) =>
      `修正存續期 ${dur} 年。孳息上升 1 個百分點，市價約減少 ${perPoint}，即每 1 基點約 ${perBp}。${date} 這個年期低見過 ${low}；若現在跌回該水平，市價約為 ${price}，帳面 ${pnl}。`,
    loss: (amount, date, principal) =>
      `帳面減少 ${amount}。這筆差額只會在今日賣出時實現。持有至 ${date}，美國財政部仍按面值贖回 ${principal}，每半年利息照常派發。`,
    gain: (amount) =>
      `帳面增加 ${amount}。這同樣是尚未賣出的數字。現在賣出可以鎖定，繼續持有則照收當初鎖定的票息，到期收回本金。`,
    flat: "現時市價貼近成本。移動滑桿，曲線會即時標出新市價，以及相對本金的百分比。",
    tipBp: "孳息變動",
    tipPrice: "市價",
    tipPct: "較本金",
  },
  cash: {
    title: "持有至到期：本金與每半年利息",
    lede: (coupon, date) => `票息鎖定為 ${coupon}。自 ${date} 起每六個月派息一次，最後一期連同本金一併收回。`,
    principal: "本金",
    parBack: "到期按面值償還",
    semi: "每半年派息",
    semiHint: (n) => `一年兩次，共 ${n} 期`,
    interest: "總利息",
    hold: (n) => `持有 ${n} 年`,
    total: "到期一共收回",
    period: "期",
    date: "日期",
    interestCol: "利息",
    principalCol: "本金",
    sumCol: "累計收回",
    collapse: "收起期數",
    expand: (n) => `展開全部 ${n} 期`,
    note: (semi, principal) => `每期利息均為 ${semi}，不會因中途市價升跌而改變。最後一期才另外交還本金 ${principal}。`,
  },
  backtest: {
    title: "現在買入，與過去數年的買入者比較",
    lede: "向前看的是鎖定利率：今日買入，每年利息是否高於當年年底才買入的人。向後看的是舊債市價：低於面值只是帳面，到期日仍然是 100。",
    locked: "今日鎖定",
    beat: (n, beat) => `${n} 個年底之中，高於 ${beat} 個`,
    underwater: "未到期而市價低於面值",
    stillPar: "持有至原本到期日仍收回 100",
    richer: "2015 年以來更高的月份",
    count: (n) => `${n} 個`,
    richest: (p, date) => `最高 ${p}（${date}）`,
    richestNow: "月底序列之中，今日就是最高",
    barTitle: "每年年底的買入息，對照今日",
    barNote: "虛線為今日孳息。柱體低於虛線，表示今日買入所鎖定的利率更高。點選一根柱，查看該年。",
    yearEnd: (year) => `${year} 年底`,
    matured: (date) => `已於 ${date} 到期贖回`,
    open: (price, coupons) => `未到期 · 市價 ${price} · 已收息 ${coupons}`,
    more: (amount) => `今日每年多收 ${amount}`,
    thenHigher: "當年鎖定利率高於今日",
    similar: "鎖定利率與今日相若",
    pathTitle: (year, tenor) => `${year} 年底買入的 ${tenor} 年債，市價如何走`,
    pathDone: (min, coupon, spot) =>
      `這隻債券已經到期。中途市價最低見過 ${min}，最後仍然贖回 100。全程票息只有 ${coupon}；今日再買可以鎖定 ${spot}。`,
    pathOpen: (entry, years, price, min, date, coupon) =>
      `買入息 ${entry}，現在剩餘約 ${years} 年，市價 ${price}。中途最低見過 ${min}。若持有至 ${date}，市價會回到 100，但整段年期都只賺取 ${coupon} 的票息。`,
    gapWin: (principal, now, year, gap) =>
      `同樣 ${principal} 本金，現在每年利息為 ${now}，比 ${year} 年底買入的人多 ${gap}。所謂「現在買入跑贏當年」，跑贏的是其後鎖定的收益率，不是穿越回去贏取他們已經收取的利息。`,
    gapLose: (year) => `當年鎖定利率高於今日。不能說現在入場一定跑贏 ${year} 年底的買入者。`,
    gapFlat: "這一年的買入息與今日很接近。",
    untilEnd: "到期",
    close: "現在買入跑贏的是其後鎖定的收益率，不是把過去已經收取的利息贏回來。",
    pathNote: (end) => `橫軸由買入計至 ${end}。直線 100 為面值。模型以當日曲線估計剩餘年期的收益率。`,
  },
  outlook: {
    title: "未來孳息的三條路徑",
    lede: "由今日的曲線出發。三條線是情境，不是預測。概率合計為 100%，用來比較哪一條對價格的衝擊較大、哪一條對短債較敏感。",
    yield: (name) => `${name}孳息`,
    here: "這條路徑走到此處",
    matured: "已經到期",
    priceThen: "當時市價",
    redeemed: "本金已贖回",
    per100: "每 100 面值",
    pnl: "帳面盈虧",
    redeemedWord: "到期贖回",
    weighted: (p) => `三條路徑的加權孳息 ${p}`,
    done: "到了這個時間，這隻債券已經到期。每半年利息收齊，本金按面值取回，其後的路徑與你無關。",
    live: (name, price) =>
      `若走到「${name}」，帳面價格會變成 ${price}。若不賣出，每半年利息仍然是買入當日鎖定的金額，到期日同樣取回本金。路徑只會影響打算中途賣出的人。`,
  },
  hold: {
    title: "帳面虧損，並不等於虧損本金",
    lede: "市價是別人今日願意支付的價格。收取多少利息、到期取回多少本金，在買入時已經確定，除非中途賣出。",
    lossLead: "持有至到期日，就可以收齊每半年利息，並且取回本金。",
    flatLead: "現時沒有帳面虧損。路徑仍然一樣：利息照派，到期收回面值。",
    setup: (move, ytm) => `假設買入之後孳息${move}，其後停在 ${ytm}。市價會逐步回到面值 100。上一節的滑桿可以改這個起點。`,
    flatMove: "不變",
    upMove: (n) => `即時上升 ${n} 基點`,
    downMove: (n) => `即時下跌 ${n} 基點`,
    note: "每 100 面值。虛線為到期贖回價。年期愈長，起步時的跌幅愈深，但終點都是 100。",
    sell: "如果現在賣出",
    vsPrincipal: "相對本金",
    sellLoss: ["帳面虧損即時實現，不能取回全額本金。", "其後的利息不再享有。", "剩下的是今日的市價，而不是當日的合約。"],
    sellGain: ["帳面收益即時實現。", "其後的利息不再享有。", "剩下的是今日的市價，而不是當日的合約。"],
    sellFlat: ["市價貼近成本，賣出幾乎取回本金。", "其後的利息不再享有。", "剩下的是今日的市價，而不是當日的合約。"],
    sellRest: (amount) => `其後的利息不再享有，錯過 ${amount}。`,
    keep: "如果持有至到期",
    keepSub: (interest) => `利息 ${interest}，本金按面值償還`,
    keepPoints: (semi, n, principal) => [
      `每半年入帳 ${semi}，一共 ${n} 期。`,
      `到期日財政部按面值贖回 ${principal}。`,
      "中途市價可以低於成本，但不賣出，這個數字就不必確認。",
    ],
    close: "需要賣出的原因，通常是要用錢，或者想換成息率更高的新債。如果資金並不急用，價格回撤本身並沒有取消已經鎖定的利息，也沒有取消到期取回本金。",
  },
};

const hans: Copy = {
  appName: "美国国债研究室",
  kicker: "U.S. TREASURY",
  lede: "利率上升，账面价格下跌；持有至到期，仍可收回本金及利息。",
  tenorAria: "国债期限",
  tenor: (n) => `${n}年`,
  asOf: (n, date) => `${n} 年期收益率 · 截至 ${date}`,
  semi: "每半年",
  modDur: "修正久期",
  years: (n) => `${n} 年`,
  totalCoupon: "到期总利息",
  principal: "本金",
  principalAria: "本金，美元",
  usd: "美元",
  hkd: "港元",
  preset: (n) => wan(n, "万"),
  navAria: "章节",
  langAria: "语言",
  intro: "美国国债由财政部发行，每半年派息一次。持有至到期按面值偿还本金，所以常被视为保本保息。",
  introMore:
    "市场把国债收益率称为无风险利率，是因为违约风险被视为极低，并用它作为其他资产的比较基准。穆迪对美国主权的评级现为 Aa1（2025年5月16日由 Aaa 下调一级，展望稳定）；标普自 2011 年、惠誉自 2023 年为 AA+。评级已不是最高一档。「无风险」指相对其他债券几乎可忽略的违约风险，不是保证市价不会波动。",
  more: "了解更多",
  less: "收起",
  reset: "回到今日",
  presetHint: (semi) => `每半年 ${semi}`,
  tips: {
    duration: "修正久期衡量收益率上升 1 个百分点时，价格大约下跌的百分比。期限愈长，数字愈大。",
    basis: "1 基点等于 0.01 个百分点。100 基点就是 1%。",
    mark: "账面盈亏是今日卖出才会实现的差价。不卖出，就不需要确认这笔亏损。",
  },
  feed: {
    FRED: "收益率跟随 FRED 固定期限序列自动更新。",
    Treasury: "最新交易日用美国财政部每日收益率；过往月份仍是 FRED 固定期限。页面会自动更新。",
    bundled: "暂时连不上报价来源，显示最近一次已核对的 FRED 数字。",
  },
  play: {
    play: "播放",
    pause: "暂停",
    convexity: (n, up, down) => `凸性 ${n}。收益率下降 100 基点，价格约升 ${up}；上升 100 基点，价格约跌 ${down}。升幅大于跌幅。`,
    reinvest: "假设利息按锁定利率再投资至到期",
    reinvestNote: (interest, total) => `按此假设，利息终值为 ${interest}，连同本金一共 ${total}。现金流表仍是每期实际入账，未计再投资。`,
    replay: "重播市价",
    simulate: "随机路径",
    simulateOff: "收起随机路径",
    simulateNote: "淡线是示意用的随机游走，波幅按期限缩放，不是预测，也不是市场报价。",
    share: "复制链接",
    copied: "已复制",
    ladder: "四期限平均持有",
    ladderNote: (semi, total, dur) => `把本金平均分成 2、5、10、30 年。每半年合计 ${semi}，到期陆续收回的本金加利息约 ${total}，加权修正久期 ${dur}。下面各节仍只计算目前选中的单一期限。`,
    sellWhen: (when) => `如果在${when}卖出`,
  },
  jumps: { shock: "加减息", cash: "利息", backtest: "回测", outlook: "走势", hold: "持有到期" },
  footer: (date) =>
    `教学模型：平价新债、每半年派息、半年复利。剩余期限以固定期限曲线线性插值，不计买卖价差、应计利息、税项及再投资。港元按联系汇率 7.80 折算，仅为约数。情境概率不是市场报价。国债中途可能出现价格亏损；持有至到期才按面值赎回。本页不是投资建议。资料为 FRED 固定期限收益率，截至 ${date}。`,
  date: zhDate,
  horizon: (m) => (m === 0 ? "现在" : m < 12 ? `${m}个月` : `${m / 12}年`),
  horizonAfter: (m) => (m < 12 ? `${m}个月后` : `${m / 12}年后`),
  axisBuy: "买入",
  axisMature: "到期",
  axisYear: (n) => `${n}年`,
  scenarios: {
    ease: {
      name: "温和回落",
      blurb: "通胀逐步回落，联邦基金利率由约 3.9% 慢慢下调。长债跌幅小于短债，期限溢价仍然存在。",
    },
    firm: {
      name: "高息延续",
      blurb: "通胀黏性较高，国债供应推升期限溢价。收益率再上一个台阶，其后才轻微回落。这是账面价格受损最大的路径。",
    },
    slump: {
      name: "增长失速",
      blurb: "增长明显转弱，减息加快。两年期跌幅最大，三十年期受期限溢价支撑，跌幅小得多。",
    },
  },
  chart: { yield: "收益率", price: "市价", entry: "买入收益率" },
  shock: {
    title: "买入之后，加减息对价格",
    lede: "由今日滑动收益率。滑到的一边才填色：高于本金为绿，低于本金为红。",
    caption: "横轴为收益率变动（基点），虚线 100 为本金成本。由今日滑向一边，该段才填色：高于本金为绿，低于本金为红。色块内只有一个百分比，是这一点相对本金的涨跌。",
    yieldAfter: "假设其后收益率",
    today: (p) => `今日 ${p}`,
    price: "账面价格",
    per100: "每 100 面值",
    vsPar: (p) => `较本金 ${p}`,
    pnl: "账面盈亏",
    principalHint: (m) => `本金 ${m}`,
    nearZero: "近零息",
    low2020: "2020低位",
    bpUp: (n) => `加 ${n} 基点`,
    bpDown: (n) => `减 ${n} 基点`,
    bpFlat: "不变",
    sliderAria: "假设收益率变动，单位为基点。拉至最左时，收益率接近零。",
    todayMark: "今日",
    plusMax: (n) => `加 ${n}`,
    mechanics: (dur, perPoint, perBp, date, low, price, pnl) =>
      `修正久期 ${dur} 年。收益率上升 1 个百分点，市价约减少 ${perPoint}，即每 1 基点约 ${perBp}。${date} 这个期限低见过 ${low}；若现在跌回该水平，市价约为 ${price}，账面 ${pnl}。`,
    loss: (amount, date, principal) =>
      `账面减少 ${amount}。这笔差额只会在今日卖出时实现。持有至 ${date}，美国财政部仍按面值赎回 ${principal}，每半年利息照常派发。`,
    gain: (amount) =>
      `账面增加 ${amount}。这同样是尚未卖出的数字。现在卖出可以锁定，继续持有则照收当初锁定的票面利息，到期收回本金。`,
    flat: "现时市价贴近成本。移动滑杆，曲线会即时标出新市价，以及相对本金的百分比。",
    tipBp: "收益率变动",
    tipPrice: "市价",
    tipPct: "较本金",
  },
  cash: {
    title: "持有至到期：本金与每半年利息",
    lede: (coupon, date) => `票面利率锁定为 ${coupon}。自 ${date} 起每六个月派息一次，最后一期连同本金一并收回。`,
    principal: "本金",
    parBack: "到期按面值偿还",
    semi: "每半年派息",
    semiHint: (n) => `一年两次，共 ${n} 期`,
    interest: "总利息",
    hold: (n) => `持有 ${n} 年`,
    total: "到期一共收回",
    period: "期",
    date: "日期",
    interestCol: "利息",
    principalCol: "本金",
    sumCol: "累计收回",
    collapse: "收起期数",
    expand: (n) => `展开全部 ${n} 期`,
    note: (semi, principal) => `每期利息均为 ${semi}，不会因中途市价涨跌而改变。最后一期才另外交还本金 ${principal}。`,
  },
  backtest: {
    title: "现在买入，与过去数年的买入者比较",
    lede: "向前看的是锁定利率：今日买入，每年利息是否高于当年年底才买入的人。向后看的是旧债市价：低于面值只是账面，到期日仍然是 100。",
    locked: "今日锁定",
    beat: (n, beat) => `${n} 个年底之中，高于 ${beat} 个`,
    underwater: "未到期而市价低于面值",
    stillPar: "持有至原本到期日仍收回 100",
    richer: "2015 年以来更高的月份",
    count: (n) => `${n} 个`,
    richest: (p, date) => `最高 ${p}（${date}）`,
    richestNow: "月底序列之中，今日就是最高",
    barTitle: "每年年底的买入收益率，对照今日",
    barNote: "虚线为今日收益率。柱体低于虚线，表示今日买入所锁定的利率更高。点选一根柱，查看该年。",
    yearEnd: (year) => `${year} 年底`,
    matured: (date) => `已于 ${date} 到期赎回`,
    open: (price, coupons) => `未到期 · 市价 ${price} · 已收息 ${coupons}`,
    more: (amount) => `今日每年多收 ${amount}`,
    thenHigher: "当年锁定利率高于今日",
    similar: "锁定利率与今日相若",
    pathTitle: (year, tenor) => `${year} 年底买入的 ${tenor} 年债，市价如何走`,
    pathDone: (min, coupon, spot) =>
      `这只债券已经到期。中途市价最低见过 ${min}，最后仍然赎回 100。全程票面利率只有 ${coupon}；今日再买可以锁定 ${spot}。`,
    pathOpen: (entry, years, price, min, date, coupon) =>
      `买入收益率 ${entry}，现在剩余约 ${years} 年，市价 ${price}。中途最低见过 ${min}。若持有至 ${date}，市价会回到 100，但整段期限都只赚取 ${coupon} 的票面利息。`,
    gapWin: (principal, now, year, gap) =>
      `同样 ${principal} 本金，现在每年利息为 ${now}，比 ${year} 年底买入的人多 ${gap}。所谓「现在买入跑赢当年」，跑赢的是其后锁定的收益率，不是穿越回去赢取他们已经收取的利息。`,
    gapLose: (year) => `当年锁定利率高于今日。不能说现在入场一定跑赢 ${year} 年底的买入者。`,
    gapFlat: "这一年的买入收益率与今日很接近。",
    untilEnd: "到期",
    close: "现在买入跑赢的是其后锁定的收益率，不是把过去已经收取的利息赢回来。",
    pathNote: (end) => `横轴由买入计至 ${end}。直线 100 为面值。模型以当日曲线估计剩余期限的收益率。`,
  },
  outlook: {
    title: "未来收益率的三条路径",
    lede: "由今日的曲线出发。三条线是情境，不是预测。概率合计为 100%，用来比较哪一条对价格的冲击较大、哪一条对短债较敏感。",
    yield: (name) => `${name}收益率`,
    here: "这条路径走到此处",
    matured: "已经到期",
    priceThen: "当时市价",
    redeemed: "本金已赎回",
    per100: "每 100 面值",
    pnl: "账面盈亏",
    redeemedWord: "到期赎回",
    weighted: (p) => `三条路径的加权收益率 ${p}`,
    done: "到了这个时间，这只债券已经到期。每半年利息收齐，本金按面值取回，其后的路径与你无关。",
    live: (name, price) =>
      `若走到「${name}」，账面价格会变成 ${price}。若不卖出，每半年利息仍然是买入当日锁定的金额，到期日同样取回本金。路径只会影响打算中途卖出的人。`,
  },
  hold: {
    title: "账面亏损，并不等于亏损本金",
    lede: "市价是别人今日愿意支付的价格。收取多少利息、到期取回多少本金，在买入时已经确定，除非中途卖出。",
    lossLead: "持有至到期日，就可以收齐每半年利息，并且取回本金。",
    flatLead: "现时没有账面亏损。路径仍然一样：利息照派，到期收回面值。",
    setup: (move, ytm) => `假设买入之后收益率${move}，其后停在 ${ytm}。市价会逐步回到面值 100。上一节的滑杆可以改这个起点。`,
    flatMove: "不变",
    upMove: (n) => `即时上升 ${n} 基点`,
    downMove: (n) => `即时下跌 ${n} 基点`,
    note: "每 100 面值。虚线为到期赎回价。期限愈长，起步时的跌幅愈深，但终点都是 100。",
    sell: "如果现在卖出",
    vsPrincipal: "相对本金",
    sellLoss: ["账面亏损即时实现，不能取回全额本金。", "其后的利息不再享有。", "剩下的是今日的市价，而不是当日的合约。"],
    sellGain: ["账面收益即时实现。", "其后的利息不再享有。", "剩下的是今日的市价，而不是当日的合约。"],
    sellFlat: ["市价贴近成本，卖出几乎取回本金。", "其后的利息不再享有。", "剩下的是今日的市价，而不是当日的合约。"],
    sellRest: (amount) => `其后的利息不再享有，错过 ${amount}。`,
    keep: "如果持有至到期",
    keepSub: (interest) => `利息 ${interest}，本金按面值偿还`,
    keepPoints: (semi, n, principal) => [
      `每半年入账 ${semi}，一共 ${n} 期。`,
      `到期日财政部按面值赎回 ${principal}。`,
      "中途市价可以低于成本，但不卖出，这个数字就不必确认。",
    ],
    close: "需要卖出的原因，通常是要用钱，或者想换成利率更高的新债。如果资金并不急用，价格回撤本身并没有取消已经锁定的利息，也没有取消到期取回本金。",
  },
};

const en: Copy = {
  appName: "Treasury Desk",
  kicker: "U.S. TREASURY",
  lede: "When yields rise, the mark falls. Hold to maturity and principal plus coupons still come back.",
  tenorAria: "Treasury tenor",
  tenor: (n) => `${n}Y`,
  asOf: (n, date) => `${n}Y yield · as of ${date}`,
  semi: "Semiannual",
  modDur: "Modified duration",
  years: (n) => `${n} years`,
  totalCoupon: "Coupons to maturity",
  principal: "Principal",
  principalAria: "Principal in dollars",
  usd: "USD",
  hkd: "HKD",
  preset: (n) => (n >= 1_000_000 ? `${n / 1_000_000}m` : `${n / 1_000}k`),
  navAria: "Sections",
  langAria: "Language",
  intro: "The U.S. Treasury issues these bonds and pays a coupon every six months. Hold to maturity and principal is repaid at par, which is why they are treated as preserving principal and income.",
  introMore:
    "Treasury yields are called the risk-free rate because default risk is treated as negligible, and other assets are priced against them. Moody’s rates the United States Aa1 (cut from Aaa on 16 May 2025, outlook stable). S&P has been AA+ since 2011, and Fitch since 2023. The rating is no longer the top notch. “Risk-free” means default risk that is small next to other bonds, not a promise that the market price cannot move.",
  more: "More",
  less: "Less",
  reset: "Back to today",
  presetHint: (semi) => `${semi} each coupon`,
  tips: {
    duration: "Modified duration is about how many percent the price falls if the yield rises by 1 percentage point. Longer bonds have a larger number.",
    basis: "One basis point is 0.01 percentage point. 100 basis points is 1%.",
    mark: "Mark-to-market profit or loss is realized only if you sell today. If you do not sell, you do not have to take that number.",
  },
  feed: {
    FRED: "Yields refresh automatically from the FRED constant-maturity series.",
    Treasury: "The latest session uses the Treasury daily par curve. Earlier months stay on FRED constant-maturity yields. The page refreshes on its own.",
    bundled: "The quote feed is unreachable, so this is the last checked FRED print.",
  },
  play: {
    play: "Play",
    pause: "Pause",
    convexity: (n, up, down) => `Convexity ${n}. A 100 bp drop lifts price by about ${up}. A 100 bp rise cuts it by about ${down}. The gain is larger than the loss.`,
    reinvest: "Assume coupons are reinvested at the locked yield until maturity",
    reinvestNote: (interest, total) => `On that assumption the coupons grow to ${interest}, and principal plus coupons is ${total}. The table is still the cash you receive, before reinvestment.`,
    replay: "Replay the price",
    simulate: "Random paths",
    simulateOff: "Hide random paths",
    simulateNote: "The faint lines are an illustrative random walk. Volatility scales with tenor. They are not a forecast and not a market quote.",
    share: "Copy link",
    copied: "Copied",
    ladder: "Equal ladder: 2, 5, 10 and 30 years",
    ladderNote: (semi, total, dur) => `Principal is split evenly across 2, 5, 10 and 30 years. Semiannual cash is ${semi}. Principal plus coupons coming back over time is about ${total}. Weighted modified duration is ${dur}. The sections below still use only the selected tenor.`,
    sellWhen: (when) => `If you sell ${when}`,
  },
  jumps: { shock: "Yield shock", cash: "Coupons", backtest: "History", outlook: "Paths", hold: "Hold to maturity" },
  footer: (date) =>
    `Teaching model: a new par bond, semiannual coupons, semiannual compounding. Remaining maturity is read off the constant-maturity curve by linear interpolation. Spreads, accrued interest, tax, and reinvestment are ignored. Hong Kong dollars use the 7.80 peg and are approximate. Scenario probabilities are not market prices. A Treasury can lose price before maturity; par is paid only if you hold to redemption. This page is not investment advice. Data are FRED constant-maturity yields, as of ${date}.`,
  date: enDate,
  horizon: (m) => (m === 0 ? "Now" : m < 12 ? `${m} months` : m === 12 ? "1 year" : m === 18 ? "1.5 years" : `${m / 12} years`),
  horizonAfter: (m) => (m < 12 ? `In ${m} months` : m === 12 ? "In 1 year" : m === 18 ? "In 1.5 years" : `In ${m / 12} years`),
  axisBuy: "Buy",
  axisMature: "Maturity",
  axisYear: (n) => `${n}y`,
  scenarios: {
    ease: {
      name: "Soft easing",
      blurb: "Inflation cools and the funds rate drifts down from about 3.9%. Long yields fall less than short yields. Term premium stays.",
    },
    firm: {
      name: "Higher for longer",
      blurb: "Sticky inflation and Treasury supply lift term premium. Yields step up, then ease only a little. This path hurts mark-to-market price the most.",
    },
    slump: {
      name: "Growth break",
      blurb: "Growth weakens and cuts arrive faster. The two-year falls the most. The thirty-year is held up by term premium and falls much less.",
    },
  },
  chart: { yield: "Yield", price: "Price", entry: "Entry yield" },
  shock: {
    title: "Price after a yield move",
    lede: "Slide the yield from today. Color appears only on that side: green above principal, red below.",
    caption: "The horizontal axis is the yield change in basis points. The dashed line at 100 is your cost. Color appears only on the side you slide to: green when price is above principal, red when it is below. The single percentage is that point’s gain or loss versus principal.",
    yieldAfter: "Yield after the move",
    today: (p) => `Today ${p}`,
    price: "Mark-to-market price",
    per100: "Per 100 face",
    vsPar: (p) => `vs principal ${p}`,
    pnl: "Mark-to-market P&L",
    principalHint: (m) => `Principal ${m}`,
    nearZero: "Near zero",
    low2020: "2020 low",
    bpUp: (n) => `+${n} bp`,
    bpDown: (n) => `−${n} bp`,
    bpFlat: "Unchanged",
    sliderAria: "Hypothetical yield change in basis points. The far left is a near-zero yield.",
    todayMark: "Today",
    plusMax: (n) => `+${n}`,
    mechanics: (dur, perPoint, perBp, date, low, price, pnl) =>
      `Modified duration is ${dur} years. A 1 percentage point rise in yield cuts price by about ${perPoint}, or about ${perBp} per basis point. This tenor printed ${low} on ${date}. A return to that yield would put price near ${price}, a mark of ${pnl}.`,
    loss: (amount, date, principal) =>
      `The mark is down ${amount}. That gap is realized only if you sell today. Hold to ${date} and the U.S. Treasury still redeems ${principal} at par. The semiannual coupon keeps paying.`,
    gain: (amount) =>
      `The mark is up ${amount}. That number is unrealized. Selling now locks it in. Holding keeps the coupon you locked at purchase, and principal comes back at maturity.`,
    flat: "Price is on top of cost. Move the slider and the curve marks the new price, and the percentage versus principal.",
    tipBp: "Yield change",
    tipPrice: "Price",
    tipPct: "vs principal",
  },
  cash: {
    title: "Hold to maturity: principal and the semiannual coupon",
    lede: (coupon, date) => `The coupon is locked at ${coupon}. From ${date}, it pays every six months. The last payment includes principal.`,
    principal: "Principal",
    parBack: "Repaid at par",
    semi: "Each coupon",
    semiHint: (n) => `Twice a year, ${n} payments`,
    interest: "Total coupons",
    hold: (n) => `Held ${n} years`,
    total: "Cash back at maturity",
    period: "#",
    date: "Date",
    interestCol: "Coupon",
    principalCol: "Principal",
    sumCol: "Cumulative",
    collapse: "Show fewer",
    expand: (n) => `Show all ${n}`,
    note: (semi, principal) =>
      `Each coupon is ${semi}. A price move in between does not change it. Only the last date also returns principal of ${principal}.`,
  },
  backtest: {
    title: "Buying now, against people who bought in prior years",
    lede: "Looking forward, the locked yield: does today’s buyer earn more coupon each year than someone who bought at a prior year-end? Looking back, old bond prices: a print below par is a mark. Maturity is still 100.",
    locked: "Locked today",
    beat: (n, beat) => `Higher than ${beat} of ${n} year-ends`,
    underwater: "Still open, price below par",
    stillPar: "Held to the original maturity, they still receive 100",
    richer: "Higher months since 2015",
    count: (n) => `${n}`,
    richest: (p, date) => `Peak ${p} (${date})`,
    richestNow: "In the month-end series, today is the high",
    barTitle: "Year-end entry yield, against today",
    barNote: "The dashed line is today’s yield. A shorter bar means today’s locked yield is higher. Select a bar to open that year.",
    yearEnd: (year) => `${year} year-end`,
    matured: (date) => `Redeemed ${date}`,
    open: (price, coupons) => `Still open · price ${price} · coupons received ${coupons}`,
    more: (amount) => `You earn ${amount} more per year`,
    thenHigher: "That year’s locked yield is higher",
    similar: "That locked yield is close to today",
    pathTitle: (year, tenor) => `${year} year-end ${tenor}Y: how the price moved`,
    pathDone: (min, coupon, spot) =>
      `This bond has matured. The lowest mark along the way was ${min}, and it still redeemed at 100. The coupon for the whole life was only ${coupon}. Buying today locks ${spot}.`,
    pathOpen: (entry, years, price, min, date, coupon) =>
      `Entry yield ${entry}. About ${years} years remain, and the price is ${price}. The lowest mark was ${min}. If held to ${date}, price returns to 100, but the coupon for the whole life is only ${coupon}.`,
    gapWin: (principal, now, year, gap) =>
      `On the same ${principal}, today’s annual coupon is ${now}, which is ${gap} more than the ${year} year-end buyer. “Buying now beats that year” means the yield you lock from here. It does not mean you collect coupons they already received.`,
    gapLose: (year) => `That year’s locked yield is higher than today’s. Buying now does not automatically beat the ${year} year-end buyer.`,
    gapFlat: "That year’s entry yield is close to today’s.",
    untilEnd: "maturity",
    close: "Buying now beats a prior year on the yield you lock from here, not on coupons already collected.",
    pathNote: (end) => `The axis runs from purchase to ${end}. The line at 100 is par. Remaining yield is read from that day’s curve.`,
  },
  outlook: {
    title: "Three paths for the yield",
    lede: "Start from today’s curve. The three lines are scenarios, not forecasts. The probabilities sum to 100%. They show which path hurts price, and which one the short end feels first.",
    yield: (name) => `${name} yield`,
    here: "This path, at this point",
    matured: "Already matured",
    priceThen: "Price then",
    redeemed: "Principal repaid",
    per100: "Per 100 face",
    pnl: "Mark-to-market P&L",
    redeemedWord: "Redeemed",
    weighted: (p) => `Probability-weighted yield ${p}`,
    done: "By this date the bond has matured. Coupons have been paid and principal is back at par. Later paths do not concern you.",
    live: (name, price) =>
      `On “${name}”, the mark would be ${price}. If you do not sell, the semiannual coupon is still the one locked on purchase day, and principal still returns at maturity. The path only matters to someone who sells early.`,
  },
  hold: {
    title: "A mark-to-market loss is not a loss of principal",
    lede: "The market price is what someone will pay today. The coupon you receive, and the principal you get back at maturity, were fixed when you bought — unless you sell in between.",
    lossLead: "Hold to the maturity date and you collect every semiannual coupon, then the principal.",
    flatLead: "There is no mark-to-market loss now. The path is the same: coupons keep paying, and par comes back at maturity.",
    setup: (move, ytm) =>
      `Suppose the yield ${move} after you buy and then stays at ${ytm}. Price walks back to par at 100. The slider in the previous section changes this starting point.`,
    flatMove: "does not change",
    upMove: (n) => `jumps ${n} bp`,
    downMove: (n) => `drops ${n} bp`,
    note: "Per 100 of face. The dashed line is the redemption price. A longer bond opens further from par, and still ends at 100.",
    sell: "If you sell now",
    vsPrincipal: "Versus principal",
    sellLoss: [
      "The mark-to-market loss is realized. You do not get the full principal back.",
      "You give up the remaining coupons.",
      "What you keep is today’s price, not the contract you bought.",
    ],
    sellGain: [
      "The mark-to-market gain is realized.",
      "You give up the remaining coupons.",
      "What you keep is today’s price, not the contract you bought.",
    ],
    sellFlat: [
      "Price is near cost, so a sale returns about the principal.",
      "You give up the remaining coupons.",
      "What you keep is today’s price, not the contract you bought.",
    ],
    sellRest: (amount) => `You give up the remaining coupons, ${amount} in total.`,
    keep: "If you hold to maturity",
    keepSub: (interest) => `Coupons ${interest}, principal repaid at par`,
    keepPoints: (semi, n, principal) => [
      `${semi} every six months, ${n} payments.`,
      `On the maturity date the Treasury redeems ${principal} at par.`,
      "The price can sit below cost along the way. If you do not sell, you do not have to take that number.",
    ],
    close: "A sale usually means you need the cash, or you want to switch into a higher yield. If the money is not needed, a price drawdown does not cancel the coupon you locked, and it does not cancel principal at maturity.",
  },
};

export const COPY: Record<Lang, Copy> = {
  "zh-Hant": hant,
  "zh-Hans": hans,
  en,
};

export function htmlLang(lang: Lang): string {
  if (lang === "zh-Hans") return "zh-Hans";
  if (lang === "en") return "en";
  return "zh-Hant";
}
