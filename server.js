import express from "express";
const app = express();

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nova – lokale KI</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#0b1020;color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif;height:100vh}
.wrap{height:100vh;max-width:900px;margin:auto;display:flex;flex-direction:column}
header{padding:16px 18px;border-bottom:1px solid #29324c;background:#10172a;display:flex;align-items:center;gap:12px}
.logo{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#7c5cff,#00d4ff);display:grid;place-items:center;font-weight:900;font-size:21px}
h1{margin:0;font-size:20px}.sub{font-size:12px;color:#aab4d0;margin-top:3px}
#status{margin-left:auto;font-size:12px;color:#aab4d0;text-align:right}
#chat{flex:1;overflow:auto;padding:20px 15px;display:flex;flex-direction:column;gap:12px}
.msg{max-width:84%;padding:12px 15px;border-radius:17px;line-height:1.45;white-space:pre-wrap}.bot{align-self:flex-start;background:#18213a;border:1px solid #293553}.user{align-self:flex-end;background:#5f4de3}
.inputbar{padding:13px;border-top:1px solid #29324c;background:#10172a;display:flex;gap:9px}
input{flex:1;background:#171f35;color:#fff;border:1px solid #34405f;border-radius:14px;padding:13px;font-size:15px;outline:0}
button{border:0;border-radius:14px;background:#6c55ff;color:#fff;font-weight:700;padding:0 17px}
button:disabled{opacity:.5}
</style></head>
<body><div class="wrap">
<header><div class="logo">N</div><div><h1>Nova</h1><div class="sub">KI direkt im Browser · kein API-Key</div></div><div id="status">Starte…</div></header>
<main id="chat"></main>
<div class="inputbar"><input id="input" placeholder="Schreib Nova etwas…" disabled><button id="send" disabled>Senden</button></div>
</div>
<script type="module">
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
const chat=document.getElementById("chat"), input=document.getElementById("input"), send=document.getElementById("send"), status=document.getElementById("status");
let engine=null;
function add(text,who){const d=document.createElement("div");d.className="msg "+who;d.textContent=text;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;return d}
add("Hallo! 👋 Ich bin Nova. Ich lade gerade mein KI-Modell direkt in deinen Browser. Beim ersten Start kann der Download ziemlich groß sein. Danach wird das Modell im Browser zwischengespeichert.","bot");

async function start(){
  try{
    if(!("gpu" in navigator)) throw new Error("WebGPU wird von diesem Browser/Gerät nicht unterstützt.");
    engine=await CreateMLCEngine(MODEL,{initProgressCallback:(p)=>{
      const pct=Math.round((p.progress||0)*100);
      status.textContent=pct+"% wird geladen";
    }});
    status.textContent="🟢 Bereit";
    input.disabled=false; send.disabled=false; input.focus();
    add("Fertig! 🚀 Stell mir eine Frage.","bot");
  }catch(e){
    status.textContent="⚠️ Nicht verfügbar";
    add("Die lokale KI konnte auf diesem Gerät nicht gestartet werden. Möglicherweise unterstützt dein Browser/WebGPU das Modell nicht oder der Download wurde unterbrochen. Fehler: "+e.message,"bot");
  }
}
async function sendMsg(){
  const m=input.value.trim(); if(!m||!engine)return;
  add(m,"user"); input.value=""; send.disabled=true; input.disabled=true;
  const d=add("Nova denkt…","bot");
  try{
    const r=await engine.chat.completions.create({
      messages:[
        {role:"system",content:"Du bist Nova, ein freundlicher und hilfreicher KI-Assistent. Antworte auf Deutsch, wenn der Nutzer Deutsch schreibt. Halte Antworten passend für Jugendliche und erkläre Dinge verständlich."},
        {role:"user",content:m}
      ],
      temperature:0.7,
      max_tokens:500
    });
    d.textContent=r.choices?.[0]?.message?.content || "Ich konnte gerade keine Antwort erzeugen.";
  }catch(e){d.textContent="Fehler bei der KI-Antwort: "+e.message}
  input.disabled=false; send.disabled=false; input.focus();
}
send.onclick=sendMsg; input.addEventListener("keydown",e=>{if(e.key==="Enter")sendMsg()});
start();
</script></body></html>`;

app.get("/",(_req,res)=>res.type("html").send(html));
app.get("/health",(_req,res)=>res.json({ok:true,mode:"browser-local-ai"}));
const port=process.env.PORT||3000;
app.listen(port,"0.0.0.0",()=>console.log("Nova läuft auf Port "+port));
