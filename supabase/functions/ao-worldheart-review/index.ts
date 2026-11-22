import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const PUBLIC_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY")!;
const WORLD_KEY = "grand-meridian-experiment";
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const authClient = createClient(SUPABASE_URL, PUBLIC_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const PAGE = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><title>AO WorldHeart · Review Queue</title>
<style>
:root{color-scheme:dark;--bg:#090812;--panel:#171326;--line:#3c3156;--gold:#e6c77b;--muted:#b8aecb;--ink:#f7f1ff;--red:#e6a0a8;--green:#a7d7b2}
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 50% 0%,#2a1d42 0%,var(--bg) 62%);color:var(--ink);font:15px/1.55 system-ui;padding:20px}
main{width:min(100%,980px);margin:24px auto;background:linear-gradient(160deg,#1c1730,var(--panel));border:1px solid var(--line);border-radius:20px;padding:clamp(18px,4vw,34px);box-shadow:0 28px 90px #0008}
.eyebrow{color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:.72rem;font-weight:700}h1{font-size:clamp(1.8rem,5vw,2.5rem);line-height:1.1;margin:.65rem 0 1rem}h2{font-size:1.2rem}p{color:var(--muted)}.panel,.proposal{padding:16px;border:1px solid var(--line);border-radius:13px;background:#100d1b;margin:14px 0}
label{display:block;color:var(--muted);font-size:.86rem;margin:12px 0 5px}input,textarea{width:100%;padding:12px;border:1px solid var(--line);border-radius:9px;background:#0d0a17;color:var(--ink);font:inherit}
button{border:0;border-radius:9px;padding:11px 15px;font:inherit;font-weight:700;cursor:pointer;margin:8px 8px 0 0}button:disabled{opacity:.45;cursor:not-allowed}.primary{background:var(--gold);color:#21182b}.secondary{background:#34274d;color:var(--ink);border:1px solid #594777}.danger{background:#512b3b;color:#ffe8ec;border:1px solid #80505b}
.notice{padding:13px;border-left:3px solid var(--gold);background:#171326;color:var(--muted);margin:16px 0}.status{min-height:1.5em;color:var(--gold);margin:10px 0;overflow-wrap:anywhere}.error{color:var(--red)}.ok{color:var(--green)}.hidden{display:none!important}
.meta{font-size:.83rem;color:var(--muted)}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#090812;padding:12px;border-radius:9px;border:1px solid #302543;max-height:360px;overflow:auto}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.tag{display:inline-block;border:1px solid var(--line);border-radius:99px;padding:3px 9px;color:var(--gold);font-size:.75rem}
</style></head><body><main>
<div class="eyebrow">Apotheosis Online · Grand Meridian Experiment</div>
<h1>WorldHeart Review Queue</h1>
<p>AI building changes are proposals until the Sovereign explicitly approves them here. Approval commits the accepted change and its event together; rejection leaves world state untouched.</p>
<div class="notice"><strong>One-time setup:</strong> if no Sovereign owner has claimed this experimental world, the first authenticated person may claim review authority here. Only do this if you are the AO Sovereign. The claim cannot be made by an MCP tool.</div>
<section id="auth" class="panel">
<h2>Sign in</h2><p>Use the same Supabase account you use to connect AO WorldHeart in ChatGPT or your Agent AI.</p>
<label for="email">Email</label><input id="email" type="email" autocomplete="email">
<label for="password">Password</label><input id="password" type="password" autocomplete="current-password">
<div class="row"><button class="primary" id="signin">Sign in</button><button class="secondary" id="signup">Create account</button></div>
<div id="authstatus" class="status" aria-live="polite"></div>
</section>
<section id="app" class="hidden">
<div class="row"><span id="identity" class="tag"></span><button class="secondary" id="refresh">Refresh queue</button><button class="secondary" id="signout">Sign out</button></div>
<section id="claim" class="panel hidden"><h2>Claim Sovereign review authority</h2><p>No owner is registered yet. Claiming makes this account the sole owner authorized to approve or reject AI building proposals for this experimental world.</p><button class="primary" id="claimbtn">I am the Sovereign — claim review authority</button></section>
<section id="notowner" class="panel hidden"><h2>Review access not assigned</h2><p>The Sovereign owner has already claimed this world. This account can use its authorized MCP tools but cannot approve proposals.</p></section>
<section id="queue" class="hidden"><h2>Pending proposals</h2><div id="items"></div></section>
<div id="status" class="status" aria-live="polite"></div>
</section>
</main>
<script type="module">
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const sb=createClient("https://hixbtiuibtyiqrtacver.supabase.co","sb_publishable_PdvHsSpEuDuzM06QeXS12Q_18-_DwaQ",{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
function msg(id,text,bad=false){$(id).textContent=text;$(id).classList.toggle("error",bad);$(id).classList.toggle("ok",!bad&&!!text)}
async function api(path,method="GET",body){const {data}=await sb.auth.getSession();const token=data.session?.access_token;if(!token)throw Error("Please sign in again.");const r=await fetch("/functions/v1/ao-worldheart-review"+path,{method,headers:{"authorization":"Bearer "+token,"content-type":"application/json"},body:body?JSON.stringify(body):undefined});const v=await r.json();if(!r.ok)throw Error(v.error||"Request failed");return v}
function show(id,on){$(id).classList.toggle("hidden",!on)}
async function refresh(){const {data}=await sb.auth.getUser();if(!data.user){show("app",false);show("auth",true);return}show("auth",false);show("app",true);$("identity").textContent=data.user.email||"Authenticated AO user";const state=await api("/api/owner");show("claim",!state.owner_claimed);show("notowner",state.owner_claimed&&!state.is_owner);show("queue",state.is_owner);if(state.is_owner)await loadQueue()}
async function loadQueue(){const data=await api("/api/queue");const host=$("items");host.replaceChildren();if(!data.proposals.length){const p=document.createElement("p");p.textContent="No pending proposals.";host.append(p);return}for(const proposal of data.proposals){const card=document.createElement("article");card.className="proposal";const h=document.createElement("h3");h.textContent=proposal.proposal_type;const meta=document.createElement("div");meta.className="meta";meta.textContent="Target: "+(proposal.target_entity_key||"New entity")+" · World revision: "+proposal.expected_world_revision+" · Submitted: "+new Date(proposal.created_at).toLocaleString();const pre=document.createElement("pre");pre.textContent=JSON.stringify(proposal.payload,null,2);const note=document.createElement("textarea");note.rows=2;note.placeholder="Optional review note";const approve=document.createElement("button");approve.className="primary";approve.textContent="Approve & commit";approve.onclick=()=>review(proposal.id,"approve",note.value,approve,reject);const reject=document.createElement("button");reject.className="danger";reject.textContent="Reject";reject.onclick=()=>review(proposal.id,"reject",note.value,approve,reject);card.append(h,meta,pre,note,approve,reject);host.append(card)}}
async function review(id,decision,note,a,b){a.disabled=b.disabled=true;try{const r=await api("/api/review","POST",{proposal_id:id,decision,review_note:note});msg("status",decision==="approve"?"Approved and committed. Event "+r.event_id:"Proposal rejected.");await loadQueue()}catch(e){msg("status",e.message,true);a.disabled=b.disabled=false}}
$("signin").onclick=async()=>{msg("authstatus","Signing in…");const r=await sb.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(r.error)return msg("authstatus",r.error.message,true);await refresh().catch(e=>msg("status",e.message,true))};
$("signup").onclick=async()=>{msg("authstatus","Creating account…");const r=await sb.auth.signUp({email:$("email").value.trim(),password:$("password").value});if(r.error)return msg("authstatus",r.error.message,true);if(!r.data.session)return msg("authstatus","Check your email to confirm, then sign in.");await refresh().catch(e=>msg("status",e.message,true))};
$("claimbtn").onclick=async()=>{if(!confirm("Claim the one-time Sovereign review authority for Grand Meridian?"))return;$("claimbtn").disabled=true;try{await api("/api/claim","POST",{});msg("status","Sovereign review authority claimed.");await refresh()}catch(e){msg("status",e.message,true);$("claimbtn").disabled=false}};
$("refresh").onclick=()=>refresh().catch(e=>msg("status",e.message,true));
$("signout").onclick=async()=>{await sb.auth.signOut();show("app",false);show("auth",true)};
sb.auth.onAuthStateChange((_event,session)=>{if(session)refresh().catch(e=>msg("status",e.message,true));else{show("app",false);show("auth",true)}});
const {data}=await sb.auth.getSession();if(data.session)refresh().catch(e=>msg("status",e.message,true));
</script></body></html>`;
function json(value: unknown, status = 200, origin = "") {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  if (origin === SUPABASE_URL) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-headers", "authorization, content-type");
    headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
    headers.set("vary", "Origin");
  }
  return new Response(JSON.stringify(value), { status, headers });
}
function page() {
  return new Response(PAGE, { headers: {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://esm.sh; style-src 'self' 'unsafe-inline'; connect-src 'self' https://esm.sh https://hixbtiuibtyiqrtacver.supabase.co; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
  }});
}
async function identify(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user?.id) return null;
  return data.user.id;
}
async function getWorldId(): Promise<string> {
  const { data, error } = await admin.from("exp_worlds").select("id,status")
    .eq("world_key", WORLD_KEY).single();
  if (error || !data || data.status !== "experimental") throw new Error("EXPERIMENT_WORLD_UNAVAILABLE");
  return data.id;
}
async function isOwner(worldId: string, userId: string): Promise<boolean> {
  const { data, error } = await admin.from("exp_world_approvers").select("auth_user_id")
    .eq("world_id", worldId).eq("auth_user_id", userId).eq("role", "owner").maybeSingle();
  if (error) throw new Error("OWNER_CHECK_FAILED");
  return !!data;
}
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const origin = req.headers.get("origin") ?? "";
  if (req.method === "OPTIONS") {
    if (origin && origin !== SUPABASE_URL) return json({ error: "ORIGIN_NOT_ALLOWED" }, 403);
    const response = new Response(null, { status: 204, headers: {
      "access-control-allow-origin": origin || SUPABASE_URL,
      "access-control-allow-headers": "authorization, content-type",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "vary": "Origin"
    }});
    return response;
  }
  if (url.pathname.endsWith("/ao-worldheart-review") || url.pathname.endsWith("/ao-worldheart-review/")) {
    if (req.method === "GET") return page();
  }
  if (origin && origin !== SUPABASE_URL) return json({ error: "ORIGIN_NOT_ALLOWED" }, 403);
  const userId = await identify(req);
  if (!userId) return json({ error: "AUTH_REQUIRED" }, 401, origin);

  try {
    const worldId = await getWorldId();
    if (url.pathname.endsWith("/api/owner") && req.method === "GET") {
      const { count, error } = await admin.from("exp_world_approvers").select("auth_user_id", { count: "exact", head: true })
        .eq("world_id", worldId).eq("role", "owner");
      if (error) throw new Error("OWNER_STATUS_READ_FAILED");
      return json({ owner_claimed: (count ?? 0) > 0, is_owner: await isOwner(worldId, userId) }, 200, origin);
    }
    if (url.pathname.endsWith("/api/claim") && req.method === "POST") {
      const { data, error } = await admin.rpc("exp_claim_world_owner", { p_auth_user_id: userId });
      if (error) throw new Error(error.message.includes("WORLD_OWNER_ALREADY_CLAIMED") ? "WORLD_OWNER_ALREADY_CLAIMED" : "OWNER_CLAIM_FAILED");
      return json(data, 200, origin);
    }
    if (url.pathname.endsWith("/api/queue") && req.method === "GET") {
      if (!(await isOwner(worldId, userId))) return json({ error: "WORLD_OWNER_REQUIRED" }, 403, origin);
      const { data, error } = await admin.from("exp_world_proposals")
        .select("id,proposer_auth_user_id,proposal_type,target_entity_key,expected_world_revision,payload,status,created_at")
        .eq("world_id", worldId).eq("status", "pending")
        .order("created_at", { ascending: true }).limit(100);
      if (error) throw new Error("PROPOSAL_QUEUE_READ_FAILED");
      return json({ proposals: data ?? [] }, 200, origin);
    }
    if (url.pathname.endsWith("/api/review") && req.method === "POST") {
      if (!(await isOwner(worldId, userId))) return json({ error: "WORLD_OWNER_REQUIRED" }, 403, origin);
      const body = await req.json();
      if (!body || typeof body.proposal_id !== "string" || !["approve","reject"].includes(body.decision)) {
        return json({ error: "INVALID_REVIEW_REQUEST" }, 400, origin);
      }
      const { data, error } = await admin.rpc("exp_review_and_commit_world_proposal", {
        p_reviewer_auth_user_id: userId,
        p_proposal_id: body.proposal_id,
        p_decision: body.decision,
        p_review_note: typeof body.review_note === "string" ? body.review_note.slice(0,1000) : null
      });
      if (error) throw new Error(error.message.includes("ENTITY_VERSION_CONFLICT") ? "ENTITY_VERSION_CONFLICT" :
        error.message.includes("PROPOSAL_NOT_PENDING") ? "PROPOSAL_NOT_PENDING" :
        error.message.includes("WORLD_OWNER_REQUIRED") ? "WORLD_OWNER_REQUIRED" : "PROPOSAL_REVIEW_FAILED");
      return json(data, 200, origin);
    }
    return json({ error: "NOT_FOUND" }, 404, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "REVIEW_REQUEST_FAILED";
    return json({ error: message }, 400, origin);
  }
});
