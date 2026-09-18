(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Compensation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const thresholds = [0, 200000, 600000, 1200000, 2400000, 4000000, 6800000, 10000000];
  const rates = [0, 3, 6, 9, 12, 15, 18, 21];
  const pins = ["bronze", "silver", "gold", "platinum", "ruby", "foundersPlatinum", "foundersRuby", "sapphire", "foundersSapphire", "emerald", "foundersEmerald", "diamond", "foundersDiamond", "executiveDiamond", "foundersExecutiveDiamond", "doubleDiamond", "foundersDoubleDiamond", "tripleDiamond", "foundersTripleDiamond", "crown", "foundersCrown", "crownAmbassador", "foundersCrownAmbassador"];
  const gar = [["executiveDiamond",6,10],["foundersExecutiveDiamond",6,16],["doubleDiamond",8,25],["foundersDoubleDiamond",8,34],["tripleDiamond",10,43],["foundersTripleDiamond",10,52],["crown",12,64],["foundersCrown",12,76],["crownAmbassador",14,88],["foundersCrownAmbassador",14,100]];
  const consecutive = {platinum:1800000, foundersPlatinum:3600000, sapphire:4700000, foundersSapphire:7100000, emerald:9500000, foundersEmerald:11900000, diamond:14800000, foundersDiamond:17800000};
  const ttca = Object.fromEntries(gar.map((row, i) => [row[0], [[3120,1040],[3560,1190],[4450,1480],[6230,2080],[8010,2670],[10680,3560],[14240,4750],[17800,5930],[21360,7120],[24920,8310]][i].map(n => n * 10000)]));
  const number = x => Math.max(0, Number(x) || 0);
  const months = x => Math.min(12, Math.floor(number(x)));
  const index = key => pins.indexOf(key);
  const atLeast = (key, target) => index(key) >= index(target) && index(key) >= 0;
  const rateFor = pv => thresholds.reduce((r, threshold, i) => pv >= threshold ? rates[i] : r, 0);
  const q12 = r => months(r.spMonths) === 12 || (months(r.spMonths) >= 10 && (number(r.annualGroupPv) >= 120000000 || number(r.annualVePv) >= 144000000));
  const platinum = r => Boolean(r.platinumRetained) || (months(r.spMonths) >= 6 && (r.requalification || months(r.consecutiveSpMonths) >= 3));

  function evaluate(people, records = {}, bvRatio = 1, rootId = "me") {
    const children = new Map(people.map(p => [p.id, []]));
    const byId = new Map(people.map(p => [p.id, p]));
    for (const p of people) if (children.has(p.parentId)) children.get(p.parentId).push(p.id);
    const nodes = new Map();
    const visiting = new Set();
    function visit(id, depth = 0) {
      if (visiting.has(id)) throw new Error("Cyclic sponsor structure");
      visiting.add(id);
      const p = byId.get(id), r = records[id] || {};
      const direct = children.get(id).map(child => visit(child, depth + 1));
      const own = number(p.ownPv);
      const gpv = own + direct.filter(c => c.rate < 21).reduce((s,c) => s+c.gpv, 0);
      const rate = Math.max(rateFor(gpv), ...direct.map(c => c.rate));
      const legs = direct.filter(c => c.rate === 21);
      const rubyPv = own + direct.filter(c => c.rate < 21 && !platinum(c.record)).reduce((s,c) => s+c.rubyPv, 0);
      const spQualified = gpv >= 10000000 || (legs.length >= 1 && gpv >= 4000000) || legs.length >= 2;
      const bv = gpv * bvRatio;
      const performanceBonus = Math.max(0, bv * rate / 100 - direct.filter(c => c.rate < 21).reduce((s,c) => s+c.gpv*bvRatio*c.rate/100, 0));
      // Each 21% group exports its own generated bonus plus any guarantee shortfall passed up.
      const leadershipIncoming = legs.reduce((s,c) => s+c.leadershipExport, 0);
      const leadershipWithheld = spQualified ? Math.min(leadershipIncoming, Math.max(0, 10000000*bvRatio*.06 - bv*.06)) : leadershipIncoming;
      const leadershipBonus = leadershipIncoming - leadershipWithheld;
      const leadershipExport = bv*.06 + leadershipWithheld;
      const mdQualified = spQualified && legs.length >= 3;
      const sixMonthLegs = direct.filter(c => months(c.record.spMonths) >= 6).length;
      const q12Legs = direct.filter(c => q12(c.record)).length;
      const fq = direct.reduce((s,c) => s + (q12(c.record) ? 12 : months(c.record.fqMonths)), 0);
      let key = `rate${rate}`;
      if (rate >= 15 && direct.filter(c => c.rate >= 6).length >= 3 && r.builderEligible) key = "bronze";
      if (spQualified) key = "silver";
      if (months(r.spMonths) >= 3) key = "gold";
      if (platinum(r)) {
        key = q12(r) ? "foundersPlatinum" : "platinum";
        if (rubyPv >= 20000000 && !q12(r)) key = "ruby";
        if (months(r.rubyMonths) === 12) key = "foundersRuby";
        if (months(r.sapphireMonths) >= 6) key = "sapphire";
        if (months(r.sapphireMonths) === 12 || (months(r.sapphireMonths) >= 10 && number(r.annualVePv) >= 345600000)) key = "foundersSapphire";
        if (sixMonthLegs >= 3) key = "emerald";
        if (q12Legs >= 3) key = "foundersEmerald";
        if (sixMonthLegs >= 6) key = "diamond";
        if (q12Legs >= 6) key = "foundersDiamond";
        // GAR QC is a verified input: per-leg caps and international eligibility cannot be inferred from one month.
        if (q12Legs >= 6 && r.ebrVerified) for (const [candidate, fpt, qc] of gar) {
          if (number(r.garFptLegs) >= fpt && number(r.qc) >= qc) key = candidate;
        }
      }
      const node = {id, record:r, direct, depth, ownPv:own, totalPv:own+direct.reduce((s,c)=>s+c.totalPv,0), gpv, rubyPv, rate, legs, spQualified, mdQualified, sixMonthLegs, q12Legs, fq, qc:number(r.qc), q12Achieved:q12(r), key, performanceBonus, leadershipBonus, leadershipExport, rubyBonus:rubyPv >= 20000000 ? rubyPv*bvRatio*.02 : 0, mdBonus:0};
      nodes.set(id, node);
      visiting.delete(id);
      return node;
    }
    visit(rootId);
    // Include the first MD recipient and their first 21% groups, but not the next generation.
    function mdVolume(n) {
      if (n.mdQualified) return n.gpv + n.legs.reduce((s,c)=>s+c.gpv,0);
      return n.gpv + n.legs.reduce((s,c)=>s+mdVolume(c),0);
    }
    for (const n of nodes.values()) if (n.mdQualified) {
      n.mdBonus = n.legs.reduce((sum, leg) => {
        const generated = leg.legs.reduce((s,c)=>s+mdVolume(c),0)*bvRatio*.01;
        return sum + Math.max(0, generated - Math.max(0, 10000000*bvRatio*.01-leg.gpv*bvRatio*.01));
      }, 0);
    }
    for (const n of nodes.values()) n.monthlyTotal = n.performanceBonus+n.rubyBonus+n.leadershipBonus+n.mdBonus;
    return {nodes, root:nodes.get(rootId)};
  }

  function annual(n, r) {
    const key = n.key, result = [];
    const add = (label, amount, note) => result.push({label, amount, note});
    const complete = keys => keys.every(k => r[k] !== undefined && r[k] !== "");
    if (!r.goodStanding) return [{label:"연간 인센티브", amount:null, note:"Good Standing 및 유효 실적 확인 필요"}];
    if (r.previousPin && complete(["pqMonths","previousPq"]) && atLeast(key, "platinum") && !atLeast(key,"executiveDiamond")) {
      const maintained = index(key) >= index(r.previousPin);
      let pq = months(r.pqMonths), previous = months(r.previousPq);
      const special = key === "foundersPlatinum" && previous === 12 && (pq === 10 || pq === 11);
      if (maintained && (pq >= previous || special) && pq >= 6) {
        add("퍼스널 그룹 성장", pq === 12 ? 10000000 : pq > previous ? (pq >= 9 ? 8000000 : 6000000) : 4000000, "연간 PQ 기록 기준");
      }
    }
    if (r.previousPin && complete(["previousFq"]) && n.direct.every(c => q12(c.record) || c.record.fqMonths !== undefined) && atLeast(key,"foundersPlatinum") && index(key) >= index(r.previousPin) && n.fq >= number(r.previousFq)) {
      const growth = n.fq-number(r.previousFq);
      if (key === "foundersPlatinum") add("프론트라인 성장", growth >= 6 ? 7000000 : growth >= 3 ? 5000000 : growth >= 1 ? 3000000 : 1000000, "정액 지급");
      else if (atLeast(key,"foundersRuby") && complete(["annualLeadershipMd"])) {
        const diamond = atLeast(key,"diamond");
        const percent = growth >= 6 ? (diamond ? .8 : .7) : growth >= 3 ? (diamond ? .6 : .5) : growth >= 1 ? (diamond ? .4 : .3) : (diamond ? .2 : .1);
        add("프론트라인 성장", number(r.annualLeadershipMd)*percent, `연간 리더십+MD 기준 ${Math.round(percent*100)}%`);
        if (diamond && growth >= 12) add("이듬해 추가분", null, `기준액의 20% (${Math.round(number(r.annualLeadershipMd)*.2).toLocaleString("ko-KR")}원), 이듬해 핀/FQ 유지 조건부`);
      }
    }
    if (r.previousPin && complete(["previousQc","qc","annualCore"]) && atLeast(key,"executiveDiamond") && n.sixMonthLegs >= 6 && index(key)>=index(r.previousPin) && n.qc>=number(r.previousQc)) {
      const group = Math.floor((index(key)-index("executiveDiamond"))/2);
      const growth = n.qc-number(r.previousQc);
      const percent = [[.2,.3,.4],[.25,.35,.5],[.35,.5,.7],[.5,.75,1],[.65,1,1.3]][group][growth>=3?2:growth>=1?1:0];
      add("QC 성장", number(r.annualCore)*percent, "연간 월 코어 합계 기준, 국제 후원 리더십 제외");
    }
    if (r.consecutiveMode === "first" && consecutive[key]) add("연속 달성: 최초", consecutive[key], "국내 해당 핀 최초 달성 확인 전제");
    if (r.consecutiveMode === "repeat" && consecutive[key]) add("연속 달성: 재달성", consecutive[key], "직전 회계연도 최초 달성 후 재달성 확인 전제");
    if (r.consecutiveMode === "none" && r.highestPin === key && atLeast(key,"emerald") && consecutive[key]) add("핀 유지", consecutive[key], "최고 달성 핀 재달성, 당해 연속 달성 인센티브 미수혜");
    if (ttca[key] && ["first","repeat"].includes(r.ttcaMode)) add("TTCA", ttca[key][r.ttcaMode === "first" ? 0 : 1], "GAR 신규 최고 핀 / 바로 이듬해 재달성 확인 전제");
    return result;
  }
  function builder(n, r) {
    return n.rate >= 15 && n.direct.filter(c => c.rate >= 6).length >= 3
      && r.builderEligible && r.goodStanding
      && number(r.builderElapsed) >= 1 && number(r.builderElapsed) <= 18
      && r.builderPaid !== undefined && number(r.builderPaid) < 12 ? 300000 : 0;
  }
  function trip(n, r) {
    if (!r.goodStanding) return "Good Standing 확인 필요";
    if (atLeast(n.key,"diamond")) return "PF26 다이아몬드 이상 참석 조건 충족 후보";
    if (!atLeast(n.key,"foundersPlatinum")) return "PF26 마감 파운더스 플래티넘 이상 필요";
    if (n.key === "foundersPlatinum" && r.firstTrip && number(r.annualGroupPv)>=150000000) return "첫 참석 연간 개인 그룹 PV 1억 5천만 조건 충족 후보";
    if (r.previousFq === undefined || !n.direct.every(c => q12(c.record) || c.record.fqMonths !== undefined)) return "전년/올해 FQ 기록 확인 필요";
    if (n.fq-number(r.previousFq)<3) return "전년 대비 FQ 3개 이상 성장 필요";
    if (n.key === "foundersPlatinum" && !r.monthly680) return "매월 개인 그룹 PV 680만 이상 확인 필요";
    return "PF26 FQ 성장 참석 조건 충족 후보";
  }
  return {rateFor, q12, platinum, evaluate, annual, builder, trip, pins, gar, consecutive, ttca, atLeast};
});
