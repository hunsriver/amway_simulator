const ROOT_ID = "me";
const $ = (id) => document.getElementById(id);
const clone = (value) => JSON.parse(JSON.stringify(value));
const uid = () => crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const fmt = (value) => new Intl.NumberFormat("ko-KR").format(Math.round(Number(value) || 0));
const fmtDecimal = (value) => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(Number(value) || 0);
const won = (value) => `${fmt(value)}원`;
const doubleXReference = {
  price: 91000,
  pv: 46460,
  bv: 82700
};

const compactPv = (value) => {
  const number = Math.round(Number(value) || 0);
  return number >= 10000 ? `${fmt(number / 10000)}만 PV` : `${fmt(number)} PV`;
};
const compactBv = (value) => {
  const number = Math.round(Number(value) || 0);
  return number >= 10000 ? `${fmt(number / 10000)}만 BV` : `${fmt(number)} BV`;
};
const compactWon = (value) => {
  const number = Math.round(Number(value) || 0);
  return number >= 10000 ? `${fmt(number / 10000)}만원` : won(number);
};
const parseNumber = (value) => Number(String(value ?? "").replace(/[^\d]/g, "")) || 0;
const parseDecimal = (value) => Number(String(value ?? "").replace(/[^\d.]/g, "")) || 0;
const px = (value) => Number(String(value ?? "").replace("px", "")) || 0;
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

const rateTable = [
  { threshold: 0, rate: 0 },
  { threshold: 200000, rate: 3 },
  { threshold: 600000, rate: 6 },
  { threshold: 1200000, rate: 9 },
  { threshold: 2400000, rate: 12 },
  { threshold: 4000000, rate: 15 },
  { threshold: 6800000, rate: 18 },
  { threshold: 10000000, rate: 21 }
];

const businessPins = [
  { key: "bronze", title: "Bronze", min: 15, image: "img_5955_112x66.jpg", tone: "bronze" },
  { key: "silver", title: "Silver Producer", min: 21, image: "img_5943_158x103.jpg", tone: "silver" },
  { key: "gold", title: "Gold Producer", image: "img_5944_140x103.jpg", tone: "gold" },
  { key: "platinum", title: "Platinum", image: "img_5945_127x136.jpg", tone: "platinum" },
  { key: "ruby", title: "Ruby", image: "img_5947_132x157.jpg", tone: "ruby" },
  { key: "foundersPlatinum", title: "Founders Platinum", image: "img_5946_149x136.jpg", tone: "platinum" },
  { key: "foundersRuby", title: "Founders Ruby", image: "img_5949_157x146.jpg", tone: "ruby" },
  { key: "sapphire", title: "Sapphire", image: "img_5950_130x150.jpg", tone: "sapphire" },
  { key: "foundersSapphire", title: "Founders Sapphire", image: "img_5951_142x151.jpg", tone: "sapphire" },
  { key: "emerald", title: "Emerald", image: "img_5952_130x145.jpg", tone: "emerald" },
  { key: "foundersEmerald", title: "Founders Emerald", image: "img_5953_130x155.jpg", tone: "emerald" },
  { key: "diamond", title: "Diamond", image: "img_5954_122x159.jpg", tone: "diamond" },
  { key: "foundersDiamond", title: "Founders Diamond", image: "img_5956_46x64.jpg", tone: "diamond" },
  { key: "executiveDiamond", title: "Executive Diamond", image: "img_5948_109x159.jpg", tone: "executive" },
  { key: "foundersExecutiveDiamond", title: "Founders Executive Diamond", image: "img_5937_118x159.jpg", tone: "executive" },
  { key: "doubleDiamond", title: "Double Diamond", image: "img_5936_120x165.jpg", tone: "executive" },
  { key: "foundersDoubleDiamond", title: "Founders Double Diamond", image: "img_5957_116x165.jpg", tone: "executive" },
  { key: "tripleDiamond", title: "Triple Diamond", image: "img_5942_139x165.jpg", tone: "crown" },
  { key: "foundersTripleDiamond", title: "Founders Triple Diamond", image: "img_5957_116x165.jpg", tone: "crown" },
  { key: "crown", title: "Crown", image: "img_5941_127x195.jpg", tone: "crown" },
  { key: "foundersCrown", title: "Founders Crown", image: "img_5940_127x195.jpg", tone: "crown" },
  { key: "crownAmbassador", title: "Crown Ambassador", image: "img_5939_127x217.jpg", tone: "crown" },
  { key: "foundersCrownAmbassador", title: "Founders Crown Ambassador", image: "img_5938_133x217.jpg", tone: "crown" }
];

const ratePins = {
  0: { title: "PV 구간 없음", badge: "0%", tone: "white" },
  3: { title: "3% 성과보너스", badge: "3%", tone: "white" },
  6: { title: "6% 성과보너스", badge: "6%", tone: "white" },
  9: { title: "9% 성과보너스", badge: "9%", tone: "blue" },
  12: { title: "12% 성과보너스", badge: "12%", tone: "green" },
  15: { title: "15% 성과보너스", badge: "15%", tone: "bronze" },
  18: { title: "18% 성과보너스", badge: "18%", tone: "silver" },
  21: { title: "21% 독립 레그", badge: "21%", tone: "gold" }
};


