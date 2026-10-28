// Verificador simples de links internos do build.
import fs from "node:fs";
import path from "node:path";

const dist = path.join(import.meta.dirname, "..", "dist");
const paginas = [];
(function walk(dir) {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, entrada.name);
    if (entrada.isDirectory()) walk(caminho);
    else if (entrada.name.endsWith(".html")) paginas.push(caminho);
  }
})(dist);

const faltando = new Map();
const regex = /(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g;
for (const pagina of paginas) {
  const html = fs.readFileSync(pagina, "utf8");
  for (const achado of html.matchAll(regex)) {
    const alvo = achado[1];
    let arquivo = path.join(dist, decodeURIComponent(alvo));
    if (alvo.endsWith("/")) arquivo = path.join(arquivo, "index.html");
    if (!fs.existsSync(arquivo)) {
      if (!faltando.has(alvo)) faltando.set(alvo, []);
      faltando.get(alvo).push(path.relative(dist, pagina));
    }
  }
}

console.log(`Páginas HTML: ${paginas.length}`);
console.log(`Links/ativos internos quebrados: ${faltando.size}`);
for (const [alvo, origens] of [...faltando].slice(0, 30)) {
  console.log(`${alvo} <- ${origens[0]}`);
}
