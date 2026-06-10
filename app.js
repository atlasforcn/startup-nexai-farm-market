const crops = [
  {
    id: "peach",
    name: "關西香氣水蜜桃",
    farm: "新竹縣關西鎮",
    stock: 92,
    unit: "盒",
    price: 680,
    freshness: "採收後 18 小時",
    angle: "香氣濃、適合家庭採買與企業下午茶",
  },
  {
    id: "citrus",
    name: "峨眉桶柑禮盒",
    farm: "新竹縣峨眉鄉",
    stock: 148,
    unit: "盒",
    price: 520,
    freshness: "甜度 13.2 Brix",
    angle: "耐放、適合團購與節慶送禮",
  },
  {
    id: "rice",
    name: "北埔友善米",
    farm: "新竹縣北埔鄉",
    stock: 88,
    unit: "袋",
    price: 360,
    freshness: "小批次碾製",
    angle: "穩定回購、適合餐飲店家與社區訂閱",
  },
];

let selectedId = crops[0].id;
let tone = "warm";
let inquiryCount = 42;

const orders = [
  { customer: "竹北媽媽共購群", item: "關西香氣水蜜桃", amount: 18, status: "待確認" },
  { customer: "山邊咖啡", item: "北埔友善米", amount: 12, status: "已付款" },
  { customer: "軟體園區福委會", item: "峨眉桶柑禮盒", amount: 36, status: "配送中" },
];

const channels = [
  { name: "LINE 熟客群", value: 82, revenue: "$72,400" },
  { name: "公司團購", value: 66, revenue: "$58,200" },
  { name: "餐飲店家", value: 48, revenue: "$31,680" },
  { name: "市集導流", value: 34, revenue: "$19,300" },
];

function selectedCrop() {
  return crops.find((crop) => crop.id === selectedId) || crops[0];
}

function formatMoney(value) {
  return `$${value.toLocaleString("zh-TW")}`;
}

function renderCrops() {
  const list = document.querySelector("#crop-list");
  list.innerHTML = crops
    .map(
      (crop) => `
        <button class="crop-card ${crop.id === selectedId ? "active" : ""}" data-crop="${crop.id}">
          <strong>${crop.name}</strong>
          <span>${crop.farm}</span>
          <span>${crop.stock} ${crop.unit} · ${formatMoney(crop.price)}</span>
        </button>
      `,
    )
    .join("");

  list.querySelectorAll(".crop-card").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.crop;
      syncInputs();
      render();
    });
  });
}

function renderSelectedCrop() {
  const crop = selectedCrop();
  document.querySelector("#selected-crop").innerHTML = `
    <div>
      <h2>${crop.name}</h2>
      <p>${crop.farm} · ${crop.freshness} · ${crop.angle}</p>
    </div>
    <div class="crop-price">${formatMoney(crop.price)} / ${crop.unit}</div>
  `;
}

function buildMessage() {
  const crop = selectedCrop();
  const price = Number(document.querySelector("#price-input").value || crop.price);
  const quantity = Number(document.querySelector("#quantity-input").value || crop.stock);
  const audience = document.querySelector("#audience-input").value;
  const shipDate = document.querySelector("#ship-input").value || "明日";

  const openings = {
    warm: `今天整理了 ${crop.farm} 的 ${crop.name}，數量不多但狀態很好。`,
    direct: `${crop.name} 今日開放預訂，適合${audience}，售完就收單。`,
    premium: `這批 ${crop.name} 適合做成有故事的地方禮盒，從產地到收件人都能被好好交代。`,
  };

  const callouts = {
    warm: "我會幫大家保留到今晚 8 點，回覆數量即可登記。",
    direct: "回覆「我要 + 數量」，NexAI 會自動整理訂單與出貨名單。",
    premium: "可加上產地小卡、企業祝福語與分批寄送清單。",
  };

  return `${openings[tone]}

價格：${formatMoney(price)} / ${crop.unit}
可出貨：${quantity} ${crop.unit}
出貨日：${shipDate}

${crop.angle}。
${callouts[tone]}`;
}

function renderMessage() {
  document.querySelector("#line-message").textContent = buildMessage();
}

