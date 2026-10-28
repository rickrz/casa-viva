// Páginas de vitrine: home, listagens, produto, busca e ofertas.
import {
  loja,
  categorias,
  produtos,
  depoimentos,
} from "../data/catalogo.mjs";
import { vantagens, numeros, sobre, avaliacoes } from "../data/conteudo.mjs";
import {
  SITE,
  esc,
  brl,
  brlCurto,
  precoPix,
  textoParcelas,
  parcelas,
  desconto,
  estrelas,
  icone,
  layout,
  cardProduto,
  trilha,
  tituloSecao,
  seloDesconto,
  seloExtra,
} from "./ui.mjs";

const porSlug = new Map(produtos.map((p) => [p.slug, p]));
const catPorSlug = new Map(categorias.map((c) => [c.slug, c]));

export function produto(slug) {
  return porSlug.get(slug);
}

export function categoria(slug) {
  return catPorSlug.get(slug);
}

export function tituloSub(cat, sub) {
  if (cat.slug === "sofas") {
    const mapa = {
      "2-lugares": "Sofás de 2 lugares",
      "3-lugares": "Sofás de 3 lugares",
      retrateis: "Sofás retráteis e reclináveis",
      "de-canto": "Sofás de canto",
      poltronas: "Poltronas",
    };
    return mapa[sub.slug] || sub.nome;
  }
  if (cat.slug === "eletrodomesticos" && sub.slug === "maquinas-de-lavar") return "Máquinas de lavar";
  return sub.nome;
}

const IMG_AMBIENTE = {
  sofas: ["amb-sofas-1", "amb-sofas-2"],
  casa: ["amb-casa-1", "amb-casa-2"],
  eletrodomesticos: ["amb-eletro-1", "amb-eletro-2"],
};

