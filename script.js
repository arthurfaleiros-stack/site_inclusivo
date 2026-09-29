const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const pages = [["home", "Início"], ["sobre", "Sobre"], ["cursos", "Cursos e eventos"], ["midia", "Mídia"], ["acessibilidade", "Acessibilidade"], ["contato", "Contato"]];
const store = { get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch (e) { } } };
$("#menu").innerHTML = pages.map(([id, n]) => `<li><a href="#${id}" data-p="${id}">${n}</a></li>`).join("");
function show() {
    let id = location.hash.slice(1); if (!pages.some(p => p[0] === id)) id = "home";
    $$(".page").forEach(s => s.hidden = s.id !== id);
    $$("nav a").forEach(a => a.toggleAttribute("aria-current", a.dataset.p === id) || 0);
    $$("nav a").forEach(a => { if (a.dataset.p === id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current") });
    const n = pages.find(p => p[0] === id)[1]; $("#crumb").innerHTML = id === "home" ? "Você está no início" : `<a href="#home">Início</a> / ${n}`;
    document.title = n + " – Casa Aberta"; $("#live").textContent = "Página " + n;
    $("#menu").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", "false");
    speechSynthesis.cancel(); $("#read").setAttribute("aria-pressed", "false");
    const h = $("#" + id + " h1"); h.focus(); window.scrollTo(0, 0)
}
addEventListener("hashchange", show);
$("#menuBtn").onclick = () => { const o = $("#menu").classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", o) };
addEventListener("keydown", e => { if (e.key === "Escape") { $("#menu").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", "false") } });

/* zoom */
let z = parseInt(store.get("z") || "100");
function setZ(v) { z = Math.max(100, Math.min(200, v)); document.documentElement.style.fontSize = z + "%"; $("#zv").textContent = z + "%"; store.set("z", z) }
$("#zm").onclick = () => setZ(z - 25); $("#z0").onclick = () => setZ(100); $("#zp").onclick = () => setZ(z + 25); setZ(z);

/* contraste */
function setT(t) {
    const r = document.documentElement; if (t === "auto") r.removeAttribute("data-theme"); else r.dataset.theme = t;
    $$("[data-t]").forEach(b => b.setAttribute("aria-pressed", b.dataset.t === t)); store.set("t", t)
}
$$("[data-t]").forEach(b => b.onclick = () => setT(b.dataset.t)); setT(store.get("t") || "auto");

/* destaques e cursos */
const cursos = [["Oficina de pintura tátil", "Arte", "Toda terça, 14h", "Materiais com relevo e texturas."], ["Programação para iniciantes", "Tecnologia", "Quintas, 19h", "Aulas com leitor de tela e teclado."], ["Roda de leitura em Libras", "Arte", "Sábado, 10h", "Com intérprete e livros em áudio."], ["Yoga adaptada", "Bem-estar", "Segundas, 9h", "Práticas na cadeira ou no chão."], ["Introdução à IA no dia a dia", "Tecnologia", "Dia 18, 15h", "Palestra com legendas ao vivo."], ["Música e ritmo", "Bem-estar", "Sextas, 16h", "Instrumentos simples, sem pré-requisito."]];
$("#dest").innerHTML = cursos.slice(0, 3).map(c => `<li class="card"><span class="tag">${c[1]}</span><h3>${c[0]}</h3><p>${c[2]}</p></li>`).join("");
let cat = "Todos"; const cats = ["Todos", "Arte", "Tecnologia", "Bem-estar"];
function draw() {
    const l = cursos.filter(c => cat === "Todos" || c[1] === cat);
    $("#cards").innerHTML = l.map(c => `<li class="card"><span class="tag">${c[1]}</span><h3>${c[0]}</h3><p>${c[2]}. ${c[3]}</p><a class="btn" href="#contato">Quero me inscrever</a></li>`).join("");
    $("#count").textContent = l.length + (l.length === 1 ? " resultado" : " resultados") + " em " + cat;
    $$("#filters button").forEach(b => b.setAttribute("aria-pressed", b.textContent === cat))
}
$("#filters").innerHTML = cats.map(c => `<button aria-pressed="false">${c}</button>`).join("");
$$("#filters button").forEach(b => b.onclick = () => { cat = b.textContent; draw() }); draw();

/* vídeo simulado com legendas */
const caps = ["Bem-vindas e bem-vindos à Casa Aberta.", "Cada pessoa chega no seu ritmo.", "Todos os espaços têm acesso sem degraus."];
let vt = null, vi = 0, vcOn = true, vdOn = false;
function vShow() { const c = $("#cap"); c.hidden = !vcOn || vt === null; c.textContent = caps[vi] }
$("#vp").onclick = function () {
    if (vt) { clearInterval(vt); vt = null; this.textContent = "▶ Reproduzir"; this.setAttribute("aria-pressed", "false"); speechSynthesis.cancel() }
    else { this.textContent = "⏸ Pausar"; this.setAttribute("aria-pressed", "true"); vt = setInterval(() => { vi = (vi + 1) % caps.length; vShow(); if (vdOn) say("Cena " + (vi + 1) + ": círculos coloridos se aproximam no centro.") }, 3500); vShow() } vShow()
};
$("#vc").onclick = function () { vcOn = !vcOn; this.setAttribute("aria-pressed", vcOn); this.textContent = "Legendas: " + (vcOn ? "ligadas" : "desligadas"); vShow() };
$("#vd").onclick = function () { vdOn = !vdOn; this.setAttribute("aria-pressed", vdOn); this.textContent = "Audiodescrição: " + (vdOn ? "ligada" : "desligada") };

/* IA / voz: síntese de fala do navegador */
function say(t, done, vol) {
    if (!("speechSynthesis" in window)) { $("#live").textContent = "Seu navegador não tem leitura em voz alta."; return }
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "pt-BR"; u.volume = vol == null ? 1 : vol; u.onend = done; speechSynthesis.speak(u)
}
$("#read").onclick = function () {
    const on = this.getAttribute("aria-pressed") !== "true"; this.setAttribute("aria-pressed", on);
    if (!on) { speechSynthesis.cancel(); return }
    const sec = $$(".page").find(s => !s.hidden); say(sec.innerText, () => this.setAttribute("aria-pressed", "false"))
};
$("#ap").onclick = function () {
    const on = this.getAttribute("aria-pressed") !== "true"; this.setAttribute("aria-pressed", on);
    if (!on) { speechSynthesis.cancel(); this.textContent = "▶ Ouvir"; return }
    this.textContent = "⏸ Parar"; say($("#atxt").textContent, () => { this.setAttribute("aria-pressed", "false"); this.textContent = "▶ Ouvir" }, +$("#vol").value)
};

/* formulário */
$("#f").addEventListener("submit", e => {
    e.preventDefault(); $("#status").innerHTML = "";
    const v = { nome: $("#nome").value.trim(), email: $("#email").value.trim(), msg: $("#msg").value.trim() }, er = {};
    if (!v.nome) er.nome = "Digite seu nome.";
    if (!v.email) er.email = "Digite seu e-mail."; else if (!/^\S+@\S+\.\S+$/.test(v.email)) er.email = "Use um e-mail no formato nome@exemplo.com.";
    if (v.msg.length < 10) er.msg = "Escreva uma mensagem com pelo menos 10 letras.";
    let first = null; for (const k of ["nome", "email", "msg"]) { const i = $("#" + k), p = $("#e-" + k); p.textContent = er[k] || ""; i.setAttribute("aria-invalid", !!er[k]); if (er[k] && !first) first = i }
    if (first) { $("#status").innerHTML = `<div class="ok" role="alert">Há ${Object.keys(er).length} campo(s) para corrigir.</div>`; first.focus(); return }
    $("#status").innerHTML = `<div class="ok">Mensagem enviada. Obrigado, ${v.nome}! Respondemos em até 2 dias úteis.</div>`; e.target.reset()
});
show();
