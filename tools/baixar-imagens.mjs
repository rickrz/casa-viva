// Baixa as fotografias do catálogo para src/img e registra os créditos.
// Uso: node tools/baixar-imagens.mjs
import fs from "node:fs/promises";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const DEST = path.join(RAIZ, "src", "img");

const commons = (arquivo, titulo, largura = 1600) => ({
  arquivo,
  tipo: "commons",
  titulo,
  largura,
  pagina: "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(titulo.replace(/ /g, "_")),
});

const burst = (arquivo, slug) => ({
  arquivo,
  tipo: "burst",
  url: `https://burst.shopifycdn.com/photos/${slug}.jpg?width=1600&quality=85`,
  fonte: "Burst (Shopify)",
  licenca: "Uso comercial gratuito, sem atribuição obrigatória",
  pagina: `https://burst.shopify.com/photos/${slug}`,
});

const IMAGENS = [
  // Ambiente e editoriais
  burst("hero-sala", "couple-sits-relaxing-in-living-room"),
  burst("editorial-conforto", "books-on-sofa-in-sunbeam"),
  burst("cat-sofas", "stylish-sofa"),
  burst("cat-casa", "minimalist-home-decor-in-neutral-color"),
  burst("cat-eletro", "modern-white-tiled-kitchen"),
  burst("faixa-ofertas", "interior-design-of-a-grey-and-gold-living-room"),
  burst("amb-sofas-1", "living-room-bathed-in-natural-light-through-a-window"),
  burst("amb-sofas-2", "home-interior-in-neutral-colors"),
  burst("amb-casa-1", "rustic-home-decor"),
  burst("amb-casa-2", "bedroom-side-table-light"),
  burst("amb-eletro-1", "bright-modern-kitchen"),
  burst("amb-eletro-2", "open-plan-kitchen-with-wooden-fixtures"),

  // Sofás
  burst("sofa-viena-3-lugares", "natural-white-sofa-on-wood-frame"),
  burst("sofa-oslo-2-lugares", "soft-livingroom-sofa"),
  burst("sofa-dublin-retratil", "person-leans-back-on-a-grey-couch-while-holding-a-mug"),
  burst("sofa-milao-canto", "sofa-and-coffee-table-on-large-balcony"),
  burst("poltrona-nordica", "silver-metal-chair-with-thick-yellow-cushions"),
  burst("poltrona-lucca", "soft-pink-cushioned-armchair-in-stately-salon"),

  // Casa
  burst("mesa-centro-tulum", "stack-of-books-and-candles-on-a-lounge-coffee-table"),
  burst("mesa-lateral-nara", "wooden-tray-on-side-table-in-living-room"),
  burst("luminaria-arco", "vintage-lamp-and-house-plant"),
  burst("jogo-cama-percal", "bedroom-in-neutral-tones"),
  burst("kit-toalhas", "rolled-bathroom-towels"),
  burst("vaso-ceramica", "interior-home-decor-vase"),
  burst("tapete-berlim", "child-sits-on-fluffy-rug"),
  burst("cortina-blackout", "window-with-closed-curtains-and-a-green-potted-plant"),
  burst("espelho-redondo", "bathroom-shelving-mirror"),
  burst("kit-organizadores", "home-decor-and-kitchen-accessories"),

  // Eletrodomésticos
  burst("fogao-5-bocas", "gas-cooking-range-in-a-large-home-kitchen"),
  commons("geladeira-frost-free-400l", "Consumer Reports - Samsung refrigerator.tif"),
  commons("maquina-lavar-11kg", "Fagor washing machine front FF6314.jpg"),
  commons("micro-ondas-32l", "Breville Microwave.png"),
  commons("air-fryer-5l", "Air Fryer 5458.jpg"),
  commons("cafeteira-expresso", "Krups Vivo F880 home espresso maker.jpg"),
  commons("chaleira-eletrica", "Electric kettle - Электрический чайник.JPG", 1400),
  {
    arquivo: "aspirador-robo",
    tipo: "picjumbo",
    url: "https://i0.wp.com/picjumbo.com/wp-content/uploads/robot-vacuum-cleaner-in-action-free-image.jpg?w=1400&quality=85",
    fonte: "Picjumbo",
    licenca: "Uso comercial gratuito, sem atribuição obrigatória",
    pagina: "https://picjumbo.com/robot-vacuum-cleaner-in-action/",
  },
];

const UA = { "user-agent": "CasaVivaBuild/1.0 (loja demonstrativa)" };

async function metadadosCommons(titulos) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.search = new URLSearchParams({
    action: "query",
    format: "json",
    titles: titulos.map((t) => "File:" + t).join("|"),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1600",
  }).toString();
  const r = await fetch(api, { headers: UA });
  const j = await r.json();
  const mapa = {};
  for (const p of Object.values(j.query?.pages || {})) {
    const info = p.imageinfo?.[0];
    if (!info) continue;
    const meta = info.extmetadata || {};
    const limpar = (v) => (v || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    mapa[p.title.replace(/^File:/, "")] = {
      autor: limpar(meta.Artist?.value) || "Wikimedia Commons",
      licenca: limpar(meta.LicenseShortName?.value) || "Ver página do arquivo",
      licencaUrl: meta.LicenseUrl?.value || "",
      url: info.thumburl?.split("?")[0] || info.url,
      largura: info.thumbwidth || info.width,
      altura: info.thumbheight || info.height,
      pagina: info.descriptionurl,
    };
  }
  return mapa;
}

await fs.mkdir(DEST, { recursive: true });
const titulos = IMAGENS.filter((i) => i.tipo === "commons").map((i) => i.titulo);
const meta = await metadadosCommons(titulos);
const creditos = [];
let ok = 0;
let falhas = 0;

for (const item of IMAGENS) {
  const ext = item.tipo === "commons" && /\.png$/i.test(item.titulo) ? ".png" : ".jpg";
  const arquivo = path.join(DEST, item.arquivo + ext);
  let url = item.url;
  let credito = item;

  if (item.tipo === "commons") {
    const m = meta[item.titulo];
    if (m?.url) {
      // Usa a miniatura pronta do Commons; o redimensionamento final é feito localmente.
      url = m.url.split("?")[0];
      credito = { ...item, ...m, url };
    } else {
      url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(item.titulo)}?width=${item.largura || 1600}`;
    }
  }

  try {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 15000) throw new Error("arquivo pequeno: " + buf.length);
    await fs.writeFile(arquivo, buf);
    creditos.push({
      arquivo: item.arquivo + ext,
      fonte: credito.fonte || "Wikimedia Commons",
      autor: credito.autor || "",
      licenca: credito.licenca || "",
      pagina: credito.pagina || credito.url || "",
      bytes: buf.length,
      largura: credito.largura || null,
      altura: credito.altura || null,
    });
    ok++;
    console.log("ok  ", item.arquivo + ext, (buf.length / 1024).toFixed(0) + "kB");
  } catch (e) {
    falhas++;
    console.log("ERRO", item.arquivo, String(e).slice(0, 120));
  }
}

await fs.writeFile(path.join(DEST, "creditos.json"), JSON.stringify(creditos, null, 2));
console.log(`\n${ok} imagens baixadas, ${falhas} falhas.`);
