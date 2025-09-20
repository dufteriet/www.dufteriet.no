(function(){
  const JSON_URL = "https://cdn.jsdelivr.net/gh/dufteriet/www.dufteriet.no@main/js/prisdata.json?v=20250920f";

  // Normaliser streng: trim, NBSP -> space, zero-width ut, alle dash -> '-'
  function norm(s){
    return String(s || "")
      .replace(/\u00A0/g, " ")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .trim();
  }

  // Lag et indeks-objekt med NORMALISERTE nøkler fra JSON-fila
  function buildIndex(data){
    const idx = {};
    for (const k in data){
      const nk = norm(k).replace(/\s+/g,"-").replace(/-+/g,"-");
      idx[nk] = data[k];
    }
    return idx;
  }

  async function loadPrices(){
    const res = await fetch(JSON_URL, { cache: "no-store" });
    if(!res.ok) throw new Error("Kunne ikke hente prisdata: " + res.status);
    const raw = await res.json();
    return buildIndex(raw); // <<< normaliser nøkler ved innlasting
  }

  function renderPriceBox(el, data){
    const idRaw = el.getAttribute("data-price-id");
    let id = norm(idRaw);
    if(!id){ el.textContent = "Mangler data-price-id"; return; }

    if (id !== idRaw) {
      console.warn(`[dufteriet-prices] Normaliserte ID: "${idRaw}" -> "${id}"`);
    }

    // Direkte oppslag
    let item = data[id];

    // Fallback: klem sammen mellomrom/doble bindestreker
    if(!item){
      const id2 = id.replace(/\s+/g,"-").replace(/-+/g,"-");
      if (data[id2]) {
        console.warn(`[dufteriet-prices] Bruker fallback-nøkkel: "${id}" -> "${id2}"`);
        id = id2;
        item = data[id2];
      }
    }

    if(!item || !item.new){
      el.textContent = "Ingen priser funnet";
      console.warn(`[dufteriet-prices] Fant ikke nøkkel i prisdata: "${id}"`);
      return;
    }

    // Bygg liste
    const sizes = item.new;
    const ul = document.createElement("ul");
    ul.className = "price-list";
    Object.keys(sizes).forEach(k=>{
      const li=document.createElement("li");
      li.textContent = `${k.replace("ml"," ml")} – ${sizes[k]} kr`;
      ul.appendChild(li);
    });

    // Controls
    const controls = document.createElement("div");
    controls.className = "controls";
    const label = document.createElement("label");
    const selectId = "sel-" + id;
    label.setAttribute("for", selectId);
    label.textContent = "Velg størrelse:";
    const sel = document.createElement("select");
    sel.id = selectId;

    Object.keys(sizes).forEach(k=>{
      const opt = document.createElement("option");
      opt.value = `${k}|${sizes[k]}`;
      opt.textContent = `${k.replace("ml"," ml")} - ${sizes[k]} kr`;
      sel.appendChild(opt);
    });

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Legg til";
    const productName = el.getAttribute("data-product-name") || id.replace(/-/g," ");
    btn.addEventListener("click", ()=>{
      const [size, priceStr] = sel.value.split("|");
      const price = parseFloat(priceStr);
      const cart = JSON.parse(localStorage.getItem("cart")||"[]");
      cart.push({ item: productName, size, price });
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${productName} (${size}, ${price} kr) ble lagt til i handlekurven!`);
    });

    controls.appendChild(label);
    controls.appendChild(sel);
    controls.appendChild(btn);

    // Layout
    const wrap = document.createElement("div");
    wrap.className = "buy-card card-like";
    const body = document.createElement("div");
    body.className = "buy-body";
    const left = document.createElement("div");
    left.appendChild(ul);
    const right = document.createElement("div");
    right.appendChild(controls);

    body.appendChild(left);
    body.appendChild(right);

    const footer = document.createElement("div");
    footer.className = "buy-footer";
    const a = document.createElement("a");
    a.className = "cart-btn";
    a.href = "https://www.dufteriet.no/p/fork-bestilling.html";
    a.textContent = "🛒 Vis handlekurv";
    footer.appendChild(a);

    wrap.appendChild(body);
    wrap.appendChild(footer);

    el.innerHTML = "";
    el.appendChild(wrap);
  }

  async function init(){
    try{
      const data = await loadPrices();   // data har nå normaliserte nøkler
      document.querySelectorAll(".price-box").forEach(el => renderPriceBox(el, data));
      console.log("✅ Prisdata lastet");
    }catch(e){
      console.error("❌", e);
      document.querySelectorAll(".price-box").forEach(el => el.textContent = "Kunne ikke laste priser.");
    }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
