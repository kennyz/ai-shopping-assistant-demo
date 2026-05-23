const products = [
  {
    id: "laptop",
    name: "AeroBook 14",
    category: "电脑",
    price: 1099,
    score: 94,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    tags: ["1.2kg", "12h 电池", "安静键盘"],
    reason: "适合通勤和咖啡店办公，重量、续航和屏幕亮度比较均衡。",
    risk: "大型游戏和 3D 渲染不是它的强项。",
    priorities: ["balanced", "portable", "premium"],
  },
  {
    id: "headphones",
    name: "PulseRun ANC",
    category: "耳机",
    price: 249,
    score: 91,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    tags: ["降噪", "防汗", "双设备"],
    reason: "跑步时佩戴稳定，通话麦克风清晰，降噪强度适合通勤。",
    risk: "耳罩偏紧，长时间会议可能需要休息。",
    priorities: ["balanced", "portable", "value"],
  },
  {
    id: "purifier",
    name: "BreatheWell P3",
    category: "家电",
    price: 399,
    score: 89,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80",
    tags: ["宠物毛发", "低噪", "滤芯提醒"],
    reason: "覆盖中等客厅，对宠物家庭常见异味和毛发粉尘更友好。",
    risk: "滤芯年成本高于入门款。",
    priorities: ["balanced", "premium"],
  },
  {
    id: "tablet",
    name: "CanvasTab Air",
    category: "平板",
    price: 679,
    score: 87,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
    tags: ["手写笔", "轻娱乐", "分屏"],
    reason: "适合学生、读文档和轻量创作，屏幕体验比同价位电脑更沉浸。",
    risk: "需要键盘套时总价会上升。",
    priorities: ["portable", "premium"],
  },
  {
    id: "coffee",
    name: "MorningLab Mini",
    category: "厨房",
    price: 159,
    score: 84,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    tags: ["小户型", "易清洁", "定时"],
    reason: "占地小，清洁步骤少，适合第一次升级咖啡设备的人。",
    risk: "不适合多人连续出杯。",
    priorities: ["value", "portable"],
  },
  {
    id: "speaker",
    name: "RoomWave S",
    category: "音箱",
    price: 329,
    score: 86,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80",
    tags: ["空间音效", "低音", "多房间"],
    reason: "适合客厅音乐和电影，声音厚度明显优于便携音箱。",
    risk: "体积不小，书桌使用略占空间。",
    priorities: ["premium", "balanced"],
  },
];

const state = {
  budget: 1200,
  priority: "balanced",
  intent: "探索购物需求",
  cart: new Set(),
  view: "cards",
  query: "",
};

const chatLog = document.querySelector("#chatLog");
const productGrid = document.querySelector("#productGrid");
const comparePanel = document.querySelector("#comparePanel");
const insightText = document.querySelector("#insightText");
const budgetRange = document.querySelector("#budgetRange");
const budgetLabel = document.querySelector("#budgetLabel");
const prioritySelect = document.querySelector("#prioritySelect");
const intentLabel = document.querySelector("#intentLabel");
const confidenceLabel = document.querySelector("#confidenceLabel");
const cartCount = document.querySelector("#cartCount");

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function addMessage(role, text) {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.textContent = text;
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function detectIntent(message) {
  const text = message.toLowerCase();
  if (text.includes("电脑") || text.includes("办公") || text.includes("laptop")) return "轻薄办公设备";
  if (text.includes("耳机") || text.includes("跑步") || text.includes("降噪")) return "运动通勤音频";
  if (text.includes("宠物") || text.includes("空气") || text.includes("净化")) return "宠物家庭家电";
  if (text.includes("咖啡")) return "小厨房升级";
  if (text.includes("音箱") || text.includes("电影")) return "客厅影音";
  return "个性化购物探索";
}

function detectBudget(message) {
  const match = message.match(/(\d{3,4})/);
  if (match) {
    const nextBudget = Math.max(120, Math.min(1800, Number(match[1])));
    state.budget = nextBudget;
    budgetRange.value = String(nextBudget);
  }
}

function productWeight(product) {
  let weight = product.score;
  if (product.price > state.budget) weight -= 35 + (product.price - state.budget) / 30;
  if (product.priorities.includes(state.priority)) weight += 12;
  if (state.query) {
    const haystack = `${product.name} ${product.category} ${product.tags.join(" ")} ${product.reason}`.toLowerCase();
    for (const token of state.query.toLowerCase().split(/\s+/)) {
      if (token && haystack.includes(token)) weight += 8;
    }
  }
  return Math.round(weight);
}

function rankedProducts() {
  return [...products]
    .map((product) => ({ ...product, rankScore: productWeight(product) }))
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, 4);
}

