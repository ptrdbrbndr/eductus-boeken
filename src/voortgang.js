/* Leesvoortgang: per titel of de samenvatting en of het boek zelf is gelezen.
   Opslag in localStorage van deze browser; er is geen server die dit bewaart.
   Wordt door scripts/build.mjs op de plek van {{VOORTGANG}} ingevoegd in
   src/template.html en src/boek.html. */
var VG_SLEUTEL = "eductus-boeken-voortgang-v1";
var VOORTGANG = vgLees();

function vgLees(){
  try { return JSON.parse(localStorage.getItem(VG_SLEUTEL)) || {}; }
  catch (e) { return {}; }
}
function vgBewaar(){
  try { localStorage.setItem(VG_SLEUTEL, JSON.stringify(VOORTGANG)); }
  catch (e) { /* privémodus of volle opslag: de knoppen blijven wel werken */ }
}
function vgVan(nr){ return VOORTGANG[String(nr)] || {}; }

/** "geen" | "samenvatting" | "boek"; boek gelezen wint van samenvatting. */
function vgStand(nr){
  var s = vgVan(nr);
  return s.boek ? "boek" : (s.samenvatting ? "samenvatting" : "geen");
}

function vgZet(nr, veld, aan){
  var k = String(nr);
  var s = VOORTGANG[k] || (VOORTGANG[k] = {});
  if (aan) s[veld] = true; else delete s[veld];
  if (!Object.keys(s).length) delete VOORTGANG[k];
  vgBewaar();
  vgMeld();
}
function vgMeld(){ document.dispatchEvent(new CustomEvent("voortgang")); }

/* Een tweede tabblad van dezelfde site houdt de stand gelijk. */
window.addEventListener("storage", function(e){
  if (e.key === VG_SLEUTEL){ VOORTGANG = vgLees(); vgMeld(); }
});

/** Het knoppenpaar voor één titel. Houdt zichzelf bij op het voortgang-signaal. */
function vgKnoppen(nr, signal){
  var wrap = document.createElement("div");
  wrap.className = "voortgang";
  wrap.dataset.nr = nr;
  wrap.innerHTML =
    '<button type="button" class="vg" data-veld="samenvatting" aria-pressed="false">samenvatting gelezen</button>' +
    '<button type="button" class="vg" data-veld="boek" aria-pressed="false">boek gelezen</button>';
  var knoppen = wrap.querySelectorAll("button.vg");
  function sync(){
    var s = vgVan(nr);
    knoppen.forEach(function(k){
      k.setAttribute("aria-pressed", String(!!s[k.dataset.veld]));
    });
  }
  wrap.addEventListener("click", function(e){
    var k = e.target.closest("button.vg");
    if (!k) return;
    vgZet(nr, k.dataset.veld, k.getAttribute("aria-pressed") !== "true");
  });
  document.addEventListener("voortgang", sync, signal ? { signal: signal } : false);
  sync();
  return wrap;
}

/** Kleurt de nummers in de leesroutes: blauw bij samenvatting, groen bij boek. */
function vgKleurRoutes(){
  document.querySelectorAll(".route .nrs b.stap").forEach(function(el){
    var stand = vgStand(el.dataset.nr);
    el.classList.toggle("sam", stand === "samenvatting");
    el.classList.toggle("klaar", stand === "boek");
    el.title = stand === "boek" ? "boek gelezen"
      : stand === "samenvatting" ? "samenvatting gelezen" : "nog niet gelezen";
  });
}
