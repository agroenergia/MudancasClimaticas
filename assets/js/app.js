const dashboardData = window.dashboardData;

const BUILD = {
  version: "v2026.09.25.02",
  published: "25/09/2026 às 20:18 BRT"
};

const ano = document.querySelector("#ano");
if (ano) ano.textContent = new Date().getFullYear();

const stamp = document.querySelector("#dataAtualizacao");
if (stamp) stamp.textContent = BUILD.published;

function renderSvgChart(id, series, labels, yTitle) {
  const host = document.querySelector(id);
  if (!host) return;

  const width = 1100;
  const height = 410;
  const pad = { top: 34, right: 34, bottom: 58, left: 72 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const values = series.flatMap(s => s.data);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = Math.max(rawMax - rawMin, 1);
  const min = Math.floor((rawMin - span * 0.12) * 10) / 10;
  const max = Math.ceil((rawMax + span * 0.12) * 10) / 10;
  const x = i => pad.left + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
  const y = v => pad.top + ((max - v) / (max - min)) * plotH;
  const gridCount = 5;
  const ticks = Array.from({ length: gridCount + 1 }, (_, i) => min + ((max - min) * i / gridCount));
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[ch]));

  let svg = '<svg class="data-chart" viewBox="0 0 1100 410" preserveAspectRatio="none" aria-hidden="true">';
  ticks.forEach(v => {
    const yy = y(v);
    svg += `<line x1="${pad.left}" x2="${width-pad.right}" y1="${yy}" y2="${yy}" class="chart-grid"/>`;
    svg += `<text x="${pad.left-12}" y="${yy+5}" text-anchor="end" class="chart-axis">${v.toFixed(1)}</text>`;
  });
  if (min < 0 && max > 0) {
    const yy = y(0);
    svg += `<line x1="${pad.left}" x2="${width-pad.right}" y1="${yy}" y2="${yy}" class="chart-zero"/>`;
  }

  const labelStep = Math.max(1, Math.ceil(labels.length / 9));
  labels.forEach((label, i) => {
    if (i % labelStep === 0 || i === labels.length - 1) {
      svg += `<text x="${x(i)}" y="${height-22}" text-anchor="middle" class="chart-axis">${esc(label)}</text>`;
    }
  });

  series.forEach((s, si) => {
    const points = s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    svg += `<polyline points="${points}" class="chart-line chart-line-${si}"/>`;
    s.data.forEach((v, i) => {
      svg += `<circle cx="${x(i)}" cy="${y(v)}" r="5" class="chart-dot chart-dot-${si}"><title>${esc(labels[i])}: ${Number(v).toFixed(3)} ${esc(yTitle)}</title></circle>`;
    });
  });

  svg += `<text x="${pad.left}" y="20" class="chart-title">${esc(yTitle)}</text></svg>`;
  host.innerHTML = svg;
  host.classList.add("is-ready");
}

renderSvgChart(
  "#ninoHistoryChart",
  [{ label: "ONI", data: dashboardData.ninoHistory.map(x => x.value) }],
  dashboardData.ninoHistory.map(x => x.label),
  "Anomalia de TSM (°C)"
);

renderSvgChart(
  "#probChart",
  [{ label: "Probabilidade", data: dashboardData.probability.map(x => x.value) }],
  dashboardData.probability.map(x => x.label),
  "Probabilidade (%)"
);

const list = document.querySelector("#sourceList");
if (list) {
  list.innerHTML = dashboardData.sources.map(s =>
    `<tr><td><strong>${s.name}</strong><br><small>${s.type}</small></td><td>${s.date}</td><td>${s.note}</td><td><a href="${s.url}" target="_blank" rel="noopener">Fonte oficial ↗</a></td></tr>`
  ).join("");
}

document.querySelectorAll(".definition-points > div").forEach(card => {
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  const toggle = () => card.classList.toggle("is-expanded");
  card.addEventListener("click", toggle);
  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  });
});
