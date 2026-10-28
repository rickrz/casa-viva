// Gerador estático da Casa Viva — sem dependências.
// Uso: node build.mjs
import fs from "node:fs/promises";
import path from "node:path";

import { loja, categorias, produtos, cupons, fretes } from "./data/catalogo.mjs";
import { paginaHome, paginaListagem, paginaProduto, paginaBusca } from "./lib/paginas-loja.mjs";
import {
  paginaCarrinho,
  paginaCheckout,
  paginaConfirmacao,
  paginaConta,
  paginaFavoritos,
} from "./lib/paginas-compra.mjs";
import {
  paginaSobre,
  paginaContato,
  paginaTrocas,
  paginaPrivacidade,
  paginaFaq,
  paginaRastreamento,
  paginaCreditos,
  pagina404,
} from "./lib/paginas-institucional.mjs";
import { paginaAdmin } from "./lib/paginas-admin.mjs";
import { SITE } from "./lib/ui.mjs";

const RAIZ = import.meta.dirname;
const SRC = path.join(RAIZ, "src");
const DIST = path.join(RAIZ, "dist");

const rotas = [];
const hoje = new Date().toISOString().slice(0, 10);

async function escrever(rota, html) {
  const destino =
    rota.endsWith(".html") || rota.endsWith(".xml") || rota.endsWith(".txt") || rota.endsWith(".webmanifest")
      ? path.join(DIST, rota.replace(/^\//, ""))
      : path.join(DIST, rota.replace(/^\//, ""), "index.html");
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, html, "utf8");
  if (!/\.(xml|txt|webmanifest)$/.test(rota) && rota !== "/404.html") {
    rotas.push({ rota, prioridade: rota === "/" ? 1 : rota.split("/").filter(Boolean).length === 1 ? 0.8 : 0.7 });
  }
  console.log("  ✓", rota);
}

async function copiarPasta(origem, destino) {
  await fs.mkdir(destino, { recursive: true });
  const itens = await fs.readdir(origem, { withFileTypes: true });
  for (const item of itens) {
    const de = path.join(origem, item.name);
    const para = path.join(destino, item.name);
    if (item.isDirectory()) await copiarPasta(de, para);
    else await fs.copyFile(de, para);
  }
}

function catalogoJs() {
  const dados = {
    loja,
    categorias,
    produtos,
    cupons,
    fretes,
  };
  return `/* Catálogo gerado por build.mjs — não edite manualmente. */\nwindow.CATALOGO = ${JSON.stringify(
    dados
  )};\n`;
}

function sitemap() {
  const urls = [
    ...rotas.map((r) => ({ ...r, prioridade: r.rota === "/" ? 1 : r.rota.startsWith("/produtos/") ? 0.7 : r.prioridade })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE}${u.rota}</loc>
    <lastmod>${hoje}</lastmod>
    <changefreq>${u.rota === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${u.prioridade.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

console.log("\nCasa Viva — gerando o site\n");

await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });

// Assets
await copiarPasta(path.join(SRC, "img"), path.join(DIST, "assets", "img"));
await copiarPasta(path.join(SRC, "fontes"), path.join(DIST, "assets", "fontes"));
await fs.mkdir(path.join(DIST, "assets", "css"), { recursive: true });
await fs.mkdir(path.join(DIST, "assets", "js"), { recursive: true });

// CSS modular concatenado em um único arquivo (ordem alfabética dos módulos)
const arquivosCss = (await fs.readdir(path.join(SRC, "css")))
  .filter((f) => f.endsWith(".css"))
  .sort();
const cssFinal = (
  await Promise.all(arquivosCss.map((f) => fs.readFile(path.join(SRC, "css", f), "utf8")))
).join("\n\n");
await fs.writeFile(
  path.join(DIST, "assets", "css", "estilos.css"),
  `/* Casa Viva — estilos gerados por build.mjs (${arquivosCss.length} módulos) */\n\n${cssFinal}`,
  "utf8"
);

// fontes.css é servido dentro de assets/css e aponta para ../fontes/
const cssFontes = await fs.readFile(path.join(SRC, "fontes", "fontes.css"), "utf8");
await fs.writeFile(
  path.join(DIST, "assets", "css", "fontes.css"),
  cssFontes.replace(/url\("\.\//g, 'url("../fontes/'),
  "utf8"
);
await fs.copyFile(path.join(SRC, "loja.js"), path.join(DIST, "assets", "js", "loja.js"));
await fs.copyFile(path.join(SRC, "admin.js"), path.join(DIST, "assets", "js", "admin.js"));
await fs.copyFile(path.join(SRC, "favicon.svg"), path.join(DIST, "assets", "favicon.svg"));
await fs.writeFile(path.join(DIST, "assets", "js", "catalogo.js"), catalogoJs(), "utf8");
await fs.copyFile(path.join(RAIZ, "src", "img", "hero-sala.jpg"), path.join(DIST, "assets", "og-casa-viva.jpg"));

// Páginas principais
await escrever("/", paginaHome());
await escrever("/produtos/", paginaListagem({ tipo: "todos" }));
await escrever("/ofertas/", paginaListagem({ tipo: "ofertas" }));

for (const cat of categorias) {
  await escrever(`/${cat.slug}/`, paginaListagem({ tipo: "categoria", categoria: cat }));
  for (const sub of cat.subs) {
    await escrever(`/${cat.slug}/${sub.slug}/`, paginaListagem({ tipo: "categoria", categoria: cat, sub }));
  }
}

for (const p of produtos) {
  await escrever(`/produtos/${p.slug}/`, paginaProduto(p));
}

await escrever("/busca/", paginaBusca());
await escrever("/carrinho/", paginaCarrinho());
await escrever("/checkout/", paginaCheckout());
await escrever("/pedido-confirmado/", paginaConfirmacao());
await escrever("/conta/", paginaConta());
await escrever("/favoritos/", paginaFavoritos());

// Institucional
await escrever("/sobre/", paginaSobre());
await escrever("/contato/", paginaContato());
await escrever("/trocas-e-devolucoes/", paginaTrocas());
await escrever("/privacidade/", paginaPrivacidade());
await escrever("/faq/", paginaFaq());
await escrever("/rastreamento/", paginaRastreamento());
await escrever("/creditos/", paginaCreditos());
await escrever("/admin/", paginaAdmin());
await escrever("/404.html", pagina404());

// SEO e suporte
await escrever("/sitemap.xml", sitemap());
await escrever(
  "/robots.txt",
  `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /carrinho/
Disallow: /checkout/
Disallow: /pedido-confirmado/
Disallow: /conta/
Disallow: /busca/

Sitemap: ${SITE}/sitemap.xml
`
);
await escrever(
  "/manifest.webmanifest",
  JSON.stringify(
    {
      name: "Casa Viva",
      short_name: "Casa Viva",
      description: loja.descricao,
      start_url: "/",
      display: "standalone",
      background_color: "#FBF8F3",
      theme_color: "#12655C",
      lang: "pt-BR",
      icons: [{ src: "/assets/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    },
    null,
    2
  ) + "\n"
);

console.log(`\n${rotas.length} páginas geradas em dist/.`);
console.log(`Imagens: ${(await fs.readdir(path.join(DIST, "assets", "img"))).length} arquivos.`);
console.log("Pronto. Rode: node server.mjs\n");