const defaultState = {
  people: [
    { id: ROOT_ID, parentId: null, name: "동훈", ownPv: 200000 },
    { id: "me-node", parentId: ROOT_ID, name: "나", ownPv: 200000 },
    { id: "friend-1", parentId: "me-node", name: "친구 1", ownPv: 200000 },
    { id: "friend-2", parentId: "me-node", name: "친구 2", ownPv: 200000 }
  ]
};

const makeLeg = (legIndex, ownPv = 10000000) => ({
  id: `sample-leg-${legIndex}`,
  parentId: ROOT_ID,
  name: `레그 ${legIndex}`,
  ownPv
});

const sampleScenarios = Object.fromEntries(businessPins.map((pin) => {
  const i = Compensation.pins.indexOf(pin.key);
  const gar = Compensation.gar.find(row => row[0] === pin.key);
  const legCount = gar ? gar[1] : i >= 11 ? 6 : i >= 9 ? 3 : i >= 7 ? 2 : 0;
  const founder = pin.key.startsWith("founders");
  const record = { spMonths: i >= 3 ? (founder || gar ? 12 : 6) : i === 2 ? 3 : 0, consecutiveSpMonths: i >= 3 ? 3 : 0 };
  if (i >= 7 && i < 9) record.sapphireMonths = founder ? 12 : 6;
  if (pin.key === "foundersRuby") record.rubyMonths = 12;
  if (gar) Object.assign(record, {ebrVerified:true, garFptLegs:gar[1], qc:gar[2]});
  const people = [{id:ROOT_ID, parentId:null, name:"나", ownPv: pin.key === "ruby" || pin.key === "foundersRuby" ? 20000000 : legCount === 2 ? 4000000 : legCount ? 1000000 : 10000000}];
  const records = {[ROOT_ID]:record};
  for (let j=1;j<=legCount;j++) {
    const leg = makeLeg(j);
    people.push(leg);
    records[leg.id] = {spMonths:founder || gar ? 12 : 6, fqMonths:founder || gar ? 12 : 6, consecutiveSpMonths:3};
  }
  if (pin.key === "bronze") {
    people[0].ownPv = 2200000;
    Object.assign(record, {builderEligible:true, builderElapsed:1, builderPaid:0});
    for(let j=1;j<=3;j++) people.push(makeLeg(j,600000));
  }
  return [pin.key,{label:pin.title, people, records}];
}));

const pinTabs = ManualReference;

let state = clone(defaultState);
let history = [clone(defaultState)];
let historyIndex = 0;
let activeTab = "terms";
let sideMode = "records";
let uiHidden = false;
let pendingConfirm = null;
let mapScale = 1;
let isPanning = false;
let panStart = null;
let touchPanStart = null;
let pinchStart = null;
let selectedRecordId = ROOT_ID;
const recordSections = new Set();
const recordFor = id => state.records?.[id] || {};
const defaultConversion = {
  purchasePerPv: doubleXReference.price / doubleXReference.pv,
  bvPerPv: doubleXReference.bv / doubleXReference.pv
};
let conversion = clone(defaultConversion);

function rateFor(pv) {
  return rateTable.reduce((rate, row) => pv >= row.threshold ? row.rate : rate, 0);
}

function ratePin(rate) {
  return ratePins[rate] || ratePins[0];
}

function person(id) {
  return state.people.find((item) => item.id === id);
}

function childrenOf(parentId) {
  return state.people.filter((item) => item.parentId === parentId);
}

function commitHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(clone(state));
  historyIndex = history.length - 1;
}

function resetScenario() {
  state = clone(defaultState);
  selectedRecordId = ROOT_ID;
  conversion = clone(defaultConversion);
  history = [clone(state)];
  historyIndex = 0;
  render();
}

function applySampleScenario(key) {
  const sample = sampleScenarios[key];
  if (!sample) return;
  state = {people:clone(sample.people), records:clone(sample.records)};
  selectedRecordId = ROOT_ID;
  history = [clone(state)];
  historyIndex = 0;
  $("sampleSelect").value = "";
  render();
}

