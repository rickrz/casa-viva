// Baixa Fraunces e Inter (subset latino, woff2) e gera src/fontes/fontes.css.
import fs from "node:fs/promises";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const DEST = path.join(RAIZ, "src", "fontes");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const JOBS = [
  { nome: "fraunces", familia: "Fraunces", url: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&display=swap" },
  { nome: "inter", familia: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@400..600&display=swap" },
];

await fs.mkdir(DEST, { recursive: true });
const regras = [];

for (const job of JOBS) {
  const css = await (await fetch(job.url, { headers: { "user-agent": UA } })).text();
  const blocos = [...css.matchAll(/\/\*\s*([a-z0-9-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)].map((m) => ({ sub: m[1], corpo: m[2] }));
  const latin = blocos.find((b) => b.sub === "latin") || blocos.at(-1);
  if (!latin) throw new Error("Subset latino não encontrado para " + job.nome);
  const url = (latin.corpo.match(/url\((https:[^)]+)\)/) || [])[1];
  if (!url) throw new Error("URL da fonte não encontrada para " + job.nome);

  const buf = Buffer.from(await (await fetch(url, { headers: { "user-agent": UA } })).arrayBuffer());
  const arquivo = `${job.nome}-latin.woff2`;
  await fs.writeFile(path.join(DEST, arquivo), buf);

  const peso = (latin.corpo.match(/font-weight:\s*([^;]+);/) || [])[1]?.trim() || "400";
  const estilo = (latin.corpo.match(/font-style:\s*([^;]+);/) || [])[1]?.trim() || "normal";
  const unicode = (latin.corpo.match(/unicode-range:\s*([^;]+);/) || [])[1]?.trim();
  regras.push(`@font-face {
  font-family: "${job.familia}";
  font-style: ${estilo};
  font-weight: ${peso};
  font-display: swap;
  src: url("./${arquivo}") format("woff2");
${unicode ? `  unicode-range: ${unicode};\n` : ""}}`);

  console.log(job.nome, (buf.length / 1024).toFixed(0) + "kB");
}

await fs.writeFile(
  path.join(DEST, "fontes.css"),
  "/* Fontes self-hosted (subset latino). Gerado por tools/baixar-fontes.mjs */\n\n" + regras.join("\n\n") + "\n"
);
console.log("fontes.css gerado");