function escolheAmbiente(p) {
  const lista = IMG_AMBIENTE[p.categoria] || IMG_AMBIENTE.casa;
  const soma = [...p.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  return lista[soma % lista.length];
}

// ---------------------------------------------------------------- HOME

export function paginaHome() {
  const maisVendidos = produtos.filter((p) => p.maisVendido && p.estoque > 0).slice(0, 8);
  const ofertas = [...produtos]
    .filter((p) => p.estoque > 0 && desconto(p) >= 18)
    .sort((a, b) => desconto(b) - desconto(a))
    .slice(0, 3);
  const novidades = produtos.filter((p) => p.lancamento && p.estoque > 0).slice(0, 4);
  const viena = porSlug.get("sofa-viena-3-lugares");

  const corpo = `
  <section class="hero">
    <div class="wrap hero__grade">
      <div class="hero__texto">
        <p class="eyebrow eyebrow--linha">Coleção 2026 · casa por inteiro</p>
        <h1 class="hero__titulo">Monte a casa<br><em>dos seus sonhos</em></h1>
        <p class="hero__lead">Sofás que abraçam, objetos que contam histórias e eletrodomésticos que devolvem tempo. Uma curadoria feita para deixar o dia a dia mais confortável — com preço honesto e entrega cuidadosa.</p>
        <div class="hero__acoes">
          <a class="btn btn--principal" href="#categorias">Explorar a coleção ${icone("seta")}</a>
          <a class="btn btn--fantasma" href="/ofertas/">Ver ofertas da semana</a>
        </div>
        <div class="hero__prova">
          <div class="hero__prova-rostos" aria-hidden="true">
            <span style="--foto:url('/assets/img/jogo-cama-percal-800.jpg')"></span>
            <span style="--foto:url('/assets/img/poltrona-nordica-800.jpg')"></span>
            <span style="--foto:url('/assets/img/mesa-centro-tulum-800.jpg')"></span>
          </div>
          <div>
            <div class="hero__prova-estrelas">${estrelas(4.9)}</div>
            <p><strong>+2.400 casas</strong> já vivem com a gente</p>
          </div>
          <span class="hero__prova-selo">${icone("troca")} 30 dias<br>para trocar</span>
        </div>
      </div>

      <div class="hero__midia">
        <figure class="hero__figura">
          <img src="/assets/img/hero-sala.jpg" srcset="/assets/img/hero-sala-800.jpg 800w, /assets/img/hero-sala.jpg 1600w" sizes="(max-width: 900px) 92vw, 54vw" alt="Casal relaxando em uma sala clara com sofá de tecido natural" width="1600" height="1067" fetchpriority="high" decoding="async">
          <figcaption class="hero__legenda">${icone("sparkle")} Sala montada com peças da coleção Viena</figcaption>
        </figure>
        <a class="hero__cartao" href="/produtos/${viena.slug}/">
          <img src="/assets/img/${viena.imagem}-800.jpg" alt="" width="120" height="120" loading="lazy">
          <span class="hero__cartao-texto">
            <span class="hero__cartao-rotulo">O mais amado</span>
            <strong>${esc(viena.nome)}</strong>
            <span>a partir de ${brl(viena.preco)}</span>
          </span>
          <span class="hero__cartao-seta">${icone("setaDiagonal")}</span>
        </a>
        <div class="hero__arco" aria-hidden="true"></div>
      </div>
    </div>
  </section>

  <section class="secao categorias" id="categorias" aria-labelledby="categorias-titulo">
    <div class="wrap">
      ${tituloSecao({
        eyebrow: "Explore por ambiente",
        titulo: "Cada canto pede um cuidado",
        texto: "Comece pela sala, pela cozinha ou pelos detalhes que fazem a casa ter a sua cara.",
        id: "categorias-titulo",
      })}
      <div class="categorias__grade">
        ${categorias
          .map((c, i) => {
            const qtd = produtos.filter((p) => p.categoria === c.slug).length;
            return `
            <a class="categoria-card${i === 0 ? " categoria-card--ampla" : ""}" href="/${c.slug}/">
              <div class="categoria-card__midia">
                <img src="/assets/img/${c.imagem}.jpg" srcset="/assets/img/${c.imagem}-800.jpg 800w, /assets/img/${c.imagem}.jpg 1600w" sizes="(max-width: 760px) 92vw, 33vw" alt="${esc(c.imagemAlt)}" width="800" height="1000" loading="lazy">
              </div>
              <div class="categoria-card__conteudo">
                <span class="categoria-card__qtd">${qtd} peças</span>
                <h3>${esc(c.nome)}</h3>
                <p>${esc(c.chamada)}</p>
                <span class="link-seta">Explorar ${icone("seta")}</span>
              </div>
            </a>`;
          })
          .join("")}
      </div>
    </div>
  </section>

  <section class="secao secao--clara" id="mais-vendidos" aria-labelledby="mais-vendidos-titulo">
    <div class="wrap">
      ${tituloSecao({
        eyebrow: "Escolhas de quem entende de casa",
        titulo: "Os mais amados",
        texto: "Peças que saem todos os dias e voltam para as avaliações com nota alta.",
        href: "/produtos/",
        rotuloLink: "Ver todos os produtos",
        id: "mais-vendidos-titulo",
      })}
      <div class="grade-produtos grade-produtos--4">
        ${maisVendidos.map((p) => cardProduto(p)).join("")}
      </div>
    </div>
  </section>

  <section class="secao" aria-labelledby="conforto-titulo">
    <div class="wrap editorial">
      <div class="editorial__midia">
        <img src="/assets/img/editorial-conforto.jpg" srcset="/assets/img/editorial-conforto-800.jpg 800w, /assets/img/editorial-conforto.jpg 1600w" sizes="(max-width: 900px) 92vw, 48vw" alt="Livros e almofadas sobre um sofá iluminado pelo sol" width="1600" height="1001" loading="lazy">
        <span class="editorial__carimbo">${icone("planta")}<span>Feito para<br>durar</span></span>
      </div>
      <div class="editorial__texto">
        <p class="eyebrow">Conforto de verdade</p>
        <h2 id="conforto-titulo">Conforto que você sente <em>desde o primeiro dia</em></h2>
        <p class="editorial__lead">A gente testa cada peça antes de colocar no site: senta, deita, abre, fecha, lava. Só entra no catálogo o que a gente colocaria na própria casa.</p>
        <ul class="lista-check">
          <li>${icone("check")} Estrutura de madeira com 5 anos de garantia</li>
          <li>${icone("check")} Tecidos resistentes ao uso diário e fáceis de limpar</li>
          <li>${icone("check")} Entrega agendada e montagem opcional</li>
        </ul>
        <div class="editorial__numeros">
          ${numeros
            .slice(0, 3)
            .map((n) => `<div><strong>${esc(n.valor)}</strong><span>${esc(n.rotulo)}</span></div>`)
            .join("")}
        </div>
        <a class="link-seta" href="/sobre/">Conheça a Casa Viva ${icone("seta")}</a>
      </div>
    </div>
  </section>

  <section class="secao ofertas" id="ofertas" aria-labelledby="ofertas-titulo">
    <div class="wrap">
      ${tituloSecao({
        eyebrow: "Só até domingo",
        titulo: "Ofertas da semana",
        texto: "Uma seleção de peças com preço especial para deixar a casa pronta.",
        href: "/ofertas/",
        rotuloLink: "Ver todas as ofertas",
        id: "ofertas-titulo",
      })}
      <div class="ofertas__grade">
        <a class="oferta-destaque" href="/ofertas/">
          <img src="/assets/img/faixa-ofertas.jpg" srcset="/assets/img/faixa-ofertas-800.jpg 800w, /assets/img/faixa-ofertas.jpg 1600w" sizes="(max-width: 900px) 92vw, 32vw" alt="Sala em tons de cinza e dourado com sofá amplo" width="1600" height="1041" loading="lazy">
          <div class="oferta-destaque__texto">
            <span class="oferta-destaque__selo">Até 25% off</span>
            <h3>Semana da sala pronta</h3>
            <p>Sofás, mesas e iluminação com desconto para renovar o ambiente inteiro.</p>
            <span class="btn btn--claro">Aproveitar ${icone("seta")}</span>
          </div>
        </a>
        ${ofertas
          .map(
            (p) => `
          <article class="cartao cartao--oferta" data-produto="${p.slug}" data-preco="${p.preco}" data-marca="${esc(p.marca)}" data-nota="${p.avaliacao}" data-estoque="${p.estoque}" data-lancamento="${p.lancamento ? 1 : 0}" data-vendido="${p.maisVendido ? 1 : 0}" data-nome="${esc(p.nome.toLowerCase())}" data-cores="${esc((p.variacoes?.opcoes || []).map((o) => o.nome).join("|"))}" data-materiais="${esc((p.materiais || []).join("|"))}">
            <div class="cartao__midia">
              <a href="/produtos/${p.slug}/" aria-label="${esc(p.nome)}">
                <img src="/assets/img/${p.imagem}-800.jpg" srcset="/assets/img/${p.imagem}-800.jpg 800w, /assets/img/${p.imagem}.jpg 1600w" sizes="(max-width: 560px) 46vw, 260px" alt="${esc(p.imagemAlt)}" width="800" height="1000" loading="lazy">
              </a>
              <div class="cartao__selos">${seloDesconto(p)}${seloExtra(p)}</div>
              <button class="cartao__favorito" type="button" data-favorito="${p.slug}" aria-label="Salvar ${esc(p.nome)} nos favoritos" aria-pressed="false">${icone("coracao")}</button>
              <button class="cartao__rapido" type="button" data-adicionar="${p.slug}" data-variacao="${esc(p.variacoes?.opcoes?.[0]?.nome || "")}">${icone("mais")} <span>Adicionar</span></button>
            </div>
            <div class="cartao__corpo">
              <p class="cartao__marca">${esc(p.marca)}</p>
              <h3 class="cartao__nome"><a href="/produtos/${p.slug}/">${esc(p.nome)}</a></h3>
              <div class="cartao__preco">${p.precoAntigo ? `<s>${brl(p.precoAntigo)}</s>` : ""}<strong>${brl(p.preco)}</strong></div>
              <p class="cartao__parcelas">${textoParcelas(p.preco)}</p>
              <p class="cartao__pix">${icone("pix")} ${brl(precoPix(p.preco))} no Pix</p>
            </div>
          </article>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section class="secao secao--clara" id="novidades" aria-labelledby="novidades-titulo">
    <div class="wrap">
      ${tituloSecao({
        eyebrow: "Acabou de chegar",
        titulo: "Novidades na casa",
        texto: "Peças novas, escolhidas a dedo para completar o que você já tem.",
        href: "/produtos/?ordenar=lancamentos",
        rotuloLink: "Ver lançamentos",
        id: "novidades-titulo",
      })}
      <div class="grade-produtos grade-produtos--4">
        ${novidades.map((p) => cardProduto(p)).join("")}
      </div>
    </div>
  </section>

  <section class="secao" aria-labelledby="vantagens-titulo">
    <div class="wrap">
      <div class="vantagens">
        ${vantagens
          .map(
            (v) => `
          <div class="vantagem">
            <span class="vantagem__icone">${icone(v.icone)}</span>
            <h3>${esc(v.titulo)}</h3>
            <p>${esc(v.texto)}</p>
          </div>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section class="secao depoimentos" aria-labelledby="depoimentos-titulo">
    <div class="wrap">
      ${tituloSecao({
        eyebrow: "Quem já mora com a gente",
        titulo: "Casas reais, histórias reais",
        texto: "Avaliações de quem comprou, recebeu e continua por aqui.",
        href: "/produtos/",
        rotuloLink: "Ver produtos avaliados",
        id: "depoimentos-titulo",
      })}
      <div class="depoimentos__grade">
        ${depoimentos
          .map(
            (d) => `
          <figure class="depoimento">
            <div class="depoimento__topo">${estrelas(d.nota, null, "lg")}<span class="depoimento__verificado">${icone("check")} Compra verificada</span></div>
            <blockquote>“${esc(d.texto)}”</blockquote>
            <figcaption>
              <span class="depoimento__avatar">${esc(d.nome.charAt(0))}</span>
              <span><strong>${esc(d.nome)}</strong><small>${esc(d.cidade)} · ${esc(d.compra)}</small></span>
            </figcaption>
          </figure>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section class="chamada-final">
    <div class="wrap chamada-final__interno">
      <p class="eyebrow eyebrow--claro">Sua casa, seu jeito</p>
      <h2>A casa toda,<br><em>do jeito que você sempre quis.</em></h2>
      <div class="chamada-final__acoes">
        <a class="btn btn--claro" href="/sofas/">Começar pela sala ${icone("seta")}</a>
        <a class="btn btn--contorno-claro" href="/contato/">Falar com um consultor</a>
      </div>
    </div>
    <div class="chamada-final__marca" aria-hidden="true"></div>
  </section>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: loja.nomeCompleto,
    slogan: loja.slogan,
    description: loja.descricao,
    url: SITE,
    image: `${SITE}/assets/img/hero-sala.jpg`,
    logo: `${SITE}/assets/favicon.svg`,
    telephone: "+55 11 4000-0000",
    email: loja.email,
    priceRange: "R$ 129 – R$ 4.490",
    currenciesAccepted: "BRL",
    paymentAccepted: "Pix, cartão de crédito, boleto",
    openingHours: "Mo-Fr 09:00-18:00, Sa 09:00-13:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. das Nações, 1200",
      addressLocality: "São Paulo",
      addressRegion: "SP",
      postalCode: "02000-000",
      addressCountry: "BR",
    },
    sameAs: loja.redes.map((r) => r.url),
    aggregateRating: { "@type": "AggregateRating", ratingValue: 4.9, reviewCount: 2412 },
  };

  return layout({
    titulo: "Casa Viva — Monte a casa dos seus sonhos",
    descricao:
      "Sofás, decoração e eletrodomésticos com curadoria, preço honesto e entrega cuidadosa. Conforto que você sente desde o primeiro dia. Frete grátis acima de R$ 2.990 e 5% off no Pix.",
    corpo,
    caminho: "/",
    imagem: "hero-sala",
    imagemAlt: "Sala clara com sofá de tecido natural e casal relaxando",
    jsonLd,
    ativo: "",
    classe: "pagina-home",
  });
}

// ---------------------------------------------------------------- LISTAGEM

function nomeListagem(ctx) {
  if (ctx.tipo === "ofertas") return "Ofertas da semana";
  if (ctx.tipo === "todos") return "Todos os produtos";
  if (ctx.sub) return tituloSub(ctx.categoria, ctx.sub);
  return ctx.categoria.nome;
}

function filtrosHtml(lista) {
  const marcas = [...new Set(lista.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const materiais = [...new Set(lista.flatMap((p) => p.materiais || []))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const cores = new Map();
  for (const p of lista) {
    for (const o of p.variacoes?.opcoes || []) {
      if (o.hex && !["110V", "220V"].includes(o.nome)) cores.set(o.nome, o.hex);
    }
  }
  const minimo = Math.min(...lista.map((p) => p.preco));
  const maximo = Math.max(...lista.map((p) => p.preco));

  return `
  <aside class="filtros" data-filtros-painel aria-label="Filtros de produtos">
    <div class="filtros__topo">
      <h2>Filtrar</h2>
      <button class="icone-btn filtros__fechar" type="button" data-fechar-filtros aria-label="Fechar filtros">${icone("fechar")}</button>
    </div>
    <form class="filtros__form" data-filtros>
      <fieldset class="filtro">
        <legend>Preço</legend>
        <div class="filtro__faixa">
          <label>De <input type="number" name="min" inputmode="numeric" placeholder="${brlCurto(minimo).replace("R$", "").trim()}" min="0" step="10"></label>
          <span>até</span>
          <label>Até <input type="number" name="max" inputmode="numeric" placeholder="${brlCurto(maximo).replace("R$", "").trim()}" min="0" step="10"></label>
        </div>
        <div class="filtro__atalhos">
          <button type="button" data-faixa="0-500">Até R$ 500</button>
          <button type="button" data-faixa="500-1500">R$ 500–1.500</button>
          <button type="button" data-faixa="1500-3000">R$ 1.500–3.000</button>
          <button type="button" data-faixa="3000-99999">Acima de R$ 3.000</button>
        </div>
      </fieldset>

      <fieldset class="filtro">
        <legend>Marca</legend>
        <div class="filtro__opcoes">
          ${marcas
            .map(
              (m) => `<label class="check"><input type="checkbox" name="marca" value="${esc(m)}"><span>${esc(m)}</span></label>`
            )
            .join("")}
        </div>
      </fieldset>

      <fieldset class="filtro">
        <legend>Cor</legend>
        <div class="filtro__cores">
          ${[...cores.entries()]
            .map(
              ([nome, hex]) => `<label class="cor-check" title="${esc(nome)}"><input type="checkbox" name="cor" value="${esc(nome)}"><span class="cor-check__ponto" style="--cor:${hex}"></span><span class="cor-check__nome">${esc(nome)}</span></label>`
            )
            .join("")}
        </div>
      </fieldset>

      <fieldset class="filtro">
        <legend>Material</legend>
        <div class="filtro__opcoes">
          ${materiais
            .map(
              (m) => `<label class="check"><input type="checkbox" name="material" value="${esc(m)}"><span>${esc(m)}</span></label>`
            )
            .join("")}
        </div>
      </fieldset>

      <fieldset class="filtro">
        <legend>Avaliação</legend>
        <div class="filtro__opcoes">
          <label class="check"><input type="radio" name="nota" value="4.5"><span>${estrelas(4.5)} 4,5 ou mais</span></label>
          <label class="check"><input type="radio" name="nota" value="4"><span>${estrelas(4)} 4 ou mais</span></label>
        </div>
      </fieldset>

      <fieldset class="filtro">
        <legend>Disponibilidade</legend>
        <label class="check check--switch"><input type="checkbox" name="disponivel"><span>Só produtos disponíveis</span></label>
      </fieldset>

      <div class="filtros__acoes">
        <button class="btn btn--principal btn--bloco" type="button" data-fechar-filtros>Aplicar filtros</button>
        <button class="btn btn--texto" type="button" data-limpar-filtros>Limpar filtros</button>
      </div>
    </form>
  </aside>`;
}

export function paginaListagem(ctx) {
  const { tipo, categoria: cat, sub } = ctx;
  let lista;
  let titulo;
  let descricao;
  let eyebrow;
  let caminho;
  let imagem;

  if (tipo === "ofertas") {
    lista = produtos.filter((p) => p.precoAntigo && p.precoAntigo > p.preco).sort((a, b) => desconto(b) - desconto(a));
    titulo = "Ofertas da semana";
    eyebrow = "Preço especial";
    descricao =
      "Peças selecionadas com desconto para renovar a casa sem estourar o orçamento. Ofertas válidas até domingo ou enquanto durarem os estoques.";
    caminho = "/ofertas/";
    imagem = "faixa-ofertas";
  } else if (tipo === "todos") {
    lista = [...produtos];
    titulo = "Todos os produtos";
    eyebrow = "Catálogo completo";
    descricao =
      "Sofás, mesas, iluminação, cama, mesa e banho, eletrodomésticos e eletroportáteis. Use os filtros para encontrar a peça certa para a sua casa.";
    caminho = "/produtos/";
    imagem = "cat-sofas";
  } else if (sub) {
    lista = produtos.filter((p) => p.categoria === cat.slug && p.sub === sub.slug);
    titulo = tituloSub(cat, sub);
    eyebrow = cat.nome;
    descricao = `${titulo} com curadoria da Casa Viva. Compare preço, tecido, medida e avaliação, e escolha com calma — o frete é grátis acima de ${brl(loja.freteGratisAcimaDe)}.`;
    caminho = `/${cat.slug}/${sub.slug}/`;
    imagem = cat.imagem;
  } else {
    lista = produtos.filter((p) => p.categoria === cat.slug);
    titulo = cat.nome;
    eyebrow = cat.nome;
    descricao = cat.descricao;
    caminho = `/${cat.slug}/`;
    imagem = cat.imagem;
  }

  const ordenada = [...lista].sort(
    (a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0) || (b.maisVendido ? 1 : 0) - (a.maisVendido ? 1 : 0)
  );

  const trilhaItens = [{ rotulo: "Início", href: "/" }];
  if (cat && tipo === "categoria") trilhaItens.push({ rotulo: cat.nome, href: `/${cat.slug}/` });
  if (cat && sub) {
    trilhaItens.push({ rotulo: cat.nome, href: `/${cat.slug}/` });
    trilhaItens.push({ rotulo: titulo });
  }
  if (!cat) trilhaItens.push({ rotulo: titulo });

  const descricaoLonga =
    tipo === "ofertas"
      ? "Aproveite enquanto os estoques duram. Os preços já estão com desconto e o Pix tem mais 5% off. O frete é grátis em compras acima de R$ 2.990 e você pode parcelar em até 12x sem juros."
      : cat
        ? `${cat.descricao} Todos os produtos têm garantia, nota fiscal e podem ser parcelados em até 12x sem juros. Precisa de ajuda para escolher? Fale com a gente no WhatsApp.`
        : "Compre com segurança: nota fiscal, garantia de fábrica, troca em até 30 dias e atendimento humano pelo WhatsApp.";

  const subChips = cat
    ? `<div class="chips-categoria">
        <a class="chip${!sub ? " chip--ativo" : ""}" href="/${cat.slug}/">Tudo</a>
        ${cat.subs.map((s) => `<a class="chip${sub?.slug === s.slug ? " chip--ativo" : ""}" href="/${cat.slug}/${s.slug}/">${esc(s.nome)}</a>`).join("")}
      </div>`
    : "";

  const corpo = `
  <section class="cabeca-listagem">
    <div class="wrap">
      ${trilha(trilhaItens)}
      <div class="cabeca-listagem__texto">
        <div>
          <p class="eyebrow">${esc(eyebrow)}</p>
          <h1>${esc(titulo)}</h1>
          <p class="cabeca-listagem__desc">${esc(descricao)}</p>
        </div>
        ${
          cat
            ? `<a class="cabeca-listagem__midia" href="/${cat.slug}/" tabindex="-1" aria-hidden="true">
                <img src="/assets/img/${cat.imagem}-800.jpg" alt="" width="800" height="600" loading="lazy">
              </a>`
            : `<div class="cabeca-listagem__contagem"><strong>${lista.length}</strong><span>produtos<br>selecionados</span></div>`
        }
      </div>
      ${subChips}
    </div>
  </section>

  <section class="listagem">
    <div class="wrap listagem__grade">
      ${filtrosHtml(lista)}
      <div class="listagem__principal">
        <div class="listagem__barra">
          <p class="listagem__contagem" data-contagem>${lista.length} ${lista.length === 1 ? "produto" : "produtos"}</p>
          <div class="listagem__controles">
            <button class="btn btn--filtro" type="button" data-abrir-filtros>${icone("filtro")} Filtros <span class="contador-filtros" data-filtros-ativos hidden>0</span></button>
            <label class="ordenar">Ordenar por
              <select data-ordenar aria-label="Ordenar produtos">
                <option value="relevancia">Mais relevantes</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
                <option value="vendidos">Mais vendidos</option>
                <option value="lancamentos">Lançamentos</option>
                <option value="avaliacao">Melhor avaliados</option>
              </select>
            </label>
          </div>
        </div>
        <div class="chips-ativos" data-chips hidden aria-label="Filtros aplicados"></div>
        <div class="grade-produtos grade-produtos--3" data-grade>
          ${ordenada.map((p) => cardProduto(p)).join("")}
        </div>
        <div class="vazio" data-vazio hidden>
          ${icone("busca")}
          <h2>Nenhum produto com esses filtros</h2>
          <p>Tente remover um filtro ou ampliar a faixa de preço. Se preferir, a gente ajuda pelo WhatsApp.</p>
          <button class="btn btn--principal" type="button" data-limpar-filtros>Limpar filtros</button>
        </div>
        <div class="listagem__seo">
          <h2>Sobre ${esc(titulo.toLowerCase())}</h2>
          <p>${esc(descricaoLonga)}</p>
          <ul class="lista-check lista-check--seo">
            <li>${icone("check")} Produtos com nota fiscal e garantia</li>
            <li>${icone("check")} Frete grátis acima de ${brl(loja.freteGratisAcimaDe)}</li>
            <li>${icone("check")} Troca em até 30 dias</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  <div class="filtros__fundo" data-fundo-filtros hidden></div>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: titulo,
    description: descricao,
    numberOfItems: lista.length,
    itemListElement: ordenada.slice(0, 12).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.nome,
      url: `${SITE}/produtos/${p.slug}/`,
    })),
  };

  return layout({
    titulo: tipo === "todos" ? "Todos os produtos" : titulo,
    descricao,
    corpo,
    caminho,
    imagem,
    jsonLd,
    ativo: cat ? cat.slug : "",
    classe: "pagina-listagem",
  });
}

// ---------------------------------------------------------------- PRODUTO

function especificacoesHtml(p) {
  return `
    <dl class="especificacoes">
      ${p.especificacoes.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
    </dl>`;
}

function avaliacoesHtml(p) {
  const soma = [...p.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  const lista = [0, 1, 2].map((i) => avaliacoes[(soma + i * 2) % avaliacoes.length]);
  const barras = [5, 4, 3, 2, 1]
    .map((n) => {
      const pct = n === 5 ? 86 : n === 4 ? 10 : n === 3 ? 3 : n === 2 ? 1 : 0;
      return `<div class="barra-nota"><span>${n}★</span><div class="barra-nota__trilho"><span style="width:${pct}%"></span></div><span>${pct}%</span></div>`;
    })
    .join("");
  return `
  <section class="secao avaliacoes" id="avaliacoes" aria-labelledby="avaliacoes-titulo">
    <div class="wrap">
      <div class="avaliacoes__topo">
        <div>
          <p class="eyebrow">Opinião de quem comprou</p>
          <h2 id="avaliacoes-titulo">Avaliações</h2>
        </div>
        <button class="btn btn--fantasma" type="button" data-abrir-avaliacao>Escrever avaliação</button>
      </div>
      <div class="avaliacoes__grade">
        <div class="avaliacao-resumo">
          <strong class="avaliacao-resumo__nota">${p.avaliacao.toFixed(1).replace(".", ",")}</strong>
          ${estrelas(p.avaliacao, null, "lg")}
          <p>${p.totalAvaliacoes} avaliações verificadas</p>
          <div class="avaliacao-resumo__barras">${barras}</div>
          <p class="avaliacao-resumo__nota-rodape">${icone("check")} Só quem comprou pode avaliar</p>
        </div>
        <div class="avaliacoes__lista" data-avaliacoes-lista>
          ${lista
            .map(
              (a) => `
            <article class="avaliacao">
              <div class="avaliacao__topo">
                <div>
                  <strong>${esc(a.nome)}</strong>
                  <span class="avaliacao__local">${esc(a.cidade)} · ${esc(a.data)}</span>
                </div>
                ${estrelas(a.nota)}
              </div>
              <h3>${esc(a.titulo)}</h3>
              <p>${esc(a.texto)}</p>
              <div class="avaliacao__rodape"><span>${icone("check")} Compra verificada</span><span>${a.util} pessoas acharam útil</span></div>
            </article>`
            )
            .join("")}
        </div>
      </div>
      <form class="avaliacao-form" data-avaliacao-form data-produto="${p.slug}" hidden>
        <h3>Avaliar ${esc(p.nome)}</h3>
        <div class="campo"><label for="avaliacao-nome">Seu nome</label><input id="avaliacao-nome" name="nome" required maxlength="60" placeholder="Como quer aparecer"></div>
        <div class="campo"><label for="avaliacao-nota">Sua nota</label>
          <select id="avaliacao-nota" name="nota" required><option value="5">5 estrelas — excelente</option><option value="4">4 estrelas — muito bom</option><option value="3">3 estrelas — bom</option><option value="2">2 estrelas — regular</option><option value="1">1 estrela — ruim</option></select>
        </div>
        <div class="campo"><label for="avaliacao-texto">Sua opinião</label><textarea id="avaliacao-texto" name="texto" rows="4" required maxlength="600" placeholder="O que você achou do produto?"></textarea></div>
        <div class="avaliacao-form__acoes"><button class="btn btn--principal" type="submit">Enviar avaliação</button><button class="btn btn--texto" type="button" data-fechar-avaliacao>Cancelar</button></div>
      </form>
    </div>
  </section>`;
}

export function paginaProduto(p) {
  const cat = catPorSlug.get(p.categoria);
  const relacionado = produtos.filter((x) => x.categoria === p.categoria && x.slug !== p.slug).slice(0, 4);
  const ambiente = escolheAmbiente(p);
  const fotos = [
    { src: p.imagem, rotulo: "Foto principal", alt: p.imagemAlt },
    { src: ambiente, rotulo: "No ambiente", alt: `Sugestão de ambiente com ${p.nome.toLowerCase()}` },
    { src: IMG_AMBIENTE[p.categoria][(IMG_AMBIENTE[p.categoria].indexOf(ambiente) + 1) % 2], rotulo: "Inspiração", alt: "Ambiente inspirador em tons neutros" },
  ];
  const esgotado = p.estoque === 0;
  const opcoes = p.variacoes?.opcoes || [];
  const url = `${SITE}/produtos/${p.slug}/`;

  const corpo = `
  <div class="wrap">
    ${trilha([
      { rotulo: "Início", href: "/" },
      { rotulo: cat.nome, href: `/${cat.slug}/` },
      { rotulo: p.nome },
    ])}
  </div>

  <section class="produto">
    <div class="wrap produto__grade">
      <div class="produto__galeria" data-galeria>
        <div class="galeria__miniaturas" role="tablist" aria-label="Fotos do produto">
          ${fotos
            .map(
              (f, i) => `
            <button class="galeria__mini${i === 0 ? " ativo" : ""}" type="button" role="tab" aria-selected="${i === 0}" aria-label="${esc(f.rotulo)}" data-foto="${i}">
              <img src="/assets/img/${f.src}-800.jpg" alt="" width="80" height="100" loading="lazy">
            </button>`
            )
            .join("")}
        </div>
        <div class="galeria__palco">
          <button class="galeria__zoom" type="button" data-abrir-lightbox aria-label="Ampliar foto do produto">
            <img src="/assets/img/${fotos[0].src}.jpg" srcset="/assets/img/${fotos[0].src}-800.jpg 800w, /assets/img/${fotos[0].src}.jpg 1600w" sizes="(max-width: 900px) 92vw, 46vw" alt="${esc(fotos[0].alt)}" width="1600" height="1600" fetchpriority="high" decoding="async" data-imagem-principal>
            <span class="galeria__dica">${icone("zoom")} Passe o mouse para ampliar</span>
          </button>
          <div class="galeria__selos">${seloDesconto(p)}${seloExtra(p)}</div>
          <button class="galeria__favorito" type="button" data-favorito="${p.slug}" aria-pressed="false" aria-label="Salvar ${esc(p.nome)} nos favoritos">${icone("coracao")}<span>Salvar</span></button>
        </div>
        <p class="galeria__legenda" data-legenda>${esc(fotos[0].rotulo)} · ${esc(p.imagemAlt)}</p>
      </div>

      <div class="produto__info">
        <div class="produto__cabeca">
          <p class="produto__marca">${esc(p.marca)}</p>
          <h1>${esc(p.nome)}</h1>
          <div class="produto__avaliacao">
            ${estrelas(p.avaliacao, p.totalAvaliacoes)}
            <a href="#avaliacoes">Ver avaliações</a>
            <span class="produto__codigo">Cód. ${esc(p.slug.slice(-6).toUpperCase())}</span>
          </div>
        </div>

        <div class="produto__compra">
          <div class="produto__preco">
            ${p.precoAntigo ? `<span class="produto__de">de ${brl(p.precoAntigo)} por</span>` : ""}
            <strong class="produto__por">${brl(p.preco)}</strong>
            <span class="produto__pix">${icone("pix")} <strong>${brl(precoPix(p.preco))}</strong> no Pix <span class="tag-off">5% off</span></span>
            <span class="produto__parcelas">${textoParcelas(p.preco)}</span>
          </div>

          ${
            opcoes.length
              ? `<div class="produto__variacao">
                  <div class="produto__variacao-topo">
                    <span class="produto__rotulo">${esc(p.variacoes.rotulo)}: <strong data-variacao-nome>${esc(opcoes[0].nome)}</strong></span>
                  </div>
                  <div class="opcoes" role="radiogroup" aria-label="${esc(p.variacoes.rotulo)}">
                    ${opcoes
                      .map(
                        (o, i) => `
                      <button class="opcao${i === 0 ? " ativo" : ""}" type="button" role="radio" aria-checked="${i === 0}" data-opcao="${esc(o.nome)}" title="${esc(o.nome)}">
                        ${o.hex ? `<span class="opcao__cor" style="--cor:${o.hex}"></span>` : ""}
                        <span>${esc(o.nome)}</span>
                      </button>`
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }

          <div class="produto__acoes">
            <div class="quantidade" data-quantidade>
              <button type="button" data-qtd-menos aria-label="Diminuir quantidade">${icone("menos")}</button>
              <label class="sr-only" for="qtd-produto">Quantidade</label>
              <input id="qtd-produto" type="number" name="qtd" value="1" min="1" max="${Math.max(1, p.estoque)}" inputmode="numeric" data-qtd>
              <button type="button" data-qtd-mais aria-label="Aumentar quantidade">${icone("mais")}</button>
            </div>
            ${
              esgotado
                ? `<button class="btn btn--principal btn--grande" type="button" data-aviso-estoque="${p.slug}">Avise-me quando chegar</button>`
                : `<button class="btn btn--principal btn--grande" type="button" data-comprar="${p.slug}">Adicionar ao carrinho ${icone("sacola")}</button>`
            }
          </div>
          ${
            esgotado
              ? `<p class="produto__estoque produto__estoque--fora">${icone("relogio")} Produto temporariamente esgotado. Deixe seu e-mail para ser avisado.</p>`
              : `<p class="produto__estoque">${icone("check")} Em estoque — ${p.estoque} ${p.estoque === 1 ? "unidade" : "unidades"} · enviamos em até 2 dias úteis</p>`
          }

          <div class="produto__cep">
            <label for="cep-produto">${icone("caminhao")} Calcular frete e prazo</label>
            <form class="cep-form" data-cep-form data-contexto="produto">
              <input id="cep-produto" name="cep" type="text" inputmode="numeric" placeholder="Seu CEP" maxlength="9" autocomplete="postal-code" aria-describedby="cep-produto-ajuda">
              <button class="btn btn--contorno" type="submit">Calcular</button>
            </form>
            <p class="cep-ajuda" id="cep-produto-ajuda">Ex.: 01310-100 · <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noopener">não sei meu CEP</a></p>
            <div class="cep-resultado" data-cep-resultado aria-live="polite"></div>
          </div>

          <ul class="produto__beneficios">
            <li>${icone("caminhao")}<span><strong>Frete grátis</strong> em compras acima de ${brl(loja.freteGratisAcimaDe)}</span></li>
            <li>${icone("cartao")}<span><strong>${loja.parcelasSemJuros}x sem juros</strong> no cartão</span></li>
            <li>${icone("troca")}<span><strong>30 dias</strong> para trocar sem burocracia</span></li>
            <li>${icone("seguranca")}<span><strong>Compra protegida</strong> e nota fiscal</span></li>
          </ul>
        </div>

        <div class="produto__detalhes">
          <details open>
            <summary>Descrição</summary>
            <div class="detalhes__conteudo">
              ${p.descricao.map((par) => `<p>${esc(par)}</p>`).join("")}
              <ul class="lista-check">${p.destaques.map((d) => `<li>${icone("check")} ${esc(d)}</li>`).join("")}</ul>
            </div>
          </details>
          <details>
            <summary>Medidas</summary>
            <div class="detalhes__conteudo">
              <dl class="medidas">
                <div><dt>Largura</dt><dd>${esc(p.medidas.largura)}</dd></div>
                <div><dt>Profundidade</dt><dd>${esc(p.medidas.profundidade)}</dd></div>
                <div><dt>Altura</dt><dd>${esc(p.medidas.altura)}</dd></div>
                <div><dt>Peso</dt><dd>${esc(p.medidas.peso)}</dd></div>
              </dl>
              <p class="detalhes__nota">${icone("relogio")} Meça a porta e o elevador antes da compra. Em caso de dúvida, fale com a gente.</p>
            </div>
          </details>
          <details>
            <summary>Especificações técnicas</summary>
            <div class="detalhes__conteudo">${especificacoesHtml(p)}</div>
          </details>
          <details>
            <summary>Entrega e montagem</summary>
            <div class="detalhes__conteudo">
              <p>Entregamos em todo o Brasil com transportadoras selecionadas. O prazo é calculado pelo CEP no carrinho. Móveis grandes têm entrega agendada por telefone e a montagem é opcional para a região metropolitana de São Paulo.</p>
              <p>${icone("pacote")} Embalagem reforçada, com proteção de quinas e filme contra umidade.</p>
            </div>
          </details>
          <details>
            <summary>Garantia e troca</summary>
            <div class="detalhes__conteudo">
              <p>Garantia conforme a ficha técnica e garantia legal de 30 dias do CDC. Você tem até 7 dias para desistir da compra e até 30 dias para trocar por outro produto, sem uso e na embalagem original.</p>
              <p><a href="/trocas-e-devolucoes/">Ver a política completa de trocas e devoluções</a></p>
            </div>
          </details>
        </div>
      </div>
    </div>
  </section>

  ${avaliacoesHtml(p)}

  <section class="secao secao--clara" aria-labelledby="relacionados-titulo">
    <div class="wrap">
      ${tituloSecao({
        eyebrow: "Combina com esta peça",
        titulo: "Quem viu, também gostou",
        href: `${cat.slug}/`,
        rotuloLink: `Ver todos em ${cat.nome}`,
        id: "relacionados-titulo",
      })}
      <div class="grade-produtos grade-produtos--4">${relacionado.map((x) => cardProduto(x)).join("")}</div>
    </div>
  </section>

  <div class="barra-produto" data-barra-produto hidden>
    <div class="barra-produto__info">
      <img src="/assets/img/${p.imagem}-800.jpg" alt="" width="56" height="56">
      <div><strong>${esc(p.nome)}</strong><span>${brl(p.preco)}</span></div>
    </div>
    <button class="btn btn--principal" type="button" data-comprar="${p.slug}"${esgotado ? " disabled" : ""}>${esgotado ? "Esgotado" : "Adicionar ao carrinho"}</button>
  </div>

  <dialog class="lightbox" data-lightbox aria-label="Fotos de ${esc(p.nome)}">
    <button class="lightbox__fechar icone-btn" type="button" data-fechar-lightbox aria-label="Fechar">${icone("fechar")}</button>
    <button class="lightbox__nav lightbox__nav--esq icone-btn" type="button" data-lightbox-anterior aria-label="Foto anterior">${icone("setaEsq")}</button>
    <img src="/assets/img/${fotos[0].src}.jpg" alt="${esc(fotos[0].alt)}" data-lightbox-img>
    <button class="lightbox__nav lightbox__nav--dir icone-btn" type="button" data-lightbox-proxima aria-label="Próxima foto">${icone("seta")}</button>
    <p class="lightbox__legenda" data-lightbox-legenda>${esc(fotos[0].alt)}</p>
  </dialog>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nome,
    image: fotos.map((f) => `${SITE}/assets/img/${f.src}.jpg`),
    description: p.descricao.join(" "),
    sku: p.slug,
    mpn: p.slug.slice(-8),
    brand: { "@type": "Brand", name: p.marca },
    category: cat.nome,
    url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.avaliacao,
      reviewCount: p.totalAvaliacoes,
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Mariana L." },
        reviewRating: { "@type": "Rating", ratingValue: 5 },
        reviewBody:
          "Chegou antes do prazo, muito bem embalado. A cor é exatamente a da foto e o acabamento surpreendeu.",
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Rafael M." },
        reviewRating: { "@type": "Rating", ratingValue: 5 },
        reviewBody: "Qualidade que dá para sentir. Montei sozinho e ficou firme, sem nenhum barulho.",
      },
    ],
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      price: (p.preco / 100).toFixed(2),
      priceValidUntil: "2026-12-31",
      availability: esgotado ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "19.90", currency: "BRL" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 12, unitCode: "DAY" },
        },
      },
    },
  };

  return layout({
    titulo: `${p.nome} — ${cat.nome}`,
    descricao: `${p.descricao[0].slice(0, 155).trim()}…`,
    corpo,
    caminho: `/produtos/${p.slug}/`,
    imagem: p.imagem,
    imagemAlt: p.imagemAlt,
    jsonLd,
    ativo: p.categoria,
    semNewsletter: true,
    classe: "pagina-produto",
  });
}

// ---------------------------------------------------------------- BUSCA

export function paginaBusca() {
  const populares = ["Sofá retrátil", "Mesa de centro", "Air fryer", "Geladeira", "Jogo de cama", "Luminária"];
  const corpo = `
  <section class="busca-pagina">
    <div class="wrap">
      ${trilha([{ rotulo: "Início", href: "/" }, { rotulo: "Busca" }])}
      <div class="busca-pagina__cabeca">
        <p class="eyebrow">Encontre na Casa Viva</p>
        <h1 data-busca-titulo>O que você procura?</h1>
        <form class="busca busca--grande" role="search" action="busca/" method="get" data-busca-pagina>
          ${icone("busca", "busca__icone")}
          <label class="sr-only" for="busca-pagina-input">Buscar produtos</label>
          <input id="busca-pagina-input" type="search" name="q" placeholder="Sofá, air fryer, jogo de cama…" data-busca-pagina-input autocomplete="off">
          <button class="btn btn--principal" type="submit">Buscar</button>
        </form>
        <div class="busca-pagina__populares">
          <span>Mais buscados:</span>
          ${populares.map((t) => `<button type="button" data-busca-sugerida="${esc(t)}">${esc(t)}</button>`).join("")}
        </div>
      </div>
      <div class="busca-pagina__resultado">
        <div class="listagem__barra">
          <p class="listagem__contagem" data-busca-contagem>Digite para buscar</p>
          <label class="ordenar">Ordenar por
            <select data-ordenar aria-label="Ordenar resultados">
              <option value="relevancia">Mais relevantes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
              <option value="avaliacao">Melhor avaliados</option>
            </select>
          </label>
        </div>
        <h2 class="sr-only">Resultados da busca</h2>
        <div class="grade-produtos grade-produtos--4" data-busca-grade></div>
        <div class="vazio" data-busca-vazio hidden>
          ${icone("busca")}
          <h2>Nada encontrado por aqui</h2>
          <p>Tente outra palavra ou navegue pelas categorias. A gente também pode ajudar pelo WhatsApp.</p>
          <div class="vazio__acoes">
            <a class="btn btn--principal" href="/sofas/">Ver sofás</a>
            <a class="btn btn--fantasma" href="/produtos/">Ver catálogo</a>
          </div>
        </div>
        <div class="busca-pagina__sugestoes" data-busca-vazia>
          <h2>Explore por categoria</h2>
          <div class="categorias__lista">
            ${categorias
              .map(
                (c) => `<a class="categoria-pill" href="/${c.slug}/"><img src="/assets/img/${c.imagem}-800.jpg" alt="" width="80" height="80" loading="lazy"><span><strong>${esc(c.nome)}</strong><small>${esc(c.chamada)}</small></span>${icone("seta")}</a>`
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  </section>`;

  return layout({
    titulo: "Busca",
    descricao: "Encontre sofás, móveis, decoração e eletrodomésticos na Casa Viva.",
    corpo,
    caminho: "/busca/",
    imagem: "cat-sofas",
    noindex: true,
    semNewsletter: true,
    classe: "pagina-busca",
  });
}

export const TODOS_PRODUTOS = produtos;
export { porSlug };
