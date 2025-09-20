(function(){
  const JSON_URL = "https://cdn.jsdelivr.net/gh/dufteriet/www.dufteriet.no@main/js/prisdata.json";

  function fmtKey(str){
    // Bruk samme normalisering som vi har brukt i nøkler
    return String(str)
      .replace(/æ/gi,"ae").replace(/ø/gi,"o").replace(/å/gi,"a")
      .replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").trim();
  }

  async function loadPrices(){
    const res = await fetch(JSON_URL, { cache: "no-store" });
    if(!res.ok) throw new Error("Kunne ikke hente prisdata: " + res.status);
    return await res.json();
  }

  function renderPriceBox(el, data){
    const id = el.getAttribute("data-price-id");
    if(!id){ el.textContent = "Mangler data-price-id"; return; }

    const item = data[id];
    if(!item || !item.new){ el.textContent = "Ingen priser funnet"; return; }

    const sizes = item.new; // {"1ml": 50, ...}

    // Bygg enkel liste
    const ul = document.createElement("ul");
    ul.className = "price-list";
    Object.keys(sizes).forEach(k=>{
      const li=document.createElement("li");
      li.textContent = `${k.replace("ml"," ml")} – ${sizes[k]} kr`;
      ul.appendChild(li);
    });

    // Bygg select + knapp hvis man vil
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

    // Pakk inn i enkel layout
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
      const data = await loadPrices();
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