function renderProducts() {
  const picks = rankedProducts();
  productGrid.innerHTML = picks
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-media" style="background-image: url('${product.image}')">
            <span class="score">${product.rankScore}% match</span>
          </div>
          <div class="product-body">
            <div class="product-title">
              <h3>${product.name}</h3>
              <span class="price">${money(product.price)}</span>
            </div>
            <div class="tags">${product.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
            <p class="reason">${product.reason}</p>
            <p class="reason"><strong>注意：</strong>${product.risk}</p>
            <div class="product-actions">
              <button type="button" data-cart="${product.id}">${state.cart.has(product.id) ? "已加入" : "加入购物车"}</button>
              <button class="secondary" type="button" data-ask="${product.id}">追问</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  comparePanel.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>商品</th>
          <th>价格</th>
          <th>匹配</th>
          <th>适合原因</th>
          <th>购买风险</th>
        </tr>
      </thead>
      <tbody>
        ${picks
          .map(
            (product) => `
              <tr>
                <td><strong>${product.name}</strong><br>${product.category}</td>
                <td>${money(product.price)}</td>
                <td>${product.rankScore}%</td>
                <td>${product.reason}</td>
                <td>${product.risk}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderInsights() {
  const picks = rankedProducts();
  const best = picks[0];
  const inBudget = picks.filter((product) => product.price <= state.budget).length;
  insightText.innerHTML = `
    <p>首推 <strong>${best.name}</strong>，因为它在你当前预算 ${money(state.budget)} 和“${prioritySelect.selectedOptions[0].textContent}”优先级下综合得分最高。</p>
    <ul>
      <li>${inBudget} 个推荐低于预算上限，适合直接进入对比。</li>
      <li>若要更稳妥，优先查看“注意”项，避免被单一卖点带偏。</li>
      <li>购物车会保存你的候选组合，方便演示下一步结算或导购接入。</li>
    </ul>
  `;
  intentLabel.textContent = state.intent;
  confidenceLabel.textContent = `${Math.max(72, Math.min(96, picks[0].rankScore))}%`;
  cartCount.textContent = `${state.cart.size} 件`;
  budgetLabel.textContent = money(state.budget);
}

function render() {
  renderProducts();
  renderInsights();
  productGrid.hidden = state.view !== "cards";
  comparePanel.hidden = state.view !== "compare";
}

function answer(message) {
  detectBudget(message);
  state.intent = detectIntent(message);
  state.query = message;
  const best = rankedProducts()[0];
  addMessage("assistant", `我会优先比较 ${state.intent}。当前最匹配的是 ${best.name}，价格 ${money(best.price)}：${best.reason}`);
  render();
}

document.querySelector("#assistantForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#assistantInput");
  const message = input.value.trim();
  if (!message) return;
  addMessage("user", message);
  input.value = "";
  window.setTimeout(() => answer(message), 220);
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#assistantInput").value = button.dataset.prompt;
    document.querySelector("#assistantForm").requestSubmit();
  });
});

budgetRange.addEventListener("input", () => {
  state.budget = Number(budgetRange.value);
  render();
});

prioritySelect.addEventListener("change", () => {
  state.priority = prioritySelect.value;
  render();
});

document.querySelector(".view-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-view]");
  if (!button) return;
  state.view = button.dataset.view;
  document.querySelectorAll("[data-view]").forEach((node) => node.classList.toggle("active", node === button));
  render();
});

document.body.addEventListener("click", (event) => {
  const cartButton = event.target.closest("[data-cart]");
  const askButton = event.target.closest("[data-ask]");
  if (cartButton) {
    const id = cartButton.dataset.cart;
    if (state.cart.has(id)) state.cart.delete(id);
    else state.cart.add(id);
    render();
  }
  if (askButton) {
    const product = products.find((item) => item.id === askButton.dataset.ask);
    addMessage("user", `${product.name} 值得买吗？`);
    window.setTimeout(() => {
      addMessage("assistant", `${product.name} 的优势是 ${product.reason} 主要风险是 ${product.risk} 如果这点能接受，它就是一个强候选。`);
    }, 180);
  }
});

document.querySelector("#resetDemo").addEventListener("click", () => {
  state.budget = 1200;
  state.priority = "balanced";
  state.intent = "探索购物需求";
  state.cart.clear();
  state.query = "";
  budgetRange.value = "1200";
  prioritySelect.value = "balanced";
  chatLog.innerHTML = "";
  addMessage("assistant", "你好，我是 CartPilot。告诉我预算、使用场景和你最在意的点，我会把商品按理由、风险和匹配度排好。");
  render();
});

addMessage("assistant", "你好，我是 CartPilot。告诉我预算、使用场景和你最在意的点，我会把商品按理由、风险和匹配度排好。");
render();
