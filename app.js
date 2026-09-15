/* ---------- Surbrillance de la page active dans la nav ---------- */
(function(){
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.pills a[data-page]').forEach(function(a){
    if (a.getAttribute('data-page') === here) a.classList.add('current');
  });
})();

/* ---------- Convertisseur de devises (page d'accueil uniquement) ---------- */
if (document.getElementById('amount')) {
  var RATE_EUR_OFF = 7.97, RATE_USD_OFF = 6.96;
  var RATE_EUR_STR = 9.6,  RATE_USD_STR = 9.0;
  var mode = 'official';

  var fmt = function(n){ return isNaN(n) ? '—' : n.toLocaleString('fr-FR', {maximumFractionDigits:2}); };

  window.setMode = function(m){
    mode = m;
    document.getElementById('btn-official').classList.toggle('active', m==='official');
    document.getElementById('btn-street').classList.toggle('active', m==='street');
    document.getElementById('out-mode').textContent = (m==='official') ? 'DAB' : 'Rue';
    if (!document.getElementById('rate-edit').classList.contains('show')){
      document.getElementById('rate-eur').value = (m==='official')?RATE_EUR_OFF:RATE_EUR_STR;
      document.getElementById('rate-usd').value = (m==='official')?RATE_USD_OFF:RATE_USD_STR;
    }
    calc();
  };

  window.toggleEdit = function(){
    document.getElementById('rate-edit').classList.toggle('show');
    document.getElementById('rate-eur').value = document.getElementById('rate-eur').value || (mode==='official'?RATE_EUR_OFF:RATE_EUR_STR);
    document.getElementById('rate-usd').value = document.getElementById('rate-usd').value || (mode==='official'?RATE_USD_OFF:RATE_USD_STR);
  };

  window.calc = function calc(){
    var amt = parseFloat(document.getElementById('amount').value) || 0;
    var cur = document.getElementById('currency').value;
    var rEur = parseFloat(document.getElementById('rate-eur').value) || (mode==='official'?RATE_EUR_OFF:RATE_EUR_STR);
    var rUsd = parseFloat(document.getElementById('rate-usd').value) || (mode==='official'?RATE_USD_OFF:RATE_USD_STR);

    var bob;
    if (cur === 'BOB') bob = amt;
    else if (cur === 'EUR') bob = amt * rEur;
    else bob = amt * rUsd;

    var eur = bob / rEur, usd = bob / rUsd;

    document.getElementById('out-bob').textContent = fmt(bob) + ' Bs';
    document.getElementById('out-eur').textContent = fmt(eur) + ' €';
    document.getElementById('out-usd').textContent = '$' + fmt(usd);
    document.getElementById('show-eur').textContent = fmt(rEur);
    document.getElementById('show-usd').textContent = fmt(rUsd);
  };

  var eurTouched = false, usdTouched = false;
  document.getElementById('rate-eur').addEventListener('input', function(){ eurTouched = true; });
  document.getElementById('rate-usd').addEventListener('input', function(){ usdTouched = true; });

  function setSync(msg){ document.getElementById('sync-status').textContent = msg; }

  window.fetchOfficialRates = async function(manual){
    var btn = document.querySelector('.sync-btn');
    if (btn) btn.disabled = true;
    setSync('Actualisation…');
    try {
      var r1 = await fetch('https://api.frankfurter.dev/v2/rate/USD/BOB');
      var r2 = await fetch('https://api.frankfurter.dev/v2/rate/EUR/BOB');
      if (!r1.ok || !r2.ok) throw new Error('http');
      var d1 = await r1.json(), d2 = await r2.json();
      RATE_USD_OFF = d1.rate; RATE_EUR_OFF = d2.rate;
      if (!usdTouched) document.getElementById('rate-usd').value = RATE_USD_OFF.toFixed(2);
      if (!eurTouched) document.getElementById('rate-eur').value = RATE_EUR_OFF.toFixed(2);
      var now = new Date();
      var hh = String(now.getHours()).padStart(2,'0'), mm = String(now.getMinutes()).padStart(2,'0');
      setSync('Taux DAB à jour · ' + hh + ':' + mm + ' (Frankfurter/BCB)');
      if (mode === 'official') calc();
    } catch(e) {
      setSync(manual ? 'Échec — pas de connexion, taux inchangés' : 'Hors-ligne — dernier taux connu conservé');
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  document.getElementById('rate-eur').value = RATE_EUR_OFF;
  document.getElementById('rate-usd').value = RATE_USD_OFF;
  calc();
  fetchOfficialRates(false);
  setInterval(function(){ fetchOfficialRates(false); }, 30*60*1000);
}

/* ---------- Adresses autour de vous (page d'accueil uniquement) ---------- */
if (document.getElementById('prox-list')) {
  var HOTEL = {lat:-16.5384841, lon:-68.0827210};
  var PLACES = [
    {name:"Banco Mercantil Santa Cruz — Ballivián", cat:"dab", addr:"Av. Ballivián 475", lat:-16.5404011, lon:-68.0890195, price:null, fee:"Gratuit — aucun frais DAB rapporté", feeTag:"ok", pid:"ChIJDaY43CUhX5ERtA8eepz2g5U"},
    {name:"Banco Mercantil Santa Cruz — Calle 10", cat:"dab", addr:"Calle 10, esq. 501", lat:-16.5450677, lon:-68.0862411, price:null, fee:"Gratuit — aucun frais DAB rapporté", feeTag:"ok", pid:"ChIJL8s2VQAhX5ER1lD6dcFRflE"},
    {name:"Cajero Banco Unión", cat:"dab", addr:"Zona Sur", lat:-16.5407169, lon:-68.0806242, price:null, fee:"Généralement gratuit, quelques signalements de frais variables — vérifiez l'écran avant validation", feeTag:"warn", pid:"ChIJobuvzushX5ER_yUkZFoApLg"},
    {name:"Banco Unión — Los Pinos", cat:"dab", addr:"Calle 21, 8482", lat:-16.5450936, lon:-68.0769576, price:null, fee:"Généralement gratuit, quelques signalements de frais variables — vérifiez l'écran avant validation", feeTag:"warn", pid:"ChIJHxoWk6chX5ERwGLYnFEMA1k"},
    {name:"Banco Bisa — Cajero Calacoto", cat:"dab", addr:"Av. Ballivián, Automóvil Club", lat:-16.5397249, lon:-68.0865084, price:null, fee:"Politique de frais non confirmée — à vérifier à l'écran", feeTag:"warn", pid:"ChIJ03bnpyUhX5ER8Taj549tK8I"},
    {name:"Banco Bisa — Cajero San Miguel", cat:"dab", addr:"Av. Ballivián 1461", lat:-16.5388096, lon:-68.0772307, price:null, fee:"Politique de frais non confirmée — à vérifier à l'écran", feeTag:"warn", pid:"ChIJEZAkiTkhX5ERc_jkYBp30xs"},

    {name:"International Money Exchange", cat:"cambio", addr:"Calle 21 de Calacoto 8350", lat:-16.5426374, lon:-68.0774160, price:"taux ~ marché parallèle", fee:"Pas de « frais » à proprement parler — la marge est dans le taux affiché ; comparez avant de changer, horaires réels parfois plus courts qu'annoncé", feeTag:"warn", pid:"ChIJeXr9RxIhX5ERyOXwEFam0Tg"},
    {name:"MIBA — Money Exchange", cat:"cambio", addr:"Calle Julio Patiño 1548, San Miguel", lat:-16.5393218, lon:-68.0771099, price:"taux ~ marché parallèle", fee:"Avis mitigés sur le taux proposé — demandez le taux du jour et comparez avec une autre adresse avant de vous engager", feeTag:"warn", pid:"ChIJLT4aHTohX5ER9AiRznHNueQ"},

    {name:"Farmacias ClariVida (24h)", cat:"pharm", addr:"Calle 23 de Calacoto", lat:-16.5384503, lon:-68.0755886, price:null, pid:"ChIJJ9mJLwAhX5ERfMd5IXvaufk"},
    {name:"Farmacias Chávez — Autofarmacia (24h)", cat:"pharm", addr:"Av. Ballivián 941", lat:-16.5388509, lon:-68.0835351, price:null, pid:"ChIJDx0ZOeEhX5ERWei76bCLck8"},
    {name:"Farmacia Chávez (24h)", cat:"pharm", addr:"Zona Sur", lat:-16.5453421, lon:-68.0733591, price:null, pid:"ChIJ8wxyD_EhX5ERVM3pi2xJd6w"},
    {name:"Farmacias Bolivia", cat:"pharm", addr:"Av. Ballivián 1099", lat:-16.5385879, lon:-68.0811706, price:null, pid:"ChIJ4cQq1eghX5ER0xYP9ArObVU"},

    {name:"Supermercado Ketal — Calacoto", cat:"super", addr:"Av. Ballivián & Calle 15", lat:-16.5394054, lon:-68.0839681, price:null, pid:"ChIJ86eJMSUhX5ERo8VS4uiwZ3Y"},
    {name:"Megacenter (mall + supermarché + food court)", cat:"super", addr:"Irpavi", lat:-16.5323262, lon:-68.0873421, price:null, pid:"ChIJsQAXYwAhX5ERWhw23OdqPVM"},

    {name:"Gustu", cat:"resto", addr:"Calle 10 de Calacoto", lat:-16.5447069, lon:-68.0864130, price:"€€€€ · gastronomique", pid:"ChIJAcKtqi8hX5ERa2iEZimHdu8"},
    {name:"Ancestral", cat:"resto", addr:"Calle 10 de Achumani", lat:-16.5344280, lon:-68.0757860, price:"€€€€ · menu dégustation", pid:"ChIJXVFRV4whX5ER99eqXu7l5_c"},
    {name:"Tinto Carnes & Vinos", cat:"resto", addr:"9ème rue de Calacoto", lat:-16.5436605, lon:-68.0875587, price:"€€€ · viandes & vins", pid:"ChIJgawAQQohX5ERrEFeTnhE9k8"},
    {name:"Sach'a Yuntas", cat:"resto", addr:"El Bosque Boulevard", lat:-16.5408397, lon:-68.0843577, price:"€€€ · péruvien/nikkei", pid:"ChIJH0YpjS0hX5ERRNVG9zPffxM"},
    {name:"Lolo Pastelería de Autor", cat:"resto", addr:"San Miguel", lat:-16.5445473, lon:-68.0792914, price:"€€ · café/pâtisserie", pid:"ChIJ252DwqEhX5ERstulFMRmkUI"},
    {name:"Café Épico", cat:"resto", addr:"Calle 14, Calacoto", lat:-16.5405994, lon:-68.0851493, price:"€€ · déjeuner léger", pid:"ChIJbayYaSUhX5ER4MsDbZ-moHM"},
    {name:"El Bosque Boulevard (food court)", cat:"resto", addr:"Calle 15 & Av. Sánchez Bustamante", lat:-16.5408413, lon:-68.0838652, price:"€-€€€ · plusieurs options", pid:"ChIJg-Uur5MhX5ER5ImdqItbA_k"},
    {name:"Typica Obrajes", cat:"resto", addr:"Av. Ormachea, Obrajes", lat:-16.5269028, lon:-68.1086509, price:"€€ · café de spécialité", pid:"ChIJvS5XGjEhX5ERHzOKr06gvhs"},

    {name:"Cielo Bar", cat:"bar", addr:"Torre Green, Av. de la Fuerza Naval", lat:-16.5383532, lon:-68.0819012, price:"€€€ · cocktails, vue", pid:"ChIJjx7CXushX5ERX35bu9mgbJs"},

    {name:"Atix Hotel — Spa", cat:"spa", addr:"Calle 16, Calacoto", lat:-16.5407196, lon:-68.0827958, price:"sur réservation", pid:"ChIJFVKlrzohX5ERgpa2QMvMAcA"}
  ];

  var ref = {lat:HOTEL.lat, lon:HOTEL.lon};
  var activeCat = 'all';
  var refMode = 'hotel';
  var LIVE_RADIUS = 500; // mètres

  function haversine(lat1, lon1, lat2, lon2){
    var R = 6371000;
    var toRad = function(d){ return d * Math.PI / 180; };
    var dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
    var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  function fmtDist(m){
    if (m < 1000) return Math.round(m) + ' m';
    return (m/1000).toLocaleString('fr-FR',{maximumFractionDigits:1}) + ' km';
  }
  var CAT_LABEL = {dab:'DAB / Banque', cambio:'Cambio', pharm:'Pharmacie', super:'Supermarché', resto:'Restaurant', bar:'Bar', spa:'Bien-être'};

  function renderProx(){
    var list = document.getElementById('prox-list');
    var items = PLACES.filter(function(p){ return activeCat==='all' || p.cat===activeCat; });
    items.forEach(function(p){ p._d = haversine(ref.lat, ref.lon, p.lat, p.lon); });

    if (refMode === 'live'){
      items = items.filter(function(p){ return p._d <= LIVE_RADIUS; });
    }
    items.sort(function(a,b){ return a._d - b._d; });

    if (items.length === 0){
      var msg = (refMode === 'live')
        ? 'Aucune adresse de la sélection à moins de ' + LIVE_RADIUS + ' m de votre position actuelle. Repassez en « Depuis l\'hôtel », ou ouvrez directement Google Maps pour explorer vos environs immédiats.'
        : 'Aucune adresse dans cette catégorie.';
      list.innerHTML = '<p class="no-results">' + msg + '</p>';
      return;
    }

    list.innerHTML = items.map(function(p){
      var gmaps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.name) + '&query_place_id=' + p.pid;
      var waze = 'https://waze.com/ul?ll=' + p.lat + ',' + p.lon + '&navigate=yes';
      var feeLine = p.fee ? '<div class="place-fee ' + (p.feeTag||'warn') + '">' + p.fee + '</div>' : '';
      return '' +
        '<div class="place">' +
          '<div class="place-top"><span class="place-name">' + p.name + '</span><span class="place-dist">' + fmtDist(p._d) + '</span></div>' +
          '<div class="place-meta">' + CAT_LABEL[p.cat] + (p.price ? ' · ' + p.price : '') + '</div>' +
          '<div class="place-addr">' + p.addr + '</div>' +
          feeLine +
          '<div class="place-actions">' +
            '<a class="gmaps" href="' + gmaps + '" target="_blank" rel="noopener">Google Maps ↗</a>' +
            '<a class="waze" href="' + waze + '" target="_blank" rel="noopener">Waze ↗</a>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  window.setCat = function(cat, btn){
    activeCat = cat;
    document.querySelectorAll('.catbtn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    renderProx();
  };

  window.setRef = function(mode){
    if (mode === 'hotel'){
      refMode = 'hotel';
      ref = {lat:HOTEL.lat, lon:HOTEL.lon};
      document.getElementById('ref-hotel').classList.add('active');
      document.getElementById('ref-live').classList.remove('active');
      document.getElementById('btn-refresh-live').style.display = 'none';
      document.getElementById('geo-status').textContent = 'Distances calculées depuis Casa Grande Suites.';
      document.getElementById('geo-address').textContent = '';
      renderProx();
      return;
    }
    fetchLivePosition();
  };

  function reverseGeocode(lat, lon){
    var addrEl = document.getElementById('geo-address');
    addrEl.textContent = 'Récupération de l\'adresse…';
    fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lon + '&localityLanguage=fr')
      .then(function(r){ if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function(d){
        var parts = [];
        if (d.locality) parts.push(d.locality);
        if (d.city && d.city !== d.locality) parts.push(d.city);
        if (d.principalSubdivision && parts.indexOf(d.principalSubdivision) === -1) parts.push(d.principalSubdivision);
        if (d.countryName) parts.push(d.countryName);
        addrEl.textContent = parts.length ? '📍 ' + parts.join(', ') : 'Adresse non identifiée pour cette position.';
      })
      .catch(function(){
        addrEl.textContent = 'Adresse indisponible (pas de connexion au moment de la requête) — coordonnées : ' + lat.toFixed(5) + ', ' + lon.toFixed(5);
      });
  }

  window.fetchLivePosition = function(){
    var bH = document.getElementById('ref-hotel'), bL = document.getElementById('ref-live');
    var status = document.getElementById('geo-status');
    var refreshBtn = document.getElementById('btn-refresh-live');

    if (!navigator.geolocation){
      status.textContent = 'Géolocalisation non disponible sur ce navigateur — utilisez « Depuis l\'hôtel ».';
      return;
    }
    if (refreshBtn.style.display !== 'none'){ refreshBtn.disabled = true; }
    status.textContent = 'Localisation en cours… (autorisez l\'accès si demandé)';
    navigator.geolocation.getCurrentPosition(
      function(pos){
        refMode = 'live';
        ref = {lat:pos.coords.latitude, lon:pos.coords.longitude};
        bL.classList.add('active'); bH.classList.remove('active');
        refreshBtn.style.display = 'inline-block';
        refreshBtn.disabled = false;
        status.textContent = 'Position active · précision ≈ ' + Math.round(pos.coords.accuracy) + ' m · rayon affiché : ' + LIVE_RADIUS + ' m';
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        renderProx();
      },
      function(err){
        var msg;
        if (location.protocol === 'file:'){
          msg = 'Bloqué par le navigateur : fichier ouvert en local (file://), non reconnu comme origine sécurisée. Solutions : essayez Firefox, ou servez ce fichier via un petit serveur local (http://localhost) ou en HTTPS. Repli sur « Depuis l\'hôtel ».';
        } else if (err.code === 1){
          msg = 'Localisation refusée — dans les réglages du site (icône ⓘ à côté de l\'adresse), Autorisations → Position → Autoriser, puis réessayez.';
        } else {
          msg = 'Position indisponible (' + err.message + '). Repli sur « Depuis l\'hôtel ».';
        }
        status.textContent = msg;
        refMode = 'hotel';
        bH.classList.add('active'); bL.classList.remove('active');
        refreshBtn.style.display = 'none';
        refreshBtn.disabled = false;
        document.getElementById('geo-address').textContent = '';
        ref = {lat:HOTEL.lat, lon:HOTEL.lon};
        renderProx();
      },
      {enableHighAccuracy:true, timeout:12000, maximumAge:0}
    );
  };

  /* Préselection de catégorie via ?cat=xxx (liens venant des pages thématiques) */
  var qCat = new URLSearchParams(location.search).get('cat');
  if (qCat && CAT_LABEL[qCat]){
    activeCat = qCat;
    var b = document.querySelector('.catbtn[data-cat="' + qCat + '"]');
    if (b){ document.querySelectorAll('.catbtn').forEach(function(x){ x.classList.remove('active'); }); b.classList.add('active'); }
  }

  renderProx();
}