function calculate() {
  const model = Compensation.evaluate(state.people, state.records, conversion.bvPerPv, ROOT_ID);
  const childrenMap = new Map();
  state.people.forEach(p => {
    if (!childrenMap.has(p.parentId)) childrenMap.set(p.parentId,[]);
    childrenMap.get(p.parentId).push(p);
  });
  const groupPvMap = new Map(), groupBvMap = new Map(), depthMap = new Map();
  const nodePerformanceMap = new Map(), nodeBonusMap = new Map(), nodeProfilePinMap = new Map();
  const legStatsFor = n => n.direct.map(c => ({id:c.id, name:person(c.id).name, pv:c.gpv, bv:c.gpv*conversion.bvPerPv, rate:c.rate, status:c.rate===21?"independent":c.rate>=9?"counted":"excluded"}));
  for (const n of model.nodes.values()) {
    groupPvMap.set(n.id,n.totalPv);
    groupBvMap.set(n.id,n.totalPv*conversion.bvPerPv);
    depthMap.set(n.id,n.depth);
    nodePerformanceMap.set(n.id,n.performanceBonus);
    const pin = {...(businessPins.find(p=>p.key===n.key) || ratePin(n.rate)), key:n.key, gpv:n.gpv, rubyPv:n.rubyPv, qc:n.qc, spQualified:n.spQualified,
      reason:Compensation.atLeast(n.key,"gold") ? "입력한 개인별 연간 기록 기준" : n.spQualified ? "이번 달 SP 구조 충족" : n.rate===21 ? "21% 구간 · SP 구조 미충족 (SPS)" : `${n.rate}% 후원수당 구간`};
    nodeProfilePinMap.set(n.id,pin);
    const r=n.record;
    const builder = Compensation.builder(n,r);
    const incentiveList = [];
    if(n.rate>=15 && n.direct.filter(c=>c.rate>=6).length>=3) incentiveList.push({label:"브론즈 빌더",value:builder? `이번 달 ${won(builder)} (월 코어 합계와 별도)`:"최초 달성 전 GP 이력·18개월·12회·Good Standing 확인 필요",tone:"orange",amount:builder});
    if(n.sixMonthLegs>=3) incentiveList.push({label:"연간 보너스 풀",value:"회사 전체 기금·점수당 금액 필요 · 산정 보류",tone:"green",amount:0});
    if(Compensation.atLeast(n.key,"platinum")) incentiveList.push({label:"NCA / 비전 트립",value:Compensation.trip(n,r),tone:"blue",amount:0});
    nodeBonusMap.set(n.id,{...n, independentLegs:legStatsFor(n).filter(c=>c.rate===21), sixPercentLegs:n.direct.filter(c=>c.rate>=6).length, incentiveList, builder, total:n.monthlyTotal, annualResults:Compensation.annual(n,r)});
  }
  const root=model.root, legStats=legStatsFor(root);
  return {...root, model, childrenMap, groupPvMap, groupBvMap, depthMap, nodePerformanceMap, nodeBonusMap, nodeProfilePinMap, legStats,
    totalPv:root.totalPv, totalBv:root.totalPv*conversion.bvPerPv, totalPurchase:root.totalPv*conversion.purchasePerPv,
    myRate:root.rate, netPay:root.monthlyTotal, profilePin:nodeProfilePinMap.get(ROOT_ID),
    independentLegs:legStats.filter(c=>c.rate===21), countedLegs:legStats.filter(c=>c.rate>=9), excludedLegs:legStats.filter(c=>c.rate<9),
    personalGroupPv:root.gpv, personalGroupBv:root.gpv*conversion.bvPerPv, rubyBv:root.rubyPv*conversion.bvPerPv,
    vePv:Number(root.record.annualVePv)||0, annualGroupPv:Number(root.record.annualGroupPv)||0,
    warnings:[["PF26 · 두 PDF 기준","국내 직접 후원 모형 · 세전/비용 차감 전 추정. 공식 지급액 및 수익 보장이 아닙니다."]]};
}

function relationLabel(node, stats) {
  if (node.id === ROOT_ID) return "내 프로필";
  const depth = stats.depthMap.get(node.id) || 1;
  if (depth === 1) return "프론트라인 레그";
  return `${depth}단계 하위 ABO`;
}

function legStatusFor(id, stats) {
  if (id === ROOT_ID) return "root";
  const rootChild = findRootChild(id);
  const leg = stats.legStats.find((item) => item.id === rootChild);
  return leg?.status || "excluded";
}

function findRootChild(id) {
  let node = person(id);
  while (node?.parentId && node.parentId !== ROOT_ID) node = person(node.parentId);
  return node?.id || id;
}

function rewardItems(node, stats, rate) {
  const bonus=stats.nodeBonusMap.get(node.id);
  return [
    {label:"개인 그룹 PV",value:compactPv(bonus.gpv),tone:"blue"},
    {label:"루비 PV",value:compactPv(bonus.rubyPv),tone:"blue"},
    {label:"후원수당",value:won(bonus.performanceBonus),tone:"green"},
    ...(bonus.rubyBonus?[{label:"루비 2%",value:won(bonus.rubyBonus),tone:"orange"}]:[]),
    ...(bonus.leadershipBonus?[{label:"직접 리더십 (조정 후)",value:won(bonus.leadershipBonus),tone:"green"}]:[]),
    ...(bonus.mdBonus?[{label:"MD 경계 볼륨 추정",value:won(bonus.mdBonus),tone:"green"}]:[]),
    ...bonus.incentiveList
  ];
}

function incomeForNode(node, stats) {
  return stats.nodeBonusMap.get(node.id)?.total ?? 0;
}

