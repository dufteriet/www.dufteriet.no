<script>
;(()=>{

// ---- sett opp en gang pr side ----
const CSS_ID = "dufteriet-prices-css";
if(!document.getElementById(CSS_ID)){
  const css = `
  .card-like{border:1px solid #e9e9e9;border-radius:12px;background:#fafafa;box-shadow:0 1px 0 rgba(0,0,0,.02)}
  .buy-card{margin:0 0 12px;overflow:hidden}
  .buy-body{display:grid;grid-template-columns:1fr auto;gap:16px 20px;align-items:center;padding:14px}
  .price-list{list-style:none;margin:0;padding:0}
  .price-row{display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-bottom:1px dashed #eee}
  .price-row:last-child{border-bottom:0}
  .price-size{font-weight:600}
  .price-old{color:#888;text-decoration:line-through;margin-right:10px}
  .price-new{font-weight:700;color:#c00}
  .price-save{margin-left:10px;font-size:12px;background:#ffecec;color:#c00;padding:2px 8px;border-radius:999px}
  .price-plain{border-bottom:1px dashed #eee;padding:6px 0}
  .price-plain:last-child{border-bottom:0}
  .price-plain span{color:#333;font-weight:400}
  .controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-self:end}
  .controls label{margin-right:6px}
  .buy-footer{grid-column:1 / -1;padding:12px 14px 14px;border-top:1px solid #e9e9e9;display:flex;justify-content:center;background:#fafafa;border-radius:0 0 12px 12px}
  .cart-btn{display:inline-block;padding:10px 20px;background:#111;border:1px solid #111;border-radius:10px;font-weight:700;color:#fff;text-decoration:none;box-shadow:0 2px 6px rgba(0,0,0,.15);transition:all .2s}
  .cart-btn:hover{background:#333;border-color:#333}
  @media (max-width:720px){.buy-body{grid-template-columns:1fr;align-items:start}.controls{justify-self:start}}

  /* loader */
  .skeleton{position:relative;overflow:hidden;background:#eee;border-radius:6px}
  .skeleton::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%);animation:shimmer 1.2s infinite}
  @keyframes shimmer{100%{transform:translateX(100%)}}
  .price-skel{height:18px;margin:8px 0}
  `;
  const s = document.createElement("style"); s.id = CSS_ID; s.textContent = css;
  document.head.appendChild(s);
}

// ---- hjelpefunksjoner ----
const STD_ORDER = ["1ml","2ml","3ml","5ml","10ml"];
const q = (sel,root=document)=>root.querySelector(sel);
const c = (tag,cls)=>{const el=document.createElement(tag); if(cls) el.className=cls; return el;};

function niceLabel(key){
  // "12x1ml" -> "12 × 1 ml", "2ml" -> "2 ml"
  let k = key.trim();
  k = k.replace(/\s+/g,'');
  const m = /^(\d+)\s*x\s*(\d+)\s*ml$/i.exec(k);
  if(m) return `${parseInt(m[1],10)} × ${parseInt(m[2],10)} ml`;
  return k.replace(/ml\b/i,' ml');
}

function parseCountAndMl(key){
  // Returner {count, ml} for sortering. Fallback til Infinity.
  const k = key.replace(/\s+/g,'');
  let m = /^(\d+)\s*x\s*(\d+)\s*ml$/i.exec(k);
  if(m) return {count:parseInt(m[1],10), ml:parseInt(m[2],10)};
  m = /^(\d+)\s*ml$/i.exec(k);
  if(m) return {count:1, ml:parseInt(m[1],10)};
  return {count:9999, ml:9999};
}

// Ny versjon: støtter både standard-nøkler OG bundle-nøkler som "12x1ml"
function computeRows(data){
  const NEW = (data.new || {});
  const OLD = (data.old || {});
  let keys = STD_ORDER.filter(k => NEW[k] != null);

  if(keys.length === 0){
    keys = Object.keys(NEW).sort((a,b)=>{
      const A = parseCountAndMl(a), B = parseCountAndMl(b);
      if(A.count !== B.count) return A.count - B.count; // 12x før 24x
      if(A.ml !== B.ml) return A.ml - B.ml;             // 1 ml før 2 ml
      return a.localeCompare(b, 'nb', {numeric:true, sensitivity:'base'});
    });
  }

  return keys.map(k=>{
    const newP = Number(NEW[k]);
    const oldP = (OLD[k] != null) ? Number(OLD[k]) : null;
    const disc = (oldP!=null && oldP>newP) ? Math.round(((oldP-newP)/oldP)*100) : 0;
    return { key:k, label:niceLabel(k), newP, oldP, disc };
  });
}

function renderBox(host, items, productName){
  host.innerHTML="";
  const card=c("div","buy-card card-like");
  const body=c("div","buy-body");
  const left=c("div","");
  const ul=c("ul","price-list");

  items.forEach(it=>{
    const isDeal = it.oldP!=null && it.oldP>it.newP;
    if(isDeal){
      const li=c("li","price-row");
      const leftLbl=c("span","price-size"); leftLbl.textContent=it.label;
      const right=c("span","");
      const oldEl=c("span","price-old"); oldEl.textContent=it.oldP+" kr";
      const newEl=c("span","price-new"); newEl.textContent=it.newP+" kr";
      right.appendChild(oldEl); right.appendChild(newEl);
      if(it.disc>0){ const save=c("span","price-save"); save.textContent=`-${it.disc}%`; right.appendChild(save); }
      li.appendChild(leftLbl); li.appendChild(right); ul.appendChild(li);
    } else {
      const li=c("li","price-plain");
      const line=c("span",""); line.textContent = `${it.label} - ${it.newP} kr`;
      li.appendChild(line); ul.appendChild(li);
    }
  });

  left.appendChild(ul);

  // controls
  const controls=c("div","controls");
  const label=c("label",""); const selId="sel-"+Math.random().toString(36).slice(2,9);
  label.setAttribute("for",selId); label.textContent="Velg variant:";
  const sel=c("select",""); sel.id=selId;
  items.forEach(it=>{
    const opt=c("option","");
    opt.value=`${it.label}|${it.newP}`;
    opt.text =`${it.label} - ${it.newP} kr`;
    sel.add(opt);
  });
  const btn=c("button","cart-btn"); btn.type="button"; btn.textContent="Legg i handlekurv";
  btn.addEventListener("click",()=>{
    const val=sel.value; if(!val) return;
    const [size,priceStr]=val.split("|"); const price=parseFloat(priceStr);
    const cart=JSON.parse(localStorage.getItem("cart"))||[];
    cart.push({item:productName,size:size,price:price});
    localStorage.setItem("cart",JSON.stringify(cart));
    alert(`${productName} (${size}, ${price} kr) ble lagt til i handlekurven!`);
  });

  controls.appendChild(label); controls.appendChild(sel); controls.appendChild(btn);

  const footer=c("div","buy-footer");
  const a=c("a","cart-btn"); a.href="https://www.dufteriet.no/p/fork-bestilling.html"; a.textContent="🛒 Vis handlekurv";
  footer.appendChild(a);

  body.appendChild(left); body.appendChild(controls); body.appendChild(footer);
  card.appendChild(body);
  host.appendChild(card);
}

function renderSkeleton(host){
  host.innerHTML = `
    <div class="buy-card card-like"><div class="buy-body">
      <div><ul class="price-list">
        <li class="price-skel skeleton"></li>
        <li class="price-skel skeleton"></li>
        <li class="price-skel skeleton"></li>
        <li class="price-skel skeleton"></li>
        <li class="price-skel skeleton"></li>
      </ul></div>
      <div class="controls"><label>Laster …</label></div>
      <div class="buy-footer"><a class="cart-btn" href="https://www.dufteriet.no/p/fork-bestilling.html">🛒 Vis handlekurv</a></div>
    </div></div>
  `;
}

// ---- hovedløp ----
async function initBox(host){
  const priceId = host.getAttribute("data-price-id");
  const productName = host.getAttribute("data-product-name") || priceId || "Produkt";

  if(!priceId){ host.textContent="Mangler data-price-id"; return; }

  renderSkeleton(host);

  try{
    const res = await fetch('/p/prisdata.html',{credentials:'omit'});
    if(!res.ok) throw new Error("Prisdata utilgjengelig");
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html,'text/html');
    const node = doc.querySelector('#prisdata');
    if(!node) throw new Error("Fant ikke #prisdata");

    let raw = node.textContent || '';
    // tillat kommentarer og hengende komma i JSON
    raw = raw.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'').replace(/,\s*(?=[}\]])/g,'');
    const data = JSON.parse(raw);

    const entry = data[priceId];
    if(!entry){ host.innerHTML="<em>Pris ikke tilgjengelig.</em>"; return; }

    const items = computeRows(entry);
    if(!items.length){ host.innerHTML="<em>Ingen priser.</em>"; return; }

    renderBox(host, items, productName);
  }catch(e){
    console.error(e);
    host.innerHTML="<em>Kunne ikke hente priser akkurat nå.</em>";
  }
}

// start for alle bokser
document.querySelectorAll('.price-box').forEach(initBox);

})();
</script>
