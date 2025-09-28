/* brand-grid.js */
(() => {
  'use strict';

  function waitForGrid(cb){
    let tries = 0;
    (function poll(){
      const grid = document.getElementById('brandGrid');
      if (grid){ cb(grid); return; }
      if (++tries > 200) return;
      setTimeout(poll, 100);
    })();
  }

  waitForGrid(function(grid){
    const controls   = document.getElementById('brandControls');
    const sortSelect = document.getElementById('brandSort');

    const MASTER_BRANDS = [
      "4711","Abercrombie & Fitch","Adi Ale Van","Al Haramain","Amouage","Argos","Armaf","BDK Parfums","Boadicea The Victorious","Chanel","Chapel Factory","Christian Provenzano Parfums","City Rhythm","Clive Christian","Creed","Dior","Electimuss","Essential Parfums","Ex Nihilo","Fragrance One","Francesca Bianchi","Giorgio Armani","Gisada","Goldfield & Banks","Guerlain","Hermès","Houbigant","Hugo Boss","Initio","Issey Miyake","Kilian","Les Indemodables","Lorenzo Pazzaglia","Louis Vuitton","Loumari","Maison Francis Kurkdjian","Maison Margiela","Marc-Antoine Barrois","M.Micallef","Memo","Mind Games","Mith","Montblanc","Nasomatto","Nishane","Nobile 1942","Ormonde Jayne","Orto Parisi","Pana Dora","Parfums de Marly","Paris Corner","Rogue Perfumery","Roja London","Room 1015","Sospiro","Stéphane Humbert Lucas","The Merchant of Venice","Tom Ford","Widian","Xerjoff","Yves Saint Laurent","Zimaya","Zoologist"
    ];

    // Ekstra alias for robuste treff (inkl. Goldfield-varianter)
    const ALIAS = {
      "Parfums De Marly":"Parfums de Marly",
      "Stèphane Humbert Lucas":"Stéphane Humbert Lucas",
      "Stephane Humbert Lucas":"Stéphane Humbert Lucas",
      "BDK":"BDK Parfums",
      "YSL":"Yves Saint Laurent",
      "Hermes":"Hermès",
      "Les Indémodables":"Les Indemodables",
      "Marc Antoine Barrois":"Marc-Antoine Barrois",
      "Goldfield&Banks":"Goldfield & Banks",
      "Goldfield and Banks":"Goldfield & Banks"
    };
    function canon(n){ if(!n) return ""; n = n.trim(); return ALIAS[n] || n; }

    const BRANDS_SET = MASTER_BRANDS.reduce((s,n) => { s[canon(n)] = 1; return s; }, Object.create(null));

    const REV_ALIAS = {};
    Object.keys(ALIAS).forEach((k) => {
      const v = ALIAS[k];
      (REV_ALIAS[v] || (REV_ALIAS[v]=[])).push(k);
    });
    const SEEN_LABEL_ORIGINAL = {};

    // ====== LOGOS (jsDelivr fra repoet ditt) ======
    // Base: https://cdn.jsdelivr.net/gh/dufteriet/www.dufteriet.no@main/logos/<FIL>
    const GH = "https://cdn.jsdelivr.net/gh/dufteriet/www.dufteriet.no@main/logos/";
    const LOGOS = {
      "4711": GH+"4711EchtKoelnischWasserPin_v2.png",
      "Abercrombie & Fitch": GH+"1322.svg",
      "Adi Ale Van": GH+"logo-Adi-ale-Van-300px.png",
      "Al Haramain": GH+"al-haramain-australia.png",
      "Amouage": GH+"Amouage_logo.png",
      "Argos": GH+"Argos_Fragrances_Logo_ZGO.png",
      "Armaf": GH+"logo-footer.png",
      "BDK Parfums": GH+"bdk_parfum.png",
      "Boadicea The Victorious": GH+"logo-2.png",
      "Caron": GH+"o.22.jpg",
      "Chanel": GH+"imgbin-chanel-logo-fashion-clothing-gucci-logo-vRFCX7PAEqBMCLhgdaspWe3md.jpg",
      "Chapel Factory": GH+"chapel-factory-img.jpg",
      "Christian Provenzano Parfums": GH+"Logo_empty_2_1.png",
      "City Rhythm": GH+"city_rhythm.webp",
      "Clive Christian": GH+"Clive-logo-groot.png",
      "Creed": GH+"creed-perfume-eau-de-cologne-eau-de-parfum-basenotes-png-favpng-J1b8dY3G7z2mzFN7VWjJDfWDD.jpg",
      "Dior": GH+"Christian_Dior_(fashion_house)-Logo.wine.png",
      "Electimuss": GH+"o.2124.jpg",
      "Essential Parfums": GH+"2023-03-27---logo-ok.png",
      "Ex Nihilo": GH+"Ex-nihilo-1_460x.png",
      "Fragrance One": GH+"Logo_Txt_480x120px_White_BG.png",
      "Francesca Bianchi": GH+"Capture-removebg-preview-2023-05-17T145756.849_be106e4f-507c-4045-b3e6-14610c086878.png",
      "Giorgio Armani": GH+"giorgio-armani-logo-png-transparent.png",
      "Gisada": GH+"Gisada-logo.png",
      "Goldfield & Banks": GH+"Goldfield&Banks.png",
      "Guerlain": GH+"guerlain.svg",
      "Hermès": GH+"fb1999107996831.6038e3bc643c0.png",
      "Houbigant": GH+"352.jpg",
      "Hugo Boss": GH+"png-clipart-logo-brand-hugo-boss-hugo-boss-logo-text-logo.png",
      "Initio": GH+"logo_initio.png",
      "Issey Miyake": GH+"issey-miyake.svg",
      "Kilian": GH+"logokilianlanding.png",
      "Les Indemodables": GH+"Les_Indemodables_perfumes_LOGO_b9a8ad0d-f0a8-4cbf-9b94-6fafd077172e.jpg",
      "Lorenzo Pazzaglia": GH+"lorenzo-pazzaglia.jpg",
      "Louis Vuitton": GH+"louis_vuitton.webp",
      "Loumari": GH+"491.jpg",
      "M.Micallef": GH+"m.micallef.webp",
      "Maison Francis Kurkdjian": GH+"18813446_1620805254599319_4042536172921936110_n.png",
      "Maison Margiela": GH+"2eiePCOjT2SktIZoOhyO_LOGO_REPLICA_MAISON_MARGIELA_reframe.png",
      "Marc-Antoine Barrois": GH+"001_marc-antoine_barrois.png",
      "Memo": GH+"monogramme.jpg",
      "Mind Games": GH+"MG_Final_Logo_1_-03.png",
      "Mith": GH+"mith.jpg",
      "Montblanc": GH+"o.107.jpg",
      "Nasomatto": GH+"nasomatto.png",
      "Nishane": GH+"2_f7560d9c-ca84-47d5-b12b-a45abd689c1f.png",
      "Nobile 1942": GH+"logo_nobile_1942.png",
      "Ormonde Jayne": GH+"ormonde-jayne.jpg",
      "Orto Parisi": GH+"c1o3l4afMXBjGCAc3flS71zgNoMWTpvECksAskNP.jpg",
      "Pana Dora": GH+"Pana_Dora_200px.png",
      "Parfums de Marly": GH+"parfums-de-marly-929249.jpg",
      "Paris Corner": GH+"paris_corner.png",
      "Rogue Perfumery": GH+"rogue_perfumery.png",
      "Roja London": GH+"logo_roja.png",
      "Room 1015": GH+"Y8dQF6L0zI6kLxsu2nKMeBTYg63ro4GIy9h1qtsl.png",
      "Sospiro": GH+"Sospiro_Logo_ZGO_Web.png",
      "Stéphane Humbert Lucas": GH+"ZGO_SHL-777_Logo_51d2a333-9680-48e8-b871-c07bf7ec1d03.jpg",
      "The Merchant of Venice": GH+"o.1942.jpg",
      "Tom Ford": GH+"tom-ford-logo-png_seeklogo-383930.png",
      "Widian": GH+"1118.jpg",
      "Xerjoff": GH+"Progetto_senza_titolo_-_2022-04-12T122100.882.png",
      "Yves Saint Laurent": GH+"faa174034ef637970214c19bc9258a32.jpg",
      "Zimaya": GH+"zimaya_logo.png",
      "Zoologist": GH+"zoologistlogo.png"
    };

    function jsonp(url, cbName, onError){
      const s = document.createElement('script');
      s.src = url + (url.indexOf('?') > -1 ? '&' : '?') + 'alt=json-in-script&callback=' + cbName;
      s.onerror = onError || function(){};
      document.body.appendChild(s);
    }

    const COUNTS = Object.create(null);
    let masterList = [];
    const COUNT_NODES = Object.create(null);

    function fetchCountsFromPosts(done){
      const perReq = 250;
      let startIndex = 1;
      let total = null;
      const local = Object.create(null);

      function step(){
        const cb = "__posts_cb_" + Math.random().toString(36).slice(2);
        window[cb] = function(data){
          try {
            const feed = data.feed || {};
            const entries = feed.entry || [];
            const t = Number((((feed['openSearch$totalResults'] || {}).$t) || 0));
            if (!isNaN(t)) total = t;
            const got = entries.length;

            entries.forEach(function(e){
              (e.category || []).forEach(function(c){
                const orig = (c.term || "").trim();
                if (!orig) return;
                const n = canon(orig);
                local[n] = (local[n] || 0) + 1;
                if (!SEEN_LABEL_ORIGINAL[n]) SEEN_LABEL_ORIGINAL[n] = orig;
              });
            });

            startIndex += got;
            if (total !== null && startIndex <= total && got > 0){ step(); }
            else { done(local); }
          } finally { try { delete window[cb]; } catch(_){} }
        };

        const url = location.origin + "/feeds/posts/summary?max-results=" + perReq + "&start-index=" + startIndex;
        jsonp(url, cb, function(){ try { delete window[cb]; } catch(_){}; done(local); });
      }
      step();
    }

    function fetchCountForLabel(canonName){
      const tried = Object.create(null);
      let cand = [];

      if (SEEN_LABEL_ORIGINAL[canonName]) cand.push(SEEN_LABEL_ORIGINAL[canonName]);
      cand.push(canonName);
      if (REV_ALIAS[canonName]) Array.prototype.push.apply(cand, REV_ALIAS[canonName]);

      cand = cand.filter(function(n){
        n = (n || "").trim();
        if (!n || tried[n]) return false;
        tried[n] = 1;
        return true;
      });

      const node = COUNT_NODES[canonName];

      (function next(i){
        if (i >= cand.length) return;
        const label = cand[i];
        const enc = encodeURIComponent(label);
        const cb = "__count_cb_" + Math.random().toString(36).slice(2);
        window[cb] = function(data){
          try {
            const n = Number(((((data || {}).feed || {})['openSearch$totalResults'] || {}).$t));
            if (Number.isFinite(n)){
              COUNTS[canonName] = n;
              if (node) node.textContent = n === 1 ? '1 duft' : (n > 1 ? (n + ' dufter') : '0 dufter');
              if (sortSelect && (sortSelect.value === 'count-desc' || sortSelect.value === 'count-asc')) sortAndRender();
              return;
            }
            next(i + 1);
          } finally { try { delete window[cb]; } catch(_){} }
        };
        jsonp(location.origin + "/feeds/posts/summary/-/" + enc + "?max-results=1", cb, function(){ try { delete window[cb]; } catch(_){}; next(i + 1); });
      })(0);
    }

    function initials(name){
      return (name || '?')
        .split(/\s+/)
        .map(w => w[0])
        .filter(Boolean)
        .join('')
        .slice(0,3)
        .toUpperCase();
    }

    function labelUrlByCanon(cn){
      const real = SEEN_LABEL_ORIGINAL[cn] || cn;
      return location.origin + "/search/label/" + encodeURIComponent(real);
    }

    function makeCard(brand){
      const card = document.createElement('article');
      card.className = 'brand-card';
      card.setAttribute('role','group');
      card.setAttribute('aria-label', brand.name);

      const avatar = document.createElement('div');
      avatar.className = 'brand-avatar';

      const logo = brand.logo || LOGOS[brand.name];
      if (logo){
        const img = document.createElement('img');
        img.src = logo;
        img.alt = brand.name + ' logo';
        img.loading = 'lazy';
        img.onerror = function(){
          avatar.textContent = initials(brand.name);
          avatar.classList.add('fallback');
        };
        avatar.appendChild(img);
      } else {
        avatar.textContent = initials(brand.name);
        avatar.classList.add('fallback');
      }

      const info  = document.createElement('div');
      info.className = 'brand-info';
      const h3    = document.createElement('h3');
      h3.className = 'brand-name';
      h3.textContent = brand.name;
      const count = document.createElement('div');
      count.className = 'brand-count';
      COUNT_NODES[brand.name] = count;

      const link = document.createElement('a');
      link.className = 'brand-link';
      link.href = brand.url;
      link.textContent = 'Vis alle';
      (function(){
        const u = new URL(brand.url, location.href);
        const isInternal = (u.origin === location.origin) || u.hostname.endsWith('dufteriet.no');
        if (!isInternal){
          link.target = '_blank';
          link.rel = 'noopener';
        }
      })();

      info.appendChild(h3);
      info.appendChild(count);
      info.appendChild(link);
      card.appendChild(avatar);
      card.appendChild(info);

      card.addEventListener('click', function(e){
        if (e.target.tagName.toLowerCase() !== 'a'){ location.href = brand.url; }
      });

      const n = COUNTS[brand.name];
      count.textContent = Number.isFinite(n) ? (n === 1 ? '1 duft' : (n > 1 ? (n + ' dufter') : '0 dufter')) : '';
      fetchCountForLabel(brand.name);
      return card;
    }

    function render(list){
      grid.innerHTML = '';
      list.forEach(b => { grid.appendChild(makeCard(b)); });
    }

    function sortList(list, mode){
      function byNameAsc(a,b){ return a.name.localeCompare(b.name, 'nb', {sensitivity:'base'}); }
      if (mode === 'name-asc')  return list.slice().sort(byNameAsc);
      if (mode === 'name-desc') return list.slice().sort((a,b) => byNameAsc(b,a));

      function get(n){ return Number.isFinite(COUNTS[n]) ? COUNTS[n] : -1; }
      if (mode === 'count-desc') return list.slice().sort(function(a,b){
        const A = get(a.name), B = get(b.name);
        if (B !== A) return B - A;
        return a.name.localeCompare(b.name, 'nb', {sensitivity:'base'});
      });
      if (mode === 'count-asc') return list.slice().sort(function(a,b){
        const A = get(a.name), B = get(b.name);
        if (A !== B) return A - B;
        return a.name.localeCompare(b.name, 'nb', {sensitivity:'base'});
      });
      return list;
    }

    function sortAndRender(){
      const mode = (sortSelect && sortSelect.value) || 'name-asc';
      render( sortList(masterList, mode) );
    }
    if (sortSelect) sortSelect.addEventListener('change', sortAndRender);

    grid.innerHTML = '<p style="color:#666;margin:8px 0 0;">Laster merker …</p>';

    fetchCountsFromPosts(function(found){
      Object.keys(found).forEach(function(k){
        const c = canon(k);
        if (BRANDS_SET[c]){
          COUNTS[c] = (COUNTS[c] || 0) + found[k];
        }
      });

      const seen = Object.create(null);
      const list = [];

      Object.keys(COUNTS).forEach(function(n){
        const c = canon(n);
        if (BRANDS_SET[c] && !seen[c]){
          seen[c] = 1;
          list.push({ name: c, url: labelUrlByCanon(c) });
        }
      });

      MASTER_BRANDS.forEach(function(n){
        const c = canon(n);
        if (!seen[c]){
          seen[c] = 1;
          COUNTS[c] = COUNTS[c] || 0;
          list.push({ name: c, url: labelUrlByCanon(c) });
        }
      });

      masterList = list.sort((a,b) => a.name.localeCompare(b.name, 'nb', {sensitivity:'base'}));
      if (masterList.length){
        if (controls) controls.style.display = 'flex';
        sortAndRender();
      } else {
        grid.innerHTML = '<p>Fant ingen merker.</p>';
      }
    });
  });
})();