function renderPersonCard(node, stats) {
  const groupPv = stats.groupPvMap.get(node.id) || 0;
  const groupBv = stats.groupBvMap.get(node.id) || 0;
  const groupPurchase = groupPv * conversion.purchasePerPv;
  const ownPurchase = (Number(node.ownPv) || 0) * conversion.purchasePerPv;
  const rate = stats.model.nodes.get(node.id).rate;
  const isRoot = node.id === ROOT_ID;
  const status = legStatusFor(node.id, stats);
  const pin = stats.nodeProfilePinMap.get(node.id) || (isRoot ? stats.profilePin : ratePin(rate));
  const parent = person(node.parentId);
  const sponsorText = isRoot ? "전체" : `후원자 ${parent?.name || "-"}`;
  const rewards = rewardItems(node, stats, rate, groupPv, status);
  const income = incomeForNode(node, stats);


  return `
    <article class="person-card ${status} ${pin.tone} profile-${pin.tone}" data-person-id="${node.id}">
      <div class="person-head">
        <div class="pin-badge">
          ${pin.image
            ? `<img alt="${esc(pin.title)}" src="./assets/manual_images/${pin.image}">`
            : `<span class="rate-badge-text">${esc(pin.badge || `${rate}%`)}</span>`}
        </div>
        <div class="person-title">
          <input class="name-input" data-key="name" value="${esc(node.name)}" aria-label="이름">
          <span>${relationLabel(node, stats)}</span>
        </div>
        ${isRoot ? "" : `<button class="icon-btn remove" data-action="remove" title="삭제">×</button>`}
      </div>

      <div class="pin-name">현재 핀: ${esc(pin.title)}</div>
      <div class="person-income">
        <span>이번 달 코어 추정 · 세전</span>
        <strong>${won(income)}</strong>
        <em>연간 인센티브·여행·비용 미포함</em>
      </div>

      <label class="pv-field">
        <span>본인 구매 PV</span>
        <input data-key="ownPv" inputmode="numeric" value="${fmt(node.ownPv)}" aria-label="본인 구매 PV">
        <em>실구매 약 ${compactWon(ownPurchase)}</em>
      </label>

      <div class="person-meta">
        <div><span>그룹 PV</span><b>${compactPv(groupPv)}</b></div>
        <div><span>그룹 BV</span><b>${compactBv(groupBv)}</b></div>
        <div><span>실구매</span><b>${compactWon(groupPurchase)}</b></div>
        <div><span>보너스율</span><b>${rate}%</b></div>
        <div><span>${sponsorText}</span><b>${pin.reason || compactWon(groupBv * rate / 100)}</b></div>
      </div>

      <div class="reward-list">
        ${rewards.map((item) => `
          <div class="reward ${item.tone}">
            <span>${esc(item.label)}</span>
            <b>${esc(item.value)}</b>
          </div>
        `).join("")}
      </div>

      <button class="add-child" data-action="add-child">${isRoot ? "프론트라인 추가" : "하위 추가"}</button>
    </article>
  `;
}

function renderDescendants(parentId, stats) {
  const children = stats.childrenMap.get(parentId) || [];
  if (!children.length) return "";
  return `
    <div class="children-tree">
      ${children.map((child) => `
        <div class="child-node">
          ${renderPersonCard(child, stats)}
          ${renderDescendants(child.id, stats)}
        </div>
      `).join("")}
    </div>
  `;
}

function applyMapScale() {
  const shell = document.querySelector(".tree-zoom-shell");
  const canvas = document.querySelector(".tree-canvas");
  if (!canvas) return;
  canvas.style.transform = `translateX(-50%) scale(${mapScale})`;
  if (shell) {
    const map = $("mindMap");
    map.classList.toggle("zoom-compact", mapScale < 0.55);
    map.classList.toggle("zoom-micro", mapScale < 0.22);
    const style = getComputedStyle(map);
    const contentWidth = map.clientWidth - px(style.paddingLeft) - px(style.paddingRight);
    shell.style.width = `${Math.max(contentWidth, canvas.scrollWidth * mapScale)}px`;
    shell.style.height = `${canvas.scrollHeight * mapScale}px`;
  }
}

function currentMapView() {
  const map = $("mindMap");
  return { left: map.scrollLeft, top: map.scrollTop };
}

function centerMapView() {
  const map = $("mindMap");
  map.scrollLeft = Math.max(0, (map.scrollWidth - map.clientWidth) / 2);
}

function renderMindMap(stats, mapView = null) {
  const root = person(ROOT_ID);
  $("mindMap").innerHTML = `
    <div class="tree-zoom-shell">
      <div class="tree-canvas">
        <div class="root-row">${renderPersonCard(root, stats)}</div>
        ${renderDescendants(ROOT_ID, stats) || `<div class="empty-map">프론트라인 추가를 누르면 첫 레그가 생깁니다.</div>`}
      </div>
    </div>
  `;
  applyMapScale();
  if (mapView) {
    $("mindMap").scrollLeft = mapView.left;
    $("mindMap").scrollTop = mapView.top;
  } else {
    centerMapView();
  }
}

function renderSummary(stats) {
  $("netPay").textContent = won(stats.netPay);
  $("payFormula").textContent = `성과 ${compactWon(stats.performanceBonus)} + 월 보너스 ${compactWon(stats.netPay - stats.performanceBonus)}`;
  $("currentPin").textContent = stats.profilePin.title;
  $("pinReason").textContent = stats.profilePin.reason;
  $("purchaseEstimate").textContent = won(stats.totalPurchase);
  $("purchaseRule").textContent = `더블엑스 기준 1 PV ≈ ${conversion.purchasePerPv.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`;
  $("totalBv").textContent = compactBv(stats.totalBv);
  $("bvRule").textContent = `수당은 BV × %, 1 PV ≈ ${conversion.bvPerPv.toLocaleString("ko-KR", { maximumFractionDigits: 2 })} BV`;
  fitSummaryText();
}

