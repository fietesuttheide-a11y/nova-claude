import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const app=express();
const anthropic=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});
app.use(express.json());

const page=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nova • Claude</title>
<style>
*{box-sizing:border-box}body{margin:0;height:100vh;background:#07090e;color:#f5f7fb;font-family:system-ui,Arial}.app{height:100vh;display:flex;max-width:1400px;margin:auto;background:#0c0f16}aside{width:230px;background:#090c12;border-right:1px solid #202634;padding:20px}.brand{display:flex;gap:10px;align-items:center;margin-bottom:28px}.logo,.hero{display:grid;place-items:center;background:linear-gradient(135deg,#7759ff,#28c8ff);box-shadow:0 10px 35px #665cff55}.logo{width:40px;height:40px;border-radius:12px}.brand b{display:block}.brand small{color:#788298;font-size:11px}aside button{width:100%;padding:12px;border-radius:12px;border:1px solid #2b3240;background:#151a24;color:#fff;text-align:left}.item{margin-top:28px;padding:11px;background:#161c27;border-radius:10px}section{flex:1;display:flex;flex-direction:column}header{height:68px;border-bottom:1px solid #202634;padding:15px 24px}header small{display:block;color:#778197;font-size:11px}i{display:inline-block;width:7px;height:7px;background:#48e58d;border-radius:50%;margin-right:5px}main{flex:1;overflow:auto;padding:28px 20px}.welcome{text-align:center;max-width:680px;margin:12vh auto}.hero{width:72px;height:72px;border-radius:23px;margin:auto;font-size:34px}.welcome h1{font-size:30px}.welcome p{color:#8791a6}.msg{max-width:760px;margin:0 auto 16px;padding:14px 17px;border-radius:17px;line-height:1.55;white-space:pre-wrap}.user{background:linear-gradient(135deg,#6651df,#4c70e8)}.bot{background:#151a24;border:1px solid #262e3c}.who{font-size:10px;color:#aeb7c8;margin-bottom:5px}form{display:flex;max-width:800px;width:calc(100% - 40px);margin:0 auto 8px;padding:6px;background:#151a23;border:1px solid #293140;border-radius:17px}input{flex:1;background:none;border:0;outline:0;color:#fff;padding:11px;font-size:15px}form button{width:42px;border:0;border-radius:12px;background:#fff;font-size:21px}footer{text-align:center;color:#566074;font-size:10px;padding-bottom:10px}@media(max-width:650px){aside{display:none}.welcome{margin-top:7vh}}
</style></head><body><div class="app"><aside><div class="brand"><div class="logo">✦</div><div><b>Nova</b><small>Claude AI</small></div></div><button onclick="location.reload()">＋ Neuer Chat</button><div class="item">💬 Mein Chat</div></aside><section><header><b>Nova</b><small><i></i> Claude verbunden</small></header><main id="chat"><div class="welcome"><div class="hero">✦</div><h1>Hallo! 👋</h1><p>Ich bin Nova mit Claude. Was möchtest du wissen?</p></div></main><form id="f"><input id="i" placeholder="Nachricht an Nova..." autocomplete="off"><button>↑</button></form><footer>Nova nutzt Claude von Anthropic.</footer></section></div>
<script>
const f=document.querySelector("#f"),i=document.querySelector("#i"),c=document.querySelector("#chat");
function add(t,u){const d=document.createElement("div");d.className="msg "+(u?"user":"bot");d.innerHTML='<div class="who">'+(u?"Du":"✦ Nova • Claude")+'</div><div></div>';d.lastChild.textContent=t;c.appendChild(d);c.scrollTop=c.scrollHeight}
f.onsubmit=async e=>{e.preventDefault();let t=i.value.trim();if(!t)return;document.querySelector(".welcome")?.remove();add(t,true);i.value="";add("Denke nach…",false);let wait=c.lastChild;try{let r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:t})}),x=await r.json();wait.lastChild.textContent=x.reply||x.error}catch(e){wait.lastChild.textContent="Server nicht erreichbar."}};
</script></body></html>`;

app.get("/",(_,res)=>res.send(page));
app.post("/api/chat",async(req,res)=>{
 try{
  const message=String(req.body.message||"").trim();
  if(!message)return res.status(400).json({error:"Keine Nachricht."});
  const r=await anthropic.messages.create({
   model:"claude-sonnet-4-6",max_tokens:1200,
   system:"Du bist Nova, ein freundlicher und hilfreicher KI-Assistent. Antworte auf Deutsch, wenn der Nutzer Deutsch schreibt.",
   messages:[{role:"user",content:message}]
  });
  res.json({reply:r.content.filter(x=>x.type==="text").map(x=>x.text).join("\n")});
 }catch(e){console.error(e);res.status(500).json({error:"Claude konnte gerade nicht antworten."})}
});
const port=process.env.PORT||3000;
app.listen(port,"0.0.0.0",()=>console.log("Nova läuft auf Port "+port));
