// Cloudflare Worker: keep OPENAI_API_KEY as an encrypted Worker secret.
const ALLOWED_ORIGIN='https://mrjmr68.github.io';
const cors={'access-control-allow-origin':ALLOWED_ORIGIN,'access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'content-type, authorization','content-type':'application/json','vary':'origin'};
export default{async fetch(request,env){
 const origin=request.headers.get('origin');
 if(origin&&origin!==ALLOWED_ORIGIN)return json({error:'Origin not allowed.'},403);
 if(request.method==='OPTIONS')return new Response(null,{headers:cors});
 const url=new URL(request.url);
 if(url.pathname.endsWith('/kalshi')){
  if(request.method!=='GET')return json({error:'Use GET for Kalshi odds.'},405);
  const upstream=await fetch('https://external-api.kalshi.com/trade-api/v2/events?series_ticker=KXNFLGAME&status=open&limit=200&with_nested_markets=true',{headers:{accept:'application/json'}});
  const data=await upstream.json().catch(()=>({}));
  if(!upstream.ok)return json({error:data.message||'Kalshi market data is unavailable.'},upstream.status);
  const pairs=['PHITEN','PITNE','MINCHI','CARATL','GBNYJ','NOBAL','CINHOU','CLETB'];
  const events=(data.events||[]).filter(event=>pairs.some(pair=>event.event_ticker?.includes(pair)));
  return json({events,as_of:new Date().toISOString()});
 }
 if(request.method!=='POST')return json({error:'Use POST.'},405);
 if(!env.DASHBOARD_TOKEN)return json({error:'DASHBOARD_TOKEN is not configured.'},500);
 if(request.headers.get('authorization')!==`Bearer ${env.DASHBOARD_TOKEN}`)return json({error:'Unauthorized.'},401);
 if(!env.OPENAI_API_KEY)return json({error:'OPENAI_API_KEY is not configured.'},500);
 let body;try{body=await request.json()}catch{return json({error:'Invalid JSON.'},400)}
 if(!Array.isArray(body.games)||body.games.length>16)return json({error:'Expected a games array.'},400);
 const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({
  model:'gpt-5.6-luna',store:false,reasoning:{effort:'low'},max_output_tokens:1800,
  instructions:'You are a conservative NFL live-market second-opinion model. Analyze only the supplied snapshot. Do not invent injuries, plays, or live state. For each game select the one team with the more interesting price, even when there is no edge. Estimate its fair win probability from 1-99 and explain the structural evidence briefly. Confidence means confidence in the estimate, not win probability. Avoid certainty. This is analysis, not betting advice.',
  input:JSON.stringify(body.games),
  text:{format:{type:'json_schema',name:'nfl_market_signals',strict:true,schema:{type:'object',additionalProperties:false,required:['signals'],properties:{signals:{type:'array',items:{type:'object',additionalProperties:false,required:['game_index','team','fair_probability','confidence','summary','game_state_read'],properties:{game_index:{type:'integer'},team:{type:'string'},fair_probability:{type:'number',minimum:1,maximum:99},confidence:{type:'number',minimum:0,maximum:100},summary:{type:'string'},game_state_read:{type:'string'}}}}}}}}
 })});
 const data=await response.json();if(!response.ok)return json({error:data.error?.message||'OpenAI request failed.'},response.status);
 const outputText=(data.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text;
 if(!outputText)return json({error:'The model returned no structured result.'},502);
 try{return json(JSON.parse(outputText))}catch{return json({error:'The model result was not valid JSON.'},502)}
}};
function json(value,status=200){return new Response(JSON.stringify(value),{status,headers:cors})}