function fitSummaryText() {
  document.querySelectorAll(".summary-card strong").forEach((item) => {
    item.style.fontSize = "";
    if (!window.matchMedia("(max-width: 980px)").matches) return;
    let size = 18;
    item.style.fontSize = `${size}px`;
    while (item.scrollWidth > item.clientWidth && size > 10) {
      size -= 1;
      item.style.fontSize = `${size}px`;
    }
  });
}

function renderRecordsPanel(stats) {
  if (!person(selectedRecordId)) selectedRecordId = ROOT_ID;
  const n=stats.model.nodes.get(selectedRecordId), r=recordFor(selectedRecordId);
  const field=(key,label,max=12,decimal=false)=>`<label><span>${label}</span><input data-qual="${key}" data-max="${max}" inputmode="${decimal?"decimal":"numeric"}" value="${esc(r[key] ?? "")}" placeholder="미입력"></label>`;
  const check=(key,label)=>`<label class="record-check"><input type="checkbox" data-qual="${key}" ${r[key]?"checked":""}><span>${label}</span></label>`;
  const pinSelect=(key,label)=>`<label><span>${label}</span><select data-qual="${key}"><option value="">미확인</option>${businessPins.map(p=>`<option value="${p.key}" ${r[key]===p.key?"selected":""}>${p.title}</option>`).join("")}</select></label>`;
  const mode=(key,label)=>`<label><span>${label}</span><select data-qual="${key}"><option value="">미확인</option>${[["none","미수혜"],["first","최초 달성"],["repeat","다음 해 재달성"]].map(([v,l])=>`<option value="${v}" ${r[key]===v?"selected":""}>${l}</option>`).join("")}</select></label>`;
  const results=stats.nodeBonusMap.get(selectedRecordId).annualResults;
  return `
    <div class="qual-head"><span>2026 회계연도 · 개인별 기록</span><strong>${esc(stats.nodeProfilePinMap.get(selectedRecordId).title)}</strong><em>마감 기록 기준 · 월 실적의 12배와 구분</em></div>
    <label class="record-person"><span>ABO</span><select id="recordPerson">${state.people.map(p=>`<option value="${p.id}" ${p.id===selectedRecordId?"selected":""}>${esc(p.name)}</option>`).join("")}</select></label>
    <div class="month-grid">
      ${field("spMonths","SP 달성 개월")}
      ${field("consecutiveSpMonths","최초 PT 연속 SP 개월")}
      ${field("fqMonths","레그 FQ 유자격 월")}
      ${field("rubyMonths","루비 달성 개월")}
      ${field("sapphireMonths","사파이어 조건 개월")}
      ${field("annualGroupPv","연간 개인 그룹 PV",1e12)}
      ${field("annualVePv","연간 VE PV",1e12)}
    </div>
    ${check("requalification","PT 재달성 (연속 3개월 면제)")}
    ${check("platinumRetained","국내 유자격 PT 이상 확인")}
    <div class="pin-checks">
      <div class="${n.spQualified?"ok":""}"><b>이번 달 SP</b><span>${n.spQualified?"충족":"미충족"} · 개인 그룹 ${fmt(n.gpv)} PV</span></div>
      <div><b>연간 레그</b><span>SP 6개월 이상 ${n.sixMonthLegs}개 · Q12 ${n.q12Legs}개</span></div>
      <div><b>Q12 / FQ</b><span>본인 Q12 ${n.q12Achieved?"충족":"미충족"} · 하위 레그 연간 FQ ${n.fq}개</span></div>
    </div>
    <details class="record-section" ${recordSections.has("gar")?"open":""} data-section="gar"><summary>GAR 확인 기록</summary>
      ${check("ebrVerified","EBR 수혜 자격 확인")}
      <div class="month-grid">${field("garFptLegs","검증된 F.PT 레그 수",1000)}${field("qc","한도 적용 후 QC",100000,true)}</div>
    </details>
    <details class="record-section" ${recordSections.has("annual")?"open":""} data-section="annual"><summary>연간 인센티브 기록</summary>
      ${check("goodStanding","Good Standing 및 유효 실적 확인")}
      <div class="month-grid">
        ${pinSelect("previousPin","전년도 마감 핀")}
        ${pinSelect("highestPin","최고 달성 핀")}
        ${field("previousPq","전년 PQ 개월")}${field("pqMonths","올해 PQ 개월")}
        ${field("previousFq","전년 연간 FQ",100000)}
        ${field("previousQc","전년 QC",100000,true)}
        ${field("annualLeadershipMd","연간 리더십+MD (원)",1e12)}
        ${field("annualCore","연간 월 코어 합계 (원)",1e12)}
        ${mode("consecutiveMode","연속 달성 수혜 구분")}
        ${mode("ttcaMode","TTCA 수혜 구분")}
      </div>
      <div class="annual-results">${results.length?results.map(x=>`<div><b>${esc(x.label)}</b><strong>${x.amount===null?"확인 필요":won(x.amount)}</strong><span>${esc(x.note)}</span></div>`).join(""):"입력 기록으로 확인되는 연간 인센티브 없음"}</div>
      <p class="conversion-note">기준액은 국제 후원 리더십 제외. 미입력은 0 실적으로 처리하지 않으며, 월 코어 합계에 더하지 않습니다.</p>
    </details>
    <details class="record-section" ${recordSections.has("builder")?"open":""} data-section="builder"><summary>브론즈 빌더 / NCA</summary>
      ${check("builderEligible","PF15 이후 최초 빌더 달성 전 GP 미만 확인")}
      <div class="month-grid">${field("builderElapsed","최초 달성부터 경과 월",120)}${field("builderPaid","이번 달 이전 수령 횟수",12)}</div>
      ${check("firstTrip","비전 트립 최초 도전")}
      ${check("monthly680","12개월 각각 개인 그룹 PV 680만 이상")}
      <p class="conversion-note">${esc(Compensation.trip(n,r))}</p>
    </details>
    <details class="record-section" ${recordSections.has("conversion")?"open":""} data-section="conversion"><summary>제품 환산 가정</summary>
      <div class="month-grid">
        <label><span>구매 원 / PV</span><input data-convert="purchasePerPv" inputmode="decimal" value="${conversion.purchasePerPv.toFixed(4)}"></label>
        <label><span>BV / PV</span><input data-convert="bvPerPv" inputmode="decimal" value="${conversion.bvPerPv.toFixed(4)}"></label>
      </div>
      <p class="conversion-note">기본값은 더블엑스 예시. 문서의 PV=BV 예제를 비교할 때 BV/PV를 1로 설정합니다.</p>
    </details>`;
}