function renderInsights() {
  const crop = selectedCrop();
  const insights = [
    {
      title: "銷售節奏",
      body: `${crop.name} 建議先推 LINE 熟客群，再把剩餘庫存轉給公司團購。今晚 8 點前收單能降低隔日改單。`,
    },
    {
      title: "價格提醒",
      body: `目前價格落在高接受區間。若庫存超過 ${Math.round(crop.stock * 0.7)} ${crop.unit}，可新增三件組免運。`,
    },
    {
      title: "出貨風險",
      body: `${crop.freshness}，建議把地址確認與付款提醒自動化，避免採收後等待過久。`,
    },
  ];

  document.querySelector("#insight-stack").innerHTML = insights
    .map(
      (insight) => `
        <article class="insight">
          <strong>${insight.title}</strong>
          <p>${insight.body}</p>
        </article>
      `,
    )
    .join("");
}

function renderOrders() {
  document.querySelector("#orders").innerHTML = orders
    .map((order, index) => {
      const className =
        order.status === "待確認" ? "pending" : order.status === "配送中" ? "shipped" : "";
      return `
        <div class="order-row">
          <div>
            <p>${order.customer}</p>
            <span>${order.item} · ${order.amount} 件</span>
          </div>
          <span class="status ${className}">${order.status}</span>
          <button data-order="${index}">${order.status === "待確認" ? "確認" : "更新"}</button>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll("[data-order]").forEach((button) => {
    button.addEventListener("click", () => {
      const order = orders[Number(button.dataset.order)];
      order.status = order.status === "待確認" ? "已付款" : order.status === "已付款" ? "配送中" : "已完成";
      renderOrders();
      updateMetrics();
    });
  });
}

function renderChannels() {
  document.querySelector("#channel-bars").innerHTML = channels
    .map(
      (channel) => `
        <div class="channel">
          <div class="channel-top">
            <span>${channel.name}</span>
            <strong>${channel.revenue}</strong>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="--value: ${channel.value}%"></div>
          </div>
        </div>
      `,
    )
    .join("");
}

function updateMetrics() {
  const stock = crops.reduce((sum, crop) => sum + crop.stock, 0);
  const pending = orders.filter((order) => order.status === "待確認").length;
  const totalValue = orders.reduce((sum, order) => sum + order.amount * 620, 0);
  document.querySelector("#metric-stock").textContent = `${stock} 盒`;
  document.querySelector("#metric-inquiries").textContent = inquiryCount;
  document.querySelector("#metric-orders").textContent = pending + orders.length * 4;
  document.querySelector("#metric-revenue").textContent = `$${Math.round(totalValue / 1000)}k`;
}

function syncInputs() {
  const crop = selectedCrop();
  document.querySelector("#price-input").value = crop.price;
  document.querySelector("#quantity-input").value = crop.stock;
}

function render() {
  renderCrops();
  renderSelectedCrop();
  renderMessage();
  renderInsights();
  renderOrders();
  renderChannels();
  updateMetrics();
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    tone = button.dataset.tone;
    document.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("active"));
    button.classList.add("active");
    renderMessage();
  });
});

document.querySelector("#generate-button").addEventListener("click", () => {
  inquiryCount += 3;
  renderMessage();
  updateMetrics();
});

document.querySelector("#copy-button").addEventListener("click", async () => {
  const text = document.querySelector("#line-message").textContent;
  try {
    await navigator.clipboard.writeText(text);
    document.querySelector("#copy-button").textContent = "已複製";
  } catch {
    document.querySelector("#copy-button").textContent = "可手動複製";
  }
  setTimeout(() => {
    document.querySelector("#copy-button").textContent = "複製草稿";
  }, 1200);
});

document.querySelector("#add-order-button").addEventListener("click", () => {
  const crop = selectedCrop();
  orders.unshift({
    customer: "LINE 新增客戶",
    item: crop.name,
    amount: Math.ceil(Math.random() * 10) + 3,
    status: "待確認",
  });
  renderOrders();
  updateMetrics();
});

document.querySelector("#restock-button").addEventListener("click", () => {
  crops.forEach((crop) => {
    crop.stock += Math.ceil(Math.random() * 18);
  });
  syncInputs();
  render();
});

["price-input", "quantity-input", "audience-input", "ship-input"].forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("input", renderMessage);
});

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
document.querySelector("#ship-input").value = tomorrow.toISOString().slice(0, 10);
syncInputs();
render();
