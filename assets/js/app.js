import { dashboardData } from "./data.js";
const ano=document.querySelector("#ano"); if(ano) ano.textContent=new Date().getFullYear();
const stamp=document.querySelector("#dataAtualizacao"); if(stamp) stamp.textContent=dashboardData.updatedAt;

function renderChart(id,type,data,labels,yTitle){
  const el=document.querySelector(id);
  if(!el)return;
  const draw=()=>{
    if(!window.Chart){
      el.insertAdjacentHTML("afterend",'<p class="chart-error">Não foi possível carregar o motor do gráfico. Os dados continuam disponíveis nas fontes oficiais.</p>');
      return;
    }
    new Chart(el,{type,data:{labels,datasets:[data]},options:{
      responsive:true,maintainAspectRatio:false,
      interaction:{mode:"index",intersect:false},
      plugins:{legend:{display:false}},
      scales:{y:{title:{display:true,text:yTitle},grid:{color:"#d9e5df"}}}
    }});
  };
  if(window.Chart) draw(); else window.addEventListener("load",draw,{once:true});
}

renderChart("#ninoHistoryChart","line",
  {label:"ONI",data:dashboardData.ninoHistory.map(x=>x.value),tension:.25,pointRadius:3,borderWidth:3,fill:false},
  dashboardData.ninoHistory.map(x=>x.label),"°C de anomalia");

renderChart("#probChart","line",
  {label:"Probabilidade",data:dashboardData.probability.map(x=>x.value),tension:.35,pointRadius:5,borderWidth:3},
  dashboardData.probability.map(x=>x.label),"%");

const list=document.querySelector("#sourceList");
if(list)list.innerHTML=dashboardData.sources.map(s=>`<tr><td><strong>${s.name}</strong><br><small>${s.type}</small></td><td>${s.date}</td><td>${s.note}</td><td><a href="${s.url}" target="_blank" rel="noopener">Fonte oficial ↗</a></td></tr>`).join("");