function renderStructureStats(stats) {
  return `
    <div><span>내 본인 PV</span><strong>${fmt(person(ROOT_ID)?.ownPv || 0)}</strong></div>
    <div><span>전체 그룹 PV</span><strong>${fmt(stats.totalPv)}</strong></div>
    <div><span>전체 그룹 BV</span><strong>${fmt(stats.totalBv)}</strong></div>
    <div><span>실구매금액 추정</span><strong>${compactWon(stats.totalPurchase)}</strong></div>
    <div><span>GPV</span><strong>${fmt(stats.gpv)}</strong></div>
    <div><span>GPV BV 환산</span><strong>${fmt(stats.personalGroupBv)}</strong></div>
    <div><span>Ruby PV</span><strong>${fmt(stats.rubyPv)}</strong></div>
    <div><span>연간 VE 입력</span><strong>${fmt(stats.vePv)}</strong></div>
    <div><span>연간 FQ 기록</span><strong>${stats.fq}개</strong></div>
    <div><span>QC 확인 입력</span><strong>${fmtDecimal(stats.qc)}점</strong></div>
    <div><span>프론트라인</span><strong>${stats.legStats.length}개</strong></div>
    <div><span>21% 독립 레그</span><strong>${stats.independentLegs.length}개</strong></div>
    
    
    <div><span>내 성과보너스율</span><strong>${stats.myRate}%</strong></div>
  `;
}

function renderAlerts(stats) {
  document.body.classList.toggle("has-alerts", stats.warnings.length > 0);
  $("alerts").innerHTML = stats.warnings.map(([title, body]) => `
    <div class="alert"><b>${esc(title)}</b><span>${esc(body)}</span></div>
  `).join("");
}

function renderGlossaryTabs() {
  return Object.entries(pinTabs).map(([key, tab]) => `
    <button class="tab-btn ${activeTab === key ? "active" : ""}" data-tab="${key}">${tab.label}</button>
  `).join("");
}

function renderGlossaryContent() {
  const tab = pinTabs[activeTab];
  return `
    <div class="tab-hero ${tab.color}">
      <span>${tab.title}</span>
      <strong>${tab.headline}</strong>
      <em>${tab.pay}</em>
    </div>
    <div class="explain-card">
      <p>${tab.text}</p>
      <ul>${tab.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>
      <div class="example-row"><span>${tab.example[0]}</span><strong>${tab.example[1]}</strong></div>
    </div>
  `;
}

function renderSidePanel(stats) {
  $("sideModeTabs").innerHTML = `
    <button class="${sideMode === "records" ? "active" : ""}" data-side-mode="records">개인별 기록</button>
    <button class="${sideMode === "glossary" ? "active" : ""}" data-side-mode="glossary">설명</button>
  `;

  $("sideContent").innerHTML = sideMode === "records"
    ? `<section class="qualification-controls">${renderRecordsPanel(stats)}</section><div class="structure-stats">${renderStructureStats(stats)}</div>`
    : `<nav class="tabs">${renderGlossaryTabs()}</nav><section class="tab-content">${renderGlossaryContent()}</section>`;
}

function restoreFocus(active) {
  if (!active?.id || !active?.key) return;
  const target = active.id === "qualification"
    ? document.querySelector(`[data-qual="${active.key}"]`)
    : active.id === "conversion"
    ? document.querySelector(`[data-convert="${active.key}"]`)
    : document.querySelector(`[data-person-id="${active.id}"] [data-key="${active.key}"]`);
  if (!target) return;
  target.focus();
  if (target.tagName === "INPUT" && target.type !== "checkbox" && active.start !== null) target.setSelectionRange(active.start, active.end);
}

function currentFocus() {
  const active = document.activeElement;
  if (active?.dataset?.qual) return { id: "qualification", key: active.dataset.qual, start: active.selectionStart, end: active.selectionEnd };
  if (active?.dataset?.convert) return { id: "conversion", key: active.dataset.convert, start: active.selectionStart, end: active.selectionEnd };
  const card = active?.closest?.("[data-person-id]");
  if (!card || !active.dataset?.key) return null;
  return { id: card.dataset.personId, key: active.dataset.key, start: active.selectionStart, end: active.selectionEnd };
}

