const D = window.dashboardData;
const slides = [...document.querySelectorAll(".slide")];
const manualSlide = document.querySelector(".manual-slide");
const counter = document.querySelector("#counter");
const progress = document.querySelector("#progressBar");
let current = 0;

function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function chartLine(id,data,opts={}){
  const el=document.querySelector(id); if(!el)return;
  const w=1100,h=360,p={l:64,r:24,t:28,b:50},pw=w-p.l-p.r,ph=h-p.t-p.b;
  const vals=data.map(d=>d[1]), min=opts.min??Math.min(...vals), max=opts.max??Math.max(...vals);
  const span=Math.max(max-min,.5), lo=min-span*.12, hi=max+span*.12;
  const x=i=>p.l+(data.length===1?pw/2:i/(data.length-1)*pw), y=v=>p.t+(hi-v)/(hi-lo)*ph;
  const pts=data.map((d,i)=>x(i)+","+y(d[1])).join(" ");
  let s='<svg class="svg-chart" viewBox="0 0 1100 360" role="img" aria-label="'+esc(opts.aria||"Gráfico")+'">';
  for(let i=0;i<=5;i++){const v=lo+(hi-lo)*i/5,yy=y(v);s+='<line x1="'+p.l+'" x2="'+(w-p.r)+'" y1="'+yy+'" y2="'+yy+'" class="grid"/><text x="'+(p.l-10)+'" y="'+(yy+5)+'" text-anchor="end" class="axis">'+v.toFixed(opts.decimals??1)+'</text>';}
  if(lo<0&&hi>0){const yy=y(0);s+='<line x1="'+p.l+'" x2="'+(w-p.r)+'" y1="'+yy+'" y2="'+yy+'" class="zero"/>';}
  const step=Math.max(1,Math.ceil(data.length/8));
  data.forEach((d,i)=>{if(i%step===0||i===data.length-1)s+='<text x="'+x(i)+'" y="'+(h-18)+'" text-anchor="middle" class="axis">'+esc(d[0])+'</text>';});
  s+='<polyline points="'+pts+'" class="line"/>';
  data.forEach((d,i)=>s+='<circle cx="'+x(i)+'" cy="'+y(d[1])+'" r="4.5" class="dot"><title>'+esc(d[0])+': '+d[1]+'</title></circle>');
  if(opts.trend){
    const n=vals.length,mx=(n-1)/2,my=vals.reduce((a,b)=>a+b,0)/n;
    const slope=vals.reduce((a,v,i)=>a+(i-mx)*(v-my),0)/vals.reduce((a,_,i)=>a+(i-mx)**2,0);
    const b=my-slope*mx, a0=b, a1=b+slope*(n-1);
    s+='<line x1="'+x(0)+'" y1="'+y(a0)+'" x2="'+x(n-1)+'" y2="'+y(a1)+'" class="trend"/>';
    s+='<text x="'+(w-p.r-4)+'" y="'+Math.max(24,y(a1)-10)+'" text-anchor="end" class="trend-label">Tendência de longo prazo ↑</text>';
  }
  s+='</svg>'; el.innerHTML=s;
}
function chartBars(id,data,opts={}){
  const el=document.querySelector(id); if(!el)return;
  const w=1100,h=360,p={l:56,r:18,t:22,b:70},pw=w-p.l-p.r,ph=h-p.t-p.b,max=Math.max(...data.map(d=>d[1]))*1.12;
  const gap=pw/data.length, bw=Math.max(14,gap*.64);
  let s='<svg class="svg-chart" viewBox="0 0 1100 360" role="img" aria-label="'+esc(opts.aria||"Gráfico de barras")+'">';
  for(let i=0;i<=4;i++){const v=max*i/4,yy=p.t+ph-(v/max)*ph;s+='<line x1="'+p.l+'" x2="'+(w-p.r)+'" y1="'+yy+'" y2="'+yy+'" class="grid"/><text x="'+(p.l-8)+'" y="'+(yy+5)+'" text-anchor="end" class="axis">'+v.toFixed(opts.decimals??0)+'</text>';}
  data.forEach((d,i)=>{const bh=d[1]/max*ph,x=p.l+i*gap+(gap-bw)/2,y=p.t+ph-bh;s+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+bh+'" class="bar"/><text x="'+(x+bw/2)+'" y="'+(y-7)+'" text-anchor="middle" class="value">'+d[1]+'</text><text x="'+(x+bw/2)+'" y="'+(h-18)+'" text-anchor="middle" class="axis">'+esc(d[0])+'</text>';});
  s+='</svg>';el.innerHTML=s;
}
function go(i){
  current=Math.max(0,Math.min(slides.length-1,i));
  slides[current].scrollIntoView({behavior:"smooth",block:"start"});
  counter.textContent=(current+1)+" / "+slides.length;
  progress.style.width=((current+1)/slides.length*100)+"%";
}
document.querySelector("#prevBtn").addEventListener("click",()=>go(current-1));
const startBtn=document.querySelector("#startBtn");
if(startBtn) startBtn.addEventListener("click",()=>go(1));
document.querySelector("#nextBtn").addEventListener("click",()=>go(current+1));
document.querySelector("#presentationBtn").addEventListener("click",()=>{
  document.body.classList.toggle("presentation");
  document.querySelector("#presentationBtn").textContent=document.body.classList.contains("presentation")?"Sair da apresentação":"Modo apresentação";
});
document.addEventListener("keydown",e=>{
  if(["ArrowDown","PageDown"," "].includes(e.key)){e.preventDefault();go(current+1);}
  if(["ArrowUp","PageUp"].includes(e.key)){e.preventDefault();go(current-1);}
  if(e.key==="Home"){e.preventDefault();go(0);}
  if(e.key==="End"){e.preventDefault();go(slides.length-1);}
  if(e.key==="Escape")document.body.classList.remove("presentation");
});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){current=slides.indexOf(e.target);counter.textContent=(current+1)+" / "+slides.length;progress.style.width=((current+1)/slides.length*100)+"%";}
}),{threshold:.55});
slides.forEach(s=>observer.observe(s));
chartLine("#globalTempChart",D.globalTemp,{trend:true,decimals:1,aria:"Temperatura média global, 1996 a 2025, com tendência de longo prazo"});
chartBars("#rainChart",D.rain,{decimals:0,aria:"Acumulado de chuva por estação em agosto de 2026"});
chartBars("#heatChart",D.heat,{decimals:1,aria:"Temperaturas máximas observadas em 10 de agosto de 2026"});
chartLine("#ninoChart",D.nino34,{min:-.8,max:2.1,decimals:1,aria:"Anomalia Niño 3.4 de janeiro a agosto de 2026"});
go(0);