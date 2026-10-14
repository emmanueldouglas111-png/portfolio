/* year */
document.getElementById("yr").textContent = new Date().getFullYear();

/* mobile menu */
const btn = document.getElementById("menuBtn"), nav = document.getElementById("nav");
btn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", e => { if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });

/* terminal typing (plain text; no user input is ever rendered as HTML) */
const lines = [
  ["$ ", "whoami"],
  ["", "udota-douglas // frontend dev + security enthusiast"],
  ["$ ", "skills --frontend"],
  ["", "react  html  css  javascript  git  vercel"],
  ["$ ", "project --latest"],
  ["", "mama-joy-restaurants  [live]"],
  ["", "marketing-business-project  [live]"],
  ["$ ", "cert --status"],
  ["", "CompTIA Security+  [in progress]"],
  ["$ ", "skills --security"],
  ["", "pentest  incident-response  siem  vuln-assessment"],
  ["$ ", "tools"],
  ["", "kali  nmap  wireshark  burp  splunk  elastic"],
  ["$ ", "learning"],
  ["", "cloud-security"],
  ["$ ", "labs --status"],
  ["", "101Labs Security+ labs done · TryHackMe in progress"],
  ["$ ", "status"],
  ["", "open to opportunities"]
];
const term = document.getElementById("term");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function render(done, partial) {
  term.textContent = "";
  done.forEach(l => {
    const row = document.createElement("div");
    if (l[0]) { const p = document.createElement("span"); p.className = "p"; p.textContent = l[0]; row.append(p, document.createTextNode(l[1])); }
    else { const o = document.createElement("span"); o.className = "o"; o.textContent = l[1]; row.append(o); }
    term.append(row);
  });
  if (partial !== null) {
    const row = document.createElement("div");
    const cur = document.createElement("span"); cur.className = "cur";
    row.append(document.createTextNode(partial), cur); term.append(row);
  }
}
if (reduce) { render(lines, null); }
else {
  let li = 0, ci = 0; const done = [];
  (function tick() {
    if (li >= lines.length) { render(done, ""); return; }
    const [pre, txt] = lines[li];
    const shown = pre + txt.slice(0, ci);
    if (ci <= txt.length) {
      render(done, shown); ci++;
      setTimeout(tick, pre ? 70 : 18);
    } else { done.push(lines[li]); li++; ci = 0; setTimeout(tick, 280); }
  })();
}

/* reveal on scroll + active nav link */
document.querySelectorAll("section .wrap > *, .card, .proj").forEach(el => el.classList.add("rv"));
const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll(".rv").forEach(el => rv.observe(el));

const links = [...document.querySelectorAll("nav a")];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-40% 0px -55% 0px" });
["about", "skills", "project", "journey", "contact"].forEach(id => spy.observe(document.getElementById(id)));

/* contact form: sends the message to the Formspree address set in data-endpoint on the <form> in index.html */
(function () {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const say = (msg, cls) => { status.textContent = msg; status.className = "status " + (cls || ""); };
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(form);
    const name = (f.get("name") || "").toString().trim();
    const email = (f.get("email") || "").toString().trim();
    const message = (f.get("message") || "").toString().trim();
    form.querySelectorAll("input,textarea").forEach(i => i.classList.remove("invalid"));
    if (f.get("website")) return; /* honeypot: bots fill this hidden field */
    const bad = [];
    if (!name) bad.push("name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push("email");
    if (message.length < 5) bad.push("message");
    if (bad.length) {
      bad.forEach(n => form.elements[n].classList.add("invalid"));
      say("Please check the highlighted fields.", "err"); form.elements[bad[0]].focus(); return;
    }
    const endpoint = form.dataset.endpoint.trim();
    if (!endpoint) { say("The form is not connected yet.", "err"); return; }
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; say("Sending…");
    try {
      const r = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ name, email, message }) });
      if (!r.ok) throw new Error("bad response");
      form.reset(); say("Thanks, your message was sent. I'll reply soon.", "ok");
    } catch (err) {
      say("Sorry, that didn't send. Please try again in a moment.", "err");
    } finally { btn.disabled = false; }
  });
})();