function render(options = {}) {
  const focus = options.preserveFocus ? currentFocus() : null;
  const mapView = options.preserveView ? currentMapView() : null;
  const stats = calculate();
  renderMindMap(stats, mapView);
  renderSummary(stats);
  renderSidePanel(stats);
  renderAlerts(stats);
  restoreFocus(focus);
}

function addPerson(parentId) {
  const parent = person(parentId);
  const isFrontline = parentId === ROOT_ID;
  state.people.push({
    id: uid(),
    parentId,
    name: isFrontline ? `프론트라인 ${childrenOf(ROOT_ID).length + 1}` : `${parent?.name || "ABO"} 하위`,
    ownPv: 200000
  });
  commitHistory();
  render({ preserveView: true });
}

function descendantIds(id) {
  return childrenOf(id).flatMap((child) => [child.id, ...descendantIds(child.id)]);
}

function removePerson(id) {
  if (id === ROOT_ID) return;
  const removeIds = new Set([id, ...descendantIds(id)]);
  state.people = state.people.filter((item) => !removeIds.has(item.id));
  commitHistory();
  render({ preserveView: true });
}

function openConfirm({ kicker = "확인", title, message, onConfirm }) {
  pendingConfirm = onConfirm;
  $("confirmKicker").textContent = kicker;
  $("confirmTitle").textContent = title;
  $("confirmMessage").textContent = message;
  $("confirmModal").classList.add("show");
  $("confirmModal").setAttribute("aria-hidden", "false");
}

function closeConfirm() {
  pendingConfirm = null;
  $("confirmModal").classList.remove("show");
  $("confirmModal").setAttribute("aria-hidden", "true");
}

function setMobileMenu(open) {
  document.body.classList.toggle("mobile-menu-open", open);
  const toggle = $("mobileMenuToggle");
  if (toggle) toggle.setAttribute("aria-expanded", String(open));
}

function undo() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  state = clone(history[historyIndex]);
  render();
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  historyIndex += 1;
  state = clone(history[historyIndex]);
  render();
}

$("mindMap").addEventListener("input", (event) => {
  const card = event.target.closest("[data-person-id]");
  const key = event.target.dataset.key;
  if (!card || !key) return;
  const target = person(card.dataset.personId);
  if (!target) return;
  target[key] = key === "ownPv" ? parseNumber(event.target.value) : event.target.value;
  commitHistory();
  render({ preserveFocus: true, preserveView: true });
});

$("mindMap").addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const card = event.target.closest("[data-person-id]");
  if (!action || !card) return;
  if (action === "add-child") addPerson(card.dataset.personId);
  if (action === "remove") removePerson(card.dataset.personId);
});

$("mindMap").addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch") return;
  if (event.button !== 0 || event.target.closest(".person-card, input, button")) return;
  const map = $("mindMap");
  isPanning = true;
  panStart = { x: event.clientX, y: event.clientY, left: map.scrollLeft, top: map.scrollTop };
  map.classList.add("panning");
  map.setPointerCapture(event.pointerId);
});

$("mindMap").addEventListener("pointermove", (event) => {
  if (!isPanning || !panStart) return;
  const map = $("mindMap");
  map.scrollLeft = panStart.left - (event.clientX - panStart.x);
  map.scrollTop = panStart.top - (event.clientY - panStart.y);
});

$("mindMap").addEventListener("pointerup", (event) => {
  if (!isPanning) return;
  isPanning = false;
  panStart = null;
  $("mindMap").classList.remove("panning");
  try { $("mindMap").releasePointerCapture(event.pointerId); } catch {}
});

$("mindMap").addEventListener("wheel", (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  event.preventDefault();
  const map = $("mindMap");
  const shell = document.querySelector(".tree-zoom-shell");
  const style = getComputedStyle(map);
  const usableWidth = map.clientWidth - px(style.paddingLeft) - px(style.paddingRight);
  const usableHeight = map.clientHeight - px(style.paddingTop) - px(style.paddingBottom);
  const pointerX = px(style.paddingLeft) + usableWidth / 2;
  const pointerY = px(style.paddingTop) + usableHeight / 2;
  const beforeWidth = shell?.offsetWidth || map.scrollWidth;
  const beforeHeight = shell?.offsetHeight || map.scrollHeight;
  const beforeX = (map.scrollLeft + pointerX) / beforeWidth;
  const beforeY = (map.scrollTop + pointerY) / beforeHeight;
  mapScale = Math.min(6, Math.max(0.04, mapScale * (event.deltaY > 0 ? 0.86 : 1.14)));
  applyMapScale();
  const afterWidth = shell?.offsetWidth || map.scrollWidth;
  const afterHeight = shell?.offsetHeight || map.scrollHeight;
  map.scrollLeft = beforeX * afterWidth - pointerX;
  map.scrollTop = beforeY * afterHeight - pointerY;
}, { passive: false });

function touchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function touchCenter(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  };
}

