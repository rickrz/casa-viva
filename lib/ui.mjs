// Componentes e utilitários de renderização usados pelo gerador.
import { loja, categorias } from "../data/catalogo.mjs";
import { newsletter, institucional } from "../data/conteudo.mjs";

export const SITE = "https://www.casaviva.com.br";

// Invalida o cache de CSS e JS a cada build, sem renomear arquivos.
export const VERSAO_ASSETS = Date.now().toString(36);

export function esc(valor = "") {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function brl(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function brlCurto(centavos) {
  const valor = centavos / 100;
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function precoPix(centavos) {
  return Math.round(centavos * (1 - loja.descontoPix));
}

export function parcelas(centavos) {
  const n = Math.max(1, Math.min(loja.parcelasSemJuros, Math.floor(centavos / 2000)));
  return { n, valor: Math.round(centavos / n) };
}

export function textoParcelas(centavos) {
  const { n, valor } = parcelas(centavos);
  if (n <= 1) return `ou ${brl(valor)} à vista`;
  return `ou ${n}x de ${brl(valor)} sem juros`;
}

export function desconto(p) {
  if (!p.precoAntigo || p.precoAntigo <= p.preco) return 0;
  return Math.round((1 - p.preco / p.precoAntigo) * 100);
}

export function slugId(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function estrelas(nota, total = null, tamanho = "sm") {
  const arred = Math.round(nota * 2) / 2;
  const cheias = Math.floor(arred);
  let html = `<span class="estrelas estrelas--${tamanho}" role="img" aria-label="Avaliação ${nota.toFixed(1)} de 5">`;
  for (let i = 1; i <= 5; i++) {
    const classe = i <= cheias ? "estrela estrela--cheia" : "estrela";
    html += `<svg class="${classe}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.95 6.05 6.65.93-4.83 4.66 1.18 6.61L12 17.6l-5.95 3.15 1.18-6.61L2.4 9.48l6.65-.93L12 2.5Z" fill="currentColor" stroke="none"/></svg>`;
  }
  html += `<span class="estrelas__nota">${nota.toFixed(1).replace(".", ",")}</span>`;
  if (total !== null) html += `<span class="estrelas__total">(${total})</span>`;
  html += "</span>";
  return html;
}

export const ICONES = {
  busca: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.7-4.7"/>',
  sacola: '<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  coracao:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.7 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  usuario: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  fechar: '<path d="m6 6 12 12M18 6 6 18"/>',
  seta: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  setaEsq: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  setaDireita: '<path d="m9 6 6 6-6 6"/>',
  setaBaixo: '<path d="m6 9 6 6 6-6"/>',
  caminhao:
    '<path d="M1 4h14v12H1z"/><path d="M15 8h4l4 4v4h-8V8Z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>',
  cartao: '<rect x="1.5" y="4.5" width="21" height="15" rx="2.5"/><path d="M1.5 10h21"/>',
  troca:
    '<path d="M21 4v6h-6"/><path d="M3 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.7-3.2L21 10"/><path d="M20.5 15a9 9 0 0 1-14.7 3.2L3 14"/>',
  atendimento:
    '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z"/>',
  cadeado:
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  medalha: '<circle cx="12" cy="8" r="6.5"/><path d="m8.5 13.5-1 8L12 19l4.5 2.5-1-8"/>',
  whatsapp:
    '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M9.2 8.6c.2-.4.4-.5.7-.5h.4c.2 0 .4.1.5.4l.5 1.2c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3 0 .6a6 6 0 0 0 2.6 2.3c.2.1.4.1.6-.1l.5-.6c.2-.2.4-.3.6-.2l1.2.6c.2.1.3.3.3.5 0 .3-.1 1.1-.6 1.5-.5.4-1.3.6-2.1.3a8 8 0 0 1-2.8-1.7 8.4 8.4 0 0 1-1.7-2.5c-.3-.7-.1-1.6.4-2.3Z" fill="currentColor" stroke="none"/>',
  email: '<rect x="2" y="4.5" width="20" height="15" rx="2.5"/><path d="m22 6-10 7L2 6"/>',
  telefone:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  local: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/>',
  instagram:
    '<rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
  facebook:
    '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z"/>',
  pinterest:
    '<circle cx="12" cy="12" r="9.5"/><path d="M10 18.5 12.6 7"/><path d="M9.5 12.3c-.4-1.4.3-3.2 2.2-3.6 1.7-.3 3.2.6 3.4 2.2.3 1.9-.7 4.1-2.3 4.1-1 0-1.8-.8-1.5-2.3"/>',
  menos: '<path d="M5 12h14"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  lixeira:
    '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6"/><path d="M10 11v5M14 11v5"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>',
  filtro: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  ajustes:
    '<path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>',
  zoom:
    '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.7-4.7M8 11h6M11 8v6"/>',
  relogio: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.8 2.2"/>',
  pacote:
    '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
  pix: '<path d="m12 2.5 4.2 4.2-4.2 4.2-4.2-4.2L12 2.5ZM12 13.1l4.2 4.2L12 21.5l-4.2-4.2 4.2-4.2ZM2.5 12l4.2-4.2 4.2 4.2-4.2 4.2L2.5 12ZM13.1 12l4.2-4.2 4.2 4.2-4.2 4.2L13.1 12Z"/>',
  boleto: '<path d="M3 5v14M6.5 5v14M10 5v14M14 5v10M17.5 5v14M21 5v14"/>',
  boletoDocumento:
    '<path d="M5 2.5h9l5 5v14H5z"/><path d="M14 2.5v5h5M8.5 12v4M11.5 12v4M14.5 12v4"/>',
  nota: '<path d="M5 2.5h14v19l-3-2-2 2-2-2-2 2-2-2-3 2v-19Z"/><path d="M9 8h6M9 12h6"/>',
  presente: '<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M12 8v13M3 12h18"/><path d="M12 8C9 8 7.5 6.7 7.5 5A2.5 2.5 0 0 1 12 3.8 2.5 2.5 0 0 1 16.5 5C16.5 6.7 15 8 12 8Z"/>',
  planta:
    '<path d="M12 21V9"/><path d="M12 13C7 13 4 10 4 5c5 0 8 3 8 8ZM12 10c0-4 3-7 8-7 0 5-3 7-8 7Z"/><path d="M7 21h10"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  lua: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z"/>',
  casa: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/>',
  sofa: '<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2 12a2 2 0 0 1 4 0v3h12v-3a2 2 0 0 1 4 0v6H2v-6Z"/><path d="M5 18v2M19 18v2"/>',
  coracaoCheio:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.7 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" fill="currentColor"/>',
  setaDiagonal: '<path d="M7 17 17 7M9 7h8v8"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/>',
  seguranca: '<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
  sparkle: '<path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3Z"/>',
};

export function icone(nome, classe = "") {
  const path = ICONES[nome] || ICONES.sparkle;
  return `<svg class="icone ${classe}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}

export const LOGO = (rel = "", claro = false) => `
  <span class="marca__simbolo" aria-hidden="true">
    <svg viewBox="0 0 40 40" fill="none">
      <path d="M7 33V17.5C7 10.6 12.6 5 19.5 5S32 10.6 32 17.5V33" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M15 33V23.5C15 20.5 17.5 18 20.5 18S26 20.5 26 23.5V33" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
      <path d="M4 33h32" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  </span>
  <span class="marca__texto">
    <span class="marca__nome">Casa Viva</span>
    <span class="marca__tag">móveis · casa · eletro</span>
  </span>`;

function linkNav(rel, href, rotulo, ativo) {
  const classe = ativo === href.replace(/^\//, "").replace(/\/$/, "") ? " class=\"ativo\"" : "";
  return `<a href="${rel}${href.replace(/^\//, "")}"${classe}>${rotulo}</a>`;
}

function megaMenu(rel, cat, ativo) {
  const produtos = cat.subs
    .map((s) => `<a href="${rel}${cat.slug}/${s.slug}/">${esc(s.nome)}</a>`)
    .join("");
  return `
    <div class="nav__item nav__item--menu" data-menu>
      <a href="${rel}${cat.slug}/" class="nav__link${ativo === cat.slug ? " ativo" : ""}" aria-expanded="false">
        ${esc(cat.nome)}
        ${icone("setaBaixo", "nav__seta")}
      </a>
      <div class="megamenu">
        <div class="megamenu__col">
          <p class="megamenu__eyebrow">Categorias</p>
          ${produtos}
          <a class="megamenu__todos" href="${rel}${cat.slug}/">Ver tudo em ${esc(cat.nome)} ${icone("seta")}</a>
        </div>
        <a class="megamenu__destaque" href="${rel}${cat.slug}/" tabindex="-1">
          <img src="${rel}assets/img/${cat.imagem}-800.jpg" alt="${esc(cat.imagemAlt)}" width="800" height="1000" loading="lazy">
          <span>${esc(cat.chamada)}</span>
        </a>
      </div>
    </div>`;
}

function cabecalho(rel, ativo) {
  const categoriasNav = categorias.map((c) => megaMenu(rel, c, ativo)).join("");
  return `
  <div class="aviso-topo">
    <div class="wrap aviso-topo__interno">
      <p class="aviso-topo__msg">${icone("caminhao")} Frete grátis acima de ${brl(loja.freteGratisAcimaDe)} <span class="aviso-topo__sep">·</span> <strong>5% off no Pix</strong> <span class="aviso-topo__sep">·</span> até ${loja.parcelasSemJuros}x sem juros</p>
      <a class="aviso-topo__link" href="${rel}rastreamento/">Rastrear pedido ${icone("seta")}</a>
    </div>
  </div>
  <header class="cabecalho" data-cabecalho>
    <div class="wrap cabecalho__interno">
      <button class="icone-btn cabecalho__menu" type="button" data-abrir-menu aria-label="Abrir menu" aria-controls="menu-mobile" aria-expanded="false">
        ${icone("menu")}
      </button>

      <a class="marca" href="${rel}">
        ${LOGO(rel)}
      </a>

      <form class="busca" role="search" action="${rel}busca/" method="get" data-busca-form autocomplete="off">
        ${icone("busca", "busca__icone")}
        <label class="sr-only" for="busca-topo">Buscar produtos</label>
        <input id="busca-topo" type="search" name="q" placeholder="Buscar sofás, mesas, air fryers…" data-busca-input aria-autocomplete="list" aria-controls="sugestoes-busca" autocomplete="off">
        <button type="submit" class="busca__enviar" aria-label="Buscar">${icone("seta")}</button>
        <div class="sugestoes" id="sugestoes-busca" data-sugestoes hidden></div>
      </form>

      <div class="cabecalho__acoes">
        <a class="icone-btn cabecalho__acao" href="${rel}favoritos/">
          ${icone("coracao")}
          <span class="icone-btn__rotulo">Favoritos</span>
          <span class="contador" data-contador-favoritos hidden>0</span>
        </a>
        <a class="icone-btn cabecalho__acao" href="${rel}conta/">
          ${icone("usuario")}
          <span class="icone-btn__rotulo">Minha conta</span>
        </a>
        <a class="icone-btn cabecalho__acao icone-btn--sacola" href="${rel}carrinho/">
          ${icone("sacola")}
          <span class="icone-btn__rotulo">Carrinho</span>
          <span class="contador" data-contador-carrinho hidden>0</span>
        </a>
        <button class="icone-btn cabecalho__busca-mobile" type="button" data-abrir-menu aria-label="Abrir busca e menu">
          ${icone("busca")}
        </button>
      </div>
    </div>

    <nav class="nav" aria-label="Categorias">
      <div class="wrap nav__interno">
        ${categoriasNav}
        <a href="${rel}#ofertas" class="nav__link nav__link--oferta">Ofertas ${icone("sparkle")}</a>
        <a href="${rel}#novidades" class="nav__link">Novidades</a>
        <span class="nav__divisor" aria-hidden="true"></span>
        <a href="${rel}sobre/" class="nav__link nav__link--leve">Sobre</a>
        <a href="${rel}faq/" class="nav__link nav__link--leve">Ajuda</a>
        <a href="${rel}contato/" class="nav__link nav__link--leve">Contato</a>
      </div>
    </nav>
  </header>

  <div class="menu-mobile" id="menu-mobile" data-menu-mobile hidden>
    <div class="menu-mobile__painel" role="dialog" aria-modal="true" aria-label="Menu de navegação">
      <div class="menu-mobile__topo">
        <a class="marca marca--escura" href="${rel}">${LOGO(rel)}</a>
        <button class="icone-btn" type="button" data-fechar-menu aria-label="Fechar menu">${icone("fechar")}</button>
      </div>
      <form class="busca busca--mobile" role="search" action="${rel}busca/" method="get">
        ${icone("busca", "busca__icone")}
        <label class="sr-only" for="busca-menu">Buscar produtos</label>
        <input id="busca-menu" type="search" name="q" placeholder="O que você procura?">
        <button type="submit" class="busca__enviar" aria-label="Buscar">${icone("seta")}</button>
      </form>
      <nav class="menu-mobile__nav" aria-label="Menu principal">
        ${categorias
          .map(
            (c) => `
          <div class="menu-mobile__grupo">
            <a class="menu-mobile__titulo" href="${rel}${c.slug}/">${esc(c.nome)} ${icone("seta")}</a>
            <div class="menu-mobile__subs">${c.subs.map((s) => `<a href="${rel}${c.slug}/${s.slug}/">${esc(s.nome)}</a>`).join("")}</div>
          </div>`
          )
          .join("")}
        <div class="menu-mobile__grupo">
          <a class="menu-mobile__titulo" href="${rel}#ofertas">Ofertas ${icone("sparkle")}</a>
          <div class="menu-mobile__subs">
            <a href="${rel}conta/">Minha conta</a>
            <a href="${rel}favoritos/">Favoritos</a>
            <a href="${rel}rastreamento/">Rastrear pedido</a>
            <a href="${rel}faq/">Perguntas frequentes</a>
            <a href="${rel}trocas-e-devolucoes/">Trocas e devoluções</a>
            <a href="${rel}sobre/">Sobre a Casa Viva</a>
            <a href="${rel}contato/">Contato</a>
          </div>
        </div>
      </nav>
      <div class="menu-mobile__rodape">
        <a class="btn btn--principal btn--bloco" href="${rel}carrinho/">${icone("sacola")} Ver meu carrinho</a>
        <p>${icone("whatsapp")} <a href="https://wa.me/${loja.whatsapp}">${loja.whatsappExibicao}</a> · ${loja.horario}</p>
      </div>
    </div>
    <button class="menu-mobile__fundo" type="button" data-fechar-menu tabindex="-1" aria-label="Fechar menu"></button>
  </div>`;
}

function newsletterBloco() {
  return `
  <section class="newsletter" aria-labelledby="newsletter-titulo">
    <div class="wrap newsletter__interno">
      <div class="newsletter__texto">
        <p class="eyebrow">Carta da Casa Viva</p>
        <h2 id="newsletter-titulo">${esc(newsletter.titulo)}</h2>
        <p>${esc(newsletter.texto)}</p>
      </div>
      <form class="newsletter__form" data-newsletter novalidate>
        <label class="sr-only" for="newsletter-email">Seu e-mail</label>
        <div class="campo-com-botao">
          <input id="newsletter-email" name="email" type="email" placeholder="Seu melhor e-mail" required autocomplete="email">
          <button class="btn btn--principal" type="submit">Quero receber ${icone("seta")}</button>
        </div>
        <p class="form__nota">Ao assinar, você concorda com a nossa <a href="/privacidade/">política de privacidade</a>. Cancele quando quiser.</p>
        <p class="form__sucesso" data-newsletter-sucesso hidden role="status">${esc(newsletter.sucesso)}</p>
      </form>
    </div>
  </section>`;
}

function rodape(rel) {
  return `
  <footer class="rodape">
    <div class="wrap rodape__grade">
      <div class="rodape__marca">
        <a class="marca marca--clara" href="${rel}">${LOGO(rel, true)}</a>
        <p class="rodape__chamada">${esc(loja.slogan)}.</p>
        <p class="rodape__contato">${icone("whatsapp")} <a href="https://wa.me/${loja.whatsapp}">${loja.whatsappExibicao}</a></p>
        <p class="rodape__contato">${icone("email")} <a href="mailto:${loja.email}">${loja.email}</a></p>
        <p class="rodape__contato">${icone("local")} ${esc(loja.endereco)}</p>
        <div class="redes">
          ${loja.redes
            .map(
              (r) =>
                `<a href="${r.url}" target="_blank" rel="noopener" aria-label="${r.nome} da Casa Viva">${icone(r.nome.toLowerCase())}</a>`
            )
            .join("")}
        </div>
      </div>
      <nav class="rodape__col" aria-label="Comprar">
        <h3>Comprar</h3>
        ${categorias.map((c) => `<a href="${rel}${c.slug}/">${esc(c.nome)}</a>`).join("")}
        <a href="${rel}#ofertas">Ofertas da semana</a>
        <a href="${rel}#novidades">Novidades</a>
      </nav>
      <nav class="rodape__col" aria-label="Ajuda">
        <h3>Ajuda</h3>
        <a href="${rel}rastreamento/">Rastrear pedido</a>
        <a href="${rel}faq/">Perguntas frequentes</a>
        <a href="${rel}trocas-e-devolucoes/">Trocas e devoluções</a>
        <a href="${rel}contato/">Fale com a gente</a>
        <a href="${rel}conta/">Minha conta</a>
        <a href="${rel}favoritos/">Meus favoritos</a>
      </nav>
      <nav class="rodape__col" aria-label="Institucional">
        <h3>A Casa Viva</h3>
        ${institucional.links.map((l) => `<a href="${rel}${l.href.replace(/^\//, "")}">${esc(l.rotulo)}</a>`).join("")}
        <a href="${rel}creditos/">Créditos das fotos</a>
        <a href="${rel}admin/">Área do lojista</a>
      </nav>
    </div>

    <div class="wrap rodape__pagamentos">
      <div class="pagamentos" aria-label="Formas de pagamento">
        <span class="pagamentos__rotulo">Pagamento seguro</span>
        <span class="pagamento">Visa</span>
        <span class="pagamento">Mastercard</span>
        <span class="pagamento">Elo</span>
        <span class="pagamento">Amex</span>
        <span class="pagamento pagamento--pix">${icone("pix")} Pix</span>
        <span class="pagamento">${icone("boleto")} Boleto</span>
      </div>
      <div class="selos-rodape">
        <span>${icone("cadeado")} Site seguro</span>
        <span>${icone("medalha")} Loja verificada</span>
        <span>${icone("troca")} Troca fácil</span>
      </div>
    </div>

    <div class="rodape__base">
      <div class="wrap rodape__base-interno">
        <p>© ${loja.ano} ${esc(loja.nomeCompleto)} · CNPJ ${loja.cnpj} · Todos os direitos reservados.</p>
        <p class="rodape__min">Preços e condições válidos para este site. Fotos ilustrativas. Frete e prazos calculados pelo CEP.</p>
      </div>
    </div>
  </footer>
  <a class="whatsapp-flutuante" href="https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(
    "Olá! Vim pelo site da Casa Viva e preciso de uma ajuda."
  )}" target="_blank" rel="noopener" aria-label="Falar com a Casa Viva no WhatsApp">
    ${icone("whatsapp")}
    <span class="whatsapp-flutuante__texto">Fale com a gente</span>
  </a>
  <div class="toasts" data-toasts aria-live="polite" aria-atomic="false"></div>`;
}

export function layout({
  titulo,
  descricao,
  corpo,
  caminho = "/",
  rel = "/",
  classe = "",
  imagem = "hero-sala",
  imagemAlt = "Sala clara com sofá aconchegante",
  jsonLd = null,
  ativo = "",
  semNewsletter = false,
  noindex = false,
  scripts = [],
}) {
  const tituloCompleto = titulo.includes("Casa Viva") ? titulo : `${titulo} | Casa Viva`;
  const url = SITE + caminho;
  const ogImagem = `${SITE}/assets/img/${imagem}.jpg`;
  const ogTipo = caminho.startsWith("/produtos/") ? "product" : "website";

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(tituloCompleto)}</title>
  <meta name="description" content="${esc(descricao)}">
  <meta name="theme-color" content="#12655C">
  <meta name="color-scheme" content="light">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="${noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}">
  <meta property="og:type" content="${ogTipo}">
  <meta property="og:site_name" content="Casa Viva">
  <meta property="og:title" content="${esc(tituloCompleto)}">
  <meta property="og:description" content="${esc(descricao)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImagem}">
  <meta property="og:image:alt" content="${esc(imagemAlt)}">
  <meta property="og:locale" content="pt_BR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="format-detection" content="telephone=no">
  <link rel="icon" href="${rel}assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${rel}assets/img/hero-sala-800.jpg">
  <link rel="preload" href="${rel}assets/fontes/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${rel}assets/fontes/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${rel}assets/css/fontes.css?v=${VERSAO_ASSETS}">
  <link rel="stylesheet" href="${rel}assets/css/estilos.css?v=${VERSAO_ASSETS}">
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
</head>
<body class="${classe}">
  <a class="pular" href="#conteudo">Pular para o conteúdo</a>
  ${cabecalho(rel, ativo)}
  <main id="conteudo">
    ${corpo}
  </main>
  ${semNewsletter ? "" : newsletterBloco()}
  ${rodape(rel)}
  <script src="${rel}assets/js/catalogo.js?v=${VERSAO_ASSETS}" defer></script>
  <script src="${rel}assets/js/loja.js?v=${VERSAO_ASSETS}" defer></script>
  ${scripts.map((s) => `<script src="${rel}${s}${s.indexOf("?") > -1 ? "&" : "?"}v=${VERSAO_ASSETS}" defer></script>`).join("\n  ")}
</body>
</html>`;
}

export function layoutAdmin({ titulo, corpo, rel = "/" }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titulo)} | Casa Viva</title>
  <meta name="description" content="Painel demonstrativo da Casa Viva para acompanhar pedidos, preços e estoque.">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#211E1A">
  <link rel="icon" href="${rel}assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="${rel}assets/fontes/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${rel}assets/css/fontes.css?v=${VERSAO_ASSETS}">
  <link rel="stylesheet" href="${rel}assets/css/estilos.css?v=${VERSAO_ASSETS}">
</head>
<body class="admin">
  ${corpo}
  <div class="toasts" data-toasts aria-live="polite"></div>
  <script src="${rel}assets/js/catalogo.js?v=${VERSAO_ASSETS}"></script>
  <script src="${rel}assets/js/admin.js?v=${VERSAO_ASSETS}"></script>
</body>
</html>`;
}

export function seloDesconto(p) {
  const d = desconto(p);
  if (p.estoque === 0) return `<span class="selo selo--esgotado">Esgotado</span>`;
  if (d >= 12) return `<span class="selo selo--desconto">-${d}%</span>`;
  if (p.lancamento) return `<span class="selo selo--novo">Novidade</span>`;
  if (p.maisVendido) return `<span class="selo selo--top">Mais vendido</span>`;
  return "";
}

export function seloExtra(p) {
  if (p.estoque === 0) return "";
  if (p.lancamento && desconto(p) >= 12) return `<span class="selo selo--novo">Novidade</span>`;
  if (p.maisVendido && desconto(p) >= 12) return `<span class="selo selo--top">Mais vendido</span>`;
  return "";
}

export function cardProduto(p, rel = "/", { prioridade = false, compacto = false } = {}) {
  const imagem = `${rel}assets/img/${p.imagem}`;
  const badge = seloDesconto(p);
  const extra = seloExtra(p);
  const v = p.variacoes?.opcoes?.[0];
  const esgotado = p.estoque === 0;
  return `
  <article class="cartao${compacto ? " cartao--compacto" : ""}${esgotado ? " cartao--esgotado" : ""}"
    data-produto="${p.slug}"
    data-preco="${p.preco}"
    data-marca="${esc(p.marca)}"
    data-nota="${p.avaliacao}"
    data-estoque="${p.estoque}"
    data-lancamento="${p.lancamento ? 1 : 0}"
    data-vendido="${p.maisVendido ? 1 : 0}"
    data-nome="${esc(p.nome.toLowerCase())}"
    data-cores="${esc((p.variacoes?.opcoes || []).filter((o) => o.hex && !["110V", "220V"].includes(o.nome)).map((o) => o.nome).join("|"))}"
    data-materiais="${esc((p.materiais || []).join("|"))}">
    <div class="cartao__midia">
      <a href="${rel}produtos/${p.slug}/" aria-label="${esc(p.nome)}">
        <img src="${imagem}-800.jpg" srcset="${imagem}-800.jpg 800w, ${imagem}.jpg 1600w"
          sizes="(max-width: 560px) 46vw, (max-width: 960px) 30vw, 290px"
          alt="${esc(p.imagemAlt)}" width="800" height="1000"
          ${prioridade ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      </a>
      <div class="cartao__selos">${badge}${extra}</div>
      <button class="cartao__favorito" type="button" data-favorito="${p.slug}" aria-label="Salvar ${esc(p.nome)} nos favoritos" aria-pressed="false">
        ${icone("coracao")}
      </button>
      ${
        esgotado
          ? `<span class="cartao__aviso">Avise-me quando chegar</span>`
          : `<button class="cartao__rapido" type="button" data-adicionar="${p.slug}" data-variacao="${esc(v?.nome || "")}">
              ${icone("mais")} <span>Adicionar</span>
            </button>`
      }
    </div>
    <div class="cartao__corpo">
      <p class="cartao__marca">${esc(p.marca)}</p>
      <h3 class="cartao__nome"><a href="${rel}produtos/${p.slug}/">${esc(p.nome)}</a></h3>
      <div class="cartao__avaliacao">${estrelas(p.avaliacao, p.totalAvaliacoes)}</div>
      <div class="cartao__preco">
        ${p.precoAntigo ? `<s>${brl(p.precoAntigo)}</s>` : ""}
        <strong>${brl(p.preco)}</strong>
      </div>
      <p class="cartao__parcelas">${textoParcelas(p.preco)}</p>
      <p class="cartao__pix">${icone("pix")} ${brl(precoPix(p.preco))} no Pix</p>
      <div class="cartao__cores">
        ${(p.variacoes?.opcoes || [])
          .filter((o) => o.hex && !["110V", "220V"].includes(o.nome))
          .slice(0, 4)
          .map((o) => `<span class="cor-ponto" style="--cor:${o.hex}" title="${esc(o.nome)}"><span class="sr-only">${esc(o.nome)}</span></span>`)
          .join("")}
      </div>
    </div>
  </article>`;
}

export function trilha(itens, rel = "/") {
  return `<nav class="trilha" aria-label="Você está em">
    <ol>
      ${itens
        .map((i, idx) =>
          i.href && idx < itens.length - 1
            ? `<li><a href="${rel}${i.href.replace(/^\//, "")}">${esc(i.rotulo)}</a></li>`
            : `<li aria-current="page">${esc(i.rotulo)}</li>`
        )
        .join("")}
    </ol>
  </nav>`;
}

export function tituloSecao({ eyebrow, titulo, texto = "", href = "", rotuloLink = "Ver tudo", id = "" }) {
  return `
  <div class="secao__topo">
    <div>
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}
      <h2 ${id ? `id="${id}"` : ""}>${esc(titulo)}</h2>
      ${texto ? `<p class="secao__texto">${esc(texto)}</p>` : ""}
    </div>
    ${href ? `<a class="link-seta" href="${href}">${esc(rotuloLink)} ${icone("seta")}</a>` : ""}
  </div>`;
}

export function seletorEstrelas(nota) {
  return `<div class="avaliacao-resumo__estrelas">${estrelas(nota, null, "lg")}</div>`;
}