$("mindMap").addEventListener("touchstart", (event) => {
  const map = $("mindMap");
  if (event.touches.length === 1 && !event.target.closest(".person-card, input, button")) {
    touchPanStart = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      left: map.scrollLeft,
      top: map.scrollTop
    };
    pinchStart = null;
    return;
  }
  if (event.touches.length === 2) {
    event.preventDefault();
    const center = touchCenter(event.touches);
    const rect = map.getBoundingClientRect();
    const shell = document.querySelector(".tree-zoom-shell");
    const width = shell?.offsetWidth || map.scrollWidth || 1;
    const height = shell?.offsetHeight || map.scrollHeight || 1;
    pinchStart = {
      distance: touchDistance(event.touches),
      scale: mapScale,
      ratioX: (map.scrollLeft + center.x - rect.left) / width,
      ratioY: (map.scrollTop + center.y - rect.top) / height,
      centerOffsetX: center.x - rect.left,
      centerOffsetY: center.y - rect.top
    };
    touchPanStart = null;
  }
}, { passive: false });

$("mindMap").addEventListener("touchmove", (event) => {
  const map = $("mindMap");
  if (event.touches.length === 2 && pinchStart) {
    event.preventDefault();
    const nextScale = pinchStart.scale * (touchDistance(event.touches) / Math.max(1, pinchStart.distance));
    mapScale = Math.min(6, Math.max(0.04, nextScale));
    applyMapScale();
    const shell = document.querySelector(".tree-zoom-shell");
    const width = shell?.offsetWidth || map.scrollWidth;
    const height = shell?.offsetHeight || map.scrollHeight;
    map.scrollLeft = pinchStart.ratioX * width - pinchStart.centerOffsetX;
    map.scrollTop = pinchStart.ratioY * height - pinchStart.centerOffsetY;
    return;
  }
  if (event.touches.length === 1 && touchPanStart) {
    event.preventDefault();
    map.scrollLeft = touchPanStart.left - (event.touches[0].clientX - touchPanStart.x);
    map.scrollTop = touchPanStart.top - (event.touches[0].clientY - touchPanStart.y);
  }
}, { passive: false });

$("mindMap").addEventListener("touchend", (event) => {
  if (event.touches.length < 2) pinchStart = null;
  if (event.touches.length === 0) touchPanStart = null;
});

$("sideModeTabs").addEventListener("click", (event) => {
  const mode = event.target.dataset.sideMode;
  if (!mode) return;
  sideMode = mode;
  render({ preserveView: true });
});

$("sideContent").addEventListener("click", (event) => {
  const tab = event.target.dataset.tab;
  if (!tab) return;
  activeTab = tab;
  render({ preserveView: true });
});

$("sideContent").addEventListener("input", (event) => {
  if (event.target.id === "recordPerson") {
    selectedRecordId=event.target.value;
    render({preserveView:true});
    return;
  }
  const key=event.target.dataset.qual, convertKey=event.target.dataset.convert;
  if (key) {
    state.records ||= {};
    const r=state.records[selectedRecordId] ||= {};
    if(event.target.type==="checkbox") r[key]=event.target.checked;
    else if(event.target.tagName==="SELECT") r[key]=event.target.value;
    else if(event.target.value.trim()==="") delete r[key];
    else r[key]=Math.min(Number(event.target.dataset.max)||12,parseDecimal(event.target.value));
    commitHistory();
  } else if (convertKey) {
    conversion[convertKey]=Math.max(0,Math.min(1000,parseDecimal(event.target.value)));
  } else return;
  render({preserveFocus:true,preserveView:true});
});

$("sideContent").addEventListener("toggle", event => {
  const key=event.target.dataset.section;
  if(!key || !event.target.isConnected) return;
  if(event.target.open) recordSections.add(key); else recordSections.delete(key);
},true);

$("resetScenario").addEventListener("click", () => {
  setMobileMenu(false);
  openConfirm({
    kicker: "초기화",
    title: "정말 초기화할까요?",
    message: "현재 입력한 ABO 구조와 반복 기록이 기본값으로 돌아갑니다.",
    onConfirm: resetScenario
  });
});

$("applySample").addEventListener("click", () => {
  const key = $("sampleSelect").value;
  const sample = sampleScenarios[key];
  if (!sample) return;
  setMobileMenu(false);
  openConfirm({
    kicker: "샘플 적용",
    title: `${sample.label} 샘플로 바꿀까요?`,
    message: "현재 입력한 구조가 샘플 구조로 바뀌고 반복 기록도 샘플에 맞게 변경됩니다.",
    onConfirm: () => applySampleScenario(key)
  });
});

$("mobileMenuToggle")?.addEventListener("click", () => {
  setMobileMenu(!document.body.classList.contains("mobile-menu-open"));
});

$("cancelConfirm").addEventListener("click", closeConfirm);
$("confirmAction").addEventListener("click", () => {
  const action = pendingConfirm;
  closeConfirm();
  if (typeof action === "function") action();
});

$("toggleUi").addEventListener("click", () => {
  uiHidden = !uiHidden;
  document.body.classList.toggle("ui-hidden", uiHidden);
  $("toggleUi").textContent = uiHidden ? "UI 보이기" : "UI 숨기기";
});

document.addEventListener("keydown", (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  if (key === "z" && event.shiftKey) {
    event.preventDefault();
    redo();
  } else if (key === "z") {
    event.preventDefault();
    undo();
  }
});

render();
