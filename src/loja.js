/* ============================================================
   Casa Viva — comportamento da loja (sem dependências)
   Carrinho, favoritos, busca, filtros, produto, checkout,
   conta, rastreio, formulários e painel de conteúdo.
   ============================================================ */
(function () {
  "use strict";

  var DADOS = window.CATALOGO;
  if (!DADOS || !Array.isArray(DADOS.produtos)) return;

  var loja = DADOS.loja;
  var categorias = DADOS.categorias || [];
  var produtos = DADOS.produtos;
  var cupons = DADOS.cupons || [];
  var fretes = DADOS.fretes || [];

  var CHAVES = {
    carrinho: "cv:carrinho",
    favoritos: "cv:favoritos",
    conta: "cv:conta",
    pedidos: "cv:pedidos",
    cupom: "cv:cupom",
    frete: "cv:frete",
    avaliacoes: "cv:avaliacoes",
    newsletter: "cv:newsletter",
    adminProdutos: "cv:admin:produtos",
    adminSessao: "cv:admin:logado",
  };

  var porSlug = new Map(produtos.map(function (p) { return [p.slug, p]; }));
  var catPorSlug = new Map(categorias.map(function (c) { return [c.slug, c]; }));
  var fmtMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  // ---------------------------------------------------------------- utilidades

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function esc(valor) {
    return String(valor == null ? "" : valor).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function brl(centavos) {
    return fmtMoeda.format((Number(centavos) || 0) / 100);
  }

  function precoPix(centavos) {
    return Math.round(centavos * (1 - loja.descontoPix));
  }

  function parcelas(centavos) {
    var n = Math.max(1, Math.min(loja.parcelasSemJuros, Math.floor(centavos / 2000)));
    return { n: n, valor: Math.round(centavos / n) };
  }

  function textoParcelas(centavos) {
    var p = parcelas(centavos);
    if (p.n <= 1) return "ou " + brl(p.valor) + " à vista";
    return "ou " + p.n + "x de " + brl(p.valor) + " sem juros";
  }

  function desconto(p) {
    if (!p.precoAntigo || p.precoAntigo <= p.preco) return 0;
    return Math.round((1 - p.preco / p.precoAntigo) * 100);
  }

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function somenteDigitos(valor) { return String(valor || "").replace(/\D/g, ""); }

  function centavosDeReais(valor) {
    var s = String(valor == null ? "" : valor).trim();
    if (!s) return null;
    s = s.replace(/[^\d,.-]/g, "");
    if (s.indexOf(",") > -1) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      var partes = s.split(".");
      if (partes.length > 2) s = partes.join("");
      else if (partes.length === 2 && partes[1].length !== 2) s = partes.join("");
    }
    var n = parseFloat(s);
    return isFinite(n) ? Math.round(n * 100) : null;
  }

  function numero(valor, padrao) {
    var n = Number(valor);
    return isFinite(n) ? n : padrao;
  }

  function ler(chave, padrao) {
    try {
      var bruto = localStorage.getItem(chave);
      if (!bruto) return padrao;
      var valor = JSON.parse(bruto);
      return valor == null ? padrao : valor;
    } catch (erro) {
      return padrao;
    }
  }

  function salvar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (erro) { /* modo privado */ }
  }

  function apagar(chave) {
    try { localStorage.removeItem(chave); } catch (erro) { /* modo privado */ }
  }

  function dinheiroData(data) {
    try {
      return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (erro) { return ""; }
  }

  function primeiroNome(nome) {
    return String(nome || "cliente").trim().split(/\s+/)[0] || "cliente";
  }

  // ---------------------------------------------------------------- ícones

  var CAMINHOS = {
    busca: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.7-4.7"/>',
    sacola: '<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    coracao: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.7 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
    usuario: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    fechar: '<path d="m6 6 12 12M18 6 6 18"/>',
    seta: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    setaEsq: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    setaBaixo: '<path d="m6 9 6 6 6-6"/>',
    caminhao: '<path d="M1 4h14v12H1z"/><path d="M15 8h4l4 4v4h-8V8Z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>',
    cartao: '<rect x="1.5" y="4.5" width="21" height="15" rx="2.5"/><path d="M1.5 10h21"/>',
    troca: '<path d="M21 4v6h-6"/><path d="M3 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.7-3.2L21 10"/><path d="M20.5 15a9 9 0 0 1-14.7 3.2L3 14"/>',
    cadeado: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    whatsapp: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M9.2 8.6c.2-.4.4-.5.7-.5h.4c.2 0 .4.1.5.4l.5 1.2c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3 0 .6a6 6 0 0 0 2.6 2.3c.2.1.4.1.6-.1l.5-.6c.2-.2.4-.3.6-.2l1.2.6c.2.1.3.3.3.5 0 .3-.1 1.1-.6 1.5-.5.4-1.3.6-2.1.3a8 8 0 0 1-2.8-1.7 8.4 8.4 0 0 1-1.7-2.5c-.3-.7-.1-1.6.4-2.3Z" fill="currentColor" stroke="none"/>',
    email: '<rect x="2" y="4.5" width="20" height="15" rx="2.5"/><path d="m22 6-10 7L2 6"/>',
    local: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/>',
    menos: '<path d="M5 12h14"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    lixeira: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6"/><path d="M10 11v5M14 11v5"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    filtro: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    zoom: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.7-4.7M8 11h6M11 8v6"/>',
    relogio: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.8 2.2"/>',
    pacote: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    pix: '<path d="m12 2.5 4.2 4.2-4.2 4.2-4.2-4.2L12 2.5ZM12 13.1l4.2 4.2L12 21.5l-4.2-4.2 4.2-4.2ZM2.5 12l4.2-4.2 4.2 4.2-4.2 4.2L2.5 12ZM13.1 12l4.2-4.2 4.2 4.2-4.2 4.2L13.1 12Z"/>',
    boleto: '<path d="M3 5v14M6.5 5v14M10 5v14M14 5v10M17.5 5v14M21 5v14"/>',
    boletoDocumento: '<path d="M5 2.5h9l5 5v14H5z"/><path d="M14 2.5v5h5M8.5 12v4M11.5 12v4M14.5 12v4"/>',
    presente: '<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M12 8v13M3 12h18"/><path d="M12 8C9 8 7.5 6.7 7.5 5A2.5 2.5 0 0 1 12 3.8 2.5 2.5 0 0 1 16.5 5C16.5 6.7 15 8 12 8Z"/>',
    medalha: '<circle cx="12" cy="8" r="6.5"/><path d="m8.5 13.5-1 8L12 19l4.5 2.5-1-8"/>',
    seguranca: '<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
    sparkle: '<path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3Z"/>',
    ajustes: '<path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>',
  };

  function icone(nome, classe) {
    var caminho = CAMINHOS[nome] || CAMINHOS.sparkle;
    return '<svg class="icone ' + (classe || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + caminho + "</svg>";
  }

  function estrelas(nota, total, tamanho) {
    var valor = Number(nota) || 0;
    var cheias = Math.floor(Math.round(valor * 2) / 2);
    var html = '<span class="estrelas estrelas--' + (tamanho || "sm") + '" role="img" aria-label="Avaliação ' + valor.toFixed(1) + ' de 5">';
    for (var i = 1; i <= 5; i++) {
      html += '<svg class="' + (i <= cheias ? "estrela estrela--cheia" : "estrela") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.95 6.05 6.65.93-4.83 4.66 1.18 6.61L12 17.6l-5.95 3.15 1.18-6.61L2.4 9.48l6.65-.93L12 2.5Z" fill="currentColor" stroke="none"/></svg>';
    }
    html += '<span class="estrelas__nota">' + valor.toFixed(1).replace(".", ",") + "</span>";
    if (total != null) html += '<span class="estrelas__total">(' + total + ")</span>";
    return html + "</span>";
  }

  // ---------------------------------------------------------------- catálogo com ajustes do painel

  function lerOverrides() {
    var dados = ler(CHAVES.adminProdutos, {});
    return dados && typeof dados === "object" ? dados : {};
  }

  function produtoAtual(slug) {
    var base = porSlug.get(slug);
    if (!base) return null;
    var ajuste = lerOverrides()[slug];
    if (!ajuste) return base;
    var p = Object.assign({}, base);
    if (ajuste.preco != null) p.preco = Number(ajuste.preco);
    if (ajuste.estoque != null) p.estoque = Number(ajuste.estoque);
    return p;
  }

  function categoriaDoProduto(p) {
    var cat = catPorSlug.get(p.categoria);
    return cat ? cat.nome : "";
  }

  function subDoProduto(p) {
    if (!p.sub) return "";
    var cat = catPorSlug.get(p.categoria);
    var sub = cat && cat.subs ? cat.subs.find(function (s) { return s.slug === p.sub; }) : null;
    return sub ? sub.nome : p.sub;
  }

  function seloDesconto(p) {
    var d = desconto(p);
    if (p.estoque === 0) return '<span class="selo selo--esgotado">Esgotado</span>';
    if (d >= 12) return '<span class="selo selo--desconto">-' + d + "%</span>";
    if (p.lancamento) return '<span class="selo selo--novo">Novidade</span>';
    if (p.maisVendido) return '<span class="selo selo--top">Mais vendido</span>';
    return "";
  }

  function seloExtra(p) {
    if (p.estoque === 0) return "";
    if (p.lancamento && desconto(p) >= 12) return '<span class="selo selo--novo">Novidade</span>';
    if (p.maisVendido && desconto(p) >= 12) return '<span class="selo selo--top">Mais vendido</span>';
    return "";
  }

  function cardProdutoHtml(base, opcoes) {
    var p = produtoAtual(base.slug) || base;
    var prioridade = opcoes && opcoes.prioridade;
    var esgotado = p.estoque === 0;
    var v = p.variacoes && p.variacoes.opcoes ? p.variacoes.opcoes[0] : null;
    var imagem = "/assets/img/" + p.imagem;
    var precoAntigo = p.precoAntigo && p.precoAntigo > p.preco ? "<s>" + brl(p.precoAntigo) + "</s>" : "";
    var cores = (p.variacoes && p.variacoes.opcoes ? p.variacoes.opcoes : [])
      .filter(function (o) { return o.hex && ["110V", "220V"].indexOf(o.nome) === -1; });
    return '\n  <article class="cartao' + (esgotado ? " cartao--esgotado" : "") + '"' +
      ' data-produto="' + esc(p.slug) + '"' +
      ' data-preco="' + p.preco + '"' +
      ' data-marca="' + esc(p.marca) + '"' +
      ' data-nota="' + p.avaliacao + '"' +
      ' data-estoque="' + p.estoque + '"' +
      ' data-lancamento="' + (p.lancamento ? 1 : 0) + '"' +
      ' data-vendido="' + (p.maisVendido ? 1 : 0) + '"' +
      ' data-nome="' + esc(String(p.nome).toLowerCase()) + '"' +
      ' data-cores="' + esc(cores.map(function (o) { return o.nome; }).join("|")) + '"' +
      ' data-materiais="' + esc((p.materiais || []).join("|")) + '">' +
      '    <div class="cartao__midia">' +
      '      <a href="/produtos/' + esc(p.slug) + '/" aria-label="' + esc(p.nome) + '">' +
      '        <img src="' + imagem + '-800.jpg" srcset="' + imagem + '-800.jpg 800w, ' + imagem + '.jpg 1600w"' +
      '          sizes="(max-width: 560px) 46vw, (max-width: 960px) 30vw, 290px"' +
      '          alt="' + esc(p.imagemAlt) + '" width="800" height="1000"' +
      (prioridade ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">' +
      "      </a>" +
      '      <div class="cartao__selos">' + seloDesconto(p) + seloExtra(p) + "</div>" +
      '      <button class="cartao__favorito" type="button" data-favorito="' + esc(p.slug) + '" aria-label="Salvar ' + esc(p.nome) + ' nos favoritos" aria-pressed="false">' + icone("coracao") + "</button>" +
      (esgotado
        ? '<span class="cartao__aviso">Avise-me quando chegar</span>'
        : '<button class="cartao__rapido" type="button" data-adicionar="' + esc(p.slug) + '" data-variacao="' + esc(v ? v.nome : "") + '">' + icone("mais") + " <span>Adicionar</span></button>") +
      "    </div>" +
      '    <div class="cartao__corpo">' +
      '      <p class="cartao__marca">' + esc(p.marca) + "</p>" +
      '      <h3 class="cartao__nome"><a href="/produtos/' + esc(p.slug) + '/">' + esc(p.nome) + "</a></h3>" +
      '      <div class="cartao__avaliacao">' + estrelas(p.avaliacao, p.totalAvaliacoes) + "</div>" +
      '      <div class="cartao__preco">' + precoAntigo + "<strong>" + brl(p.preco) + "</strong></div>" +
      '      <p class="cartao__parcelas">' + textoParcelas(p.preco) + "</p>" +
      '      <p class="cartao__pix">' + icone("pix") + " " + brl(precoPix(p.preco)) + " no Pix</p>" +
      '      <div class="cartao__cores">' +
      cores.slice(0, 4).map(function (o) {
        return '<span class="cor-ponto" style="--cor:' + o.hex + '" title="' + esc(o.nome) + '"><span class="sr-only">' + esc(o.nome) + "</span></span>";
      }).join("") +
      "      </div>" +
      "    </div>" +
      "  </article>";
  }

  // ---------------------------------------------------------------- estado do carrinho e favoritos

  function lerCarrinho() {
    var lista = ler(CHAVES.carrinho, []);
    if (!Array.isArray(lista)) return [];
    return lista.filter(function (item) {
      return item && porSlug.has(item.slug);
    }).map(function (item) {
      return {
        slug: item.slug,
        qtd: Math.max(1, Math.min(99, Math.floor(numero(item.qtd, 1)))),
        variacao: String(item.variacao || ""),
      };
    });
  }

  function totalItensCarrinho() {
    return lerCarrinho().reduce(function (soma, item) { return soma + item.qtd; }, 0);
  }

  function lerFavoritos() {
    var lista = ler(CHAVES.favoritos, []);
    if (!Array.isArray(lista)) return [];
    return lista.filter(function (slug, i) { return porSlug.has(slug) && lista.indexOf(slug) === i; });
  }

  function atualizarContadores() {
    var quantidade = totalItensCarrinho();
    qsa("[data-contador-carrinho]").forEach(function (el) {
      el.textContent = quantidade > 99 ? "99+" : String(quantidade);
      el.hidden = quantidade === 0;
    });
    var favoritos = lerFavoritos().length;
    qsa("[data-contador-favoritos]").forEach(function (el) {
      el.textContent = favoritos > 99 ? "99+" : String(favoritos);
      el.hidden = favoritos === 0;
    });
  }

  function sincronizarBotoesFavorito() {
    var favoritos = lerFavoritos();
    qsa("[data-favorito]").forEach(function (botao) {
      var ativo = favoritos.indexOf(botao.getAttribute("data-favorito")) > -1;
      botao.setAttribute("aria-pressed", ativo ? "true" : "false");
      if (botao.classList.contains("galeria__favorito")) {
        var rotulo = botao.querySelector("span");
        if (rotulo) rotulo.textContent = ativo ? "Salvo" : "Salvar";
      }
    });
  }

  var aoMudarFavoritos = null;

  function alternarFavorito(slug) {
    var favoritos = lerFavoritos();
    var indice = favoritos.indexOf(slug);
    var produto = produtoAtual(slug);
    var nome = produto ? produto.nome : "Produto";
    if (indice > -1) {
      favoritos.splice(indice, 1);
      toast("Removido dos favoritos", nome, { icone: "coracao" });
    } else {
      favoritos.push(slug);
      toast("Salvo nos favoritos", nome, { link: "/favoritos/", rotuloLink: "Ver favoritos" });
    }
    salvar(CHAVES.favoritos, favoritos);
    atualizarContadores();
    sincronizarBotoesFavorito();
    if (typeof aoMudarFavoritos === "function") aoMudarFavoritos();
  }

  function adicionarAoCarrinho(slug, variacao, quantidade) {
    var produto = produtoAtual(slug);
    if (!produto) return false;
    if (produto.estoque <= 0) {
      toast("Produto esgotado", "Fale com a gente para saber quando chegar.", { icone: "relogio" });
      return false;
    }
    var carrinho = lerCarrinho();
    var chave = slug + "::" + (variacao || "");
    var item = carrinho.find(function (i) { return i.slug + "::" + i.variacao === chave; });
    var qtd = Math.max(1, Math.floor(numero(quantidade, 1)));
    var limite = Math.max(1, produto.estoque);
    var anterior = item ? item.qtd : 0;
    var nova = Math.min(limite, anterior + qtd);
    if (item) item.qtd = nova;
    else carrinho.push({ slug: slug, qtd: Math.min(limite, qtd), variacao: variacao || "" });
    salvar(CHAVES.carrinho, carrinho);
    atualizarContadores();
    if (anterior > 0 && nova === anterior) {
      toast("Limite de estoque", "Temos " + produto.estoque + " unidade(s) deste produto.", { icone: "relogio" });
    } else {
      toast("Adicionado ao carrinho", produto.nome + (variacao ? " · " + variacao : ""), {
        icone: "sacola",
        link: "/carrinho/",
        rotuloLink: "Ver carrinho",
      });
    }
    return true;
  }

  // ---------------------------------------------------------------- avisos flutuantes

  function toast(titulo, texto, opcoes) {
    var area = qs("[data-toasts]");
    if (!area) return;
    var opt = opcoes || {};
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = icone(opt.icone || "check") + "<div><strong>" + esc(titulo) + "</strong>" +
      (texto ? "<span>" + esc(texto) + "</span>" : "") +
      (opt.link ? ' <a href="' + esc(opt.link) + '">' + esc(opt.rotuloLink || "Ver") + "</a>" : "") +
      "</div>";
    area.appendChild(el);
    window.setTimeout(function () {
      el.classList.add("toast--saindo");
      window.setTimeout(function () { el.remove(); }, 260);
    }, opt.duracao || 4400);
  }

  // ---------------------------------------------------------------- ajustes de preço/estoque vindos do painel

  function atualizarCartoes() {
    qsa("[data-produto]").forEach(function (card) {
      var produto = produtoAtual(card.getAttribute("data-produto"));
      if (!produto) return;
      card.setAttribute("data-preco", produto.preco);
      card.setAttribute("data-estoque", produto.estoque);
      card.setAttribute("data-nota", produto.avaliacao);

      var caixaPreco = card.querySelector(".cartao__preco");
      if (caixaPreco) {
        var antigo = caixaPreco.querySelector("s");
        if (produto.precoAntigo && produto.precoAntigo > produto.preco) {
          if (!antigo) { antigo = document.createElement("s"); caixaPreco.insertBefore(antigo, caixaPreco.firstChild); }
          antigo.textContent = brl(produto.precoAntigo);
        } else if (antigo) {
          antigo.remove();
        }
        var atual = caixaPreco.querySelector("strong");
        if (atual) atual.textContent = brl(produto.preco);
      }
      var parcela = card.querySelector(".cartao__parcelas");
      if (parcela) parcela.textContent = textoParcelas(produto.preco);
      var pix = card.querySelector(".cartao__pix");
      if (pix) pix.innerHTML = icone("pix") + " " + brl(precoPix(produto.preco)) + " no Pix";

      var midia = card.querySelector(".cartao__midia");
      if (midia) {
        var rapido = midia.querySelector("[data-adicionar]");
        var aviso = midia.querySelector(".cartao__aviso");
        if (produto.estoque <= 0) {
          card.classList.add("cartao--esgotado");
          if (rapido) rapido.remove();
          if (!aviso) {
            aviso = document.createElement("span");
            aviso.className = "cartao__aviso";
            aviso.textContent = "Avise-me quando chegar";
            midia.appendChild(aviso);
          }
        } else {
          card.classList.remove("cartao--esgotado");
          if (aviso) aviso.remove();
          if (!midia.querySelector("[data-adicionar]")) {
            var variacao = produto.variacoes && produto.variacoes.opcoes ? produto.variacoes.opcoes[0].nome : "";
            var botao = document.createElement("button");
            botao.type = "button";
            botao.className = "cartao__rapido";
            botao.setAttribute("data-adicionar", produto.slug);
            botao.setAttribute("data-variacao", variacao);
            botao.innerHTML = icone("mais") + " <span>Adicionar</span>";
            midia.appendChild(botao);
          }
        }
      }
    });
  }

  function slugDaPagina() {
    var achado = location.pathname.match(/^\/produtos\/([^/]+)\/?$/);
    return achado ? decodeURIComponent(achado[1]) : null;
  }

  function atualizarPaginaProduto() {
    var slug = slugDaPagina();
    if (!slug) return;
    var produto = produtoAtual(slug);
    if (!produto) return;

    var por = qs(".produto__por");
    if (por) por.textContent = brl(produto.preco);
    var de = qs(".produto__de");
    if (de) {
      if (produto.precoAntigo && produto.precoAntigo > produto.preco) de.textContent = "de " + brl(produto.precoAntigo) + " por";
      else de.remove();
    }
    var pix = qs(".produto__pix strong");
    if (pix) pix.textContent = brl(precoPix(produto.preco));
    var parcela = qs(".produto__parcelas");
    if (parcela) parcela.textContent = textoParcelas(produto.preco);
    var barraPreco = qs(".barra-produto__info span");
    if (barraPreco) barraPreco.textContent = brl(produto.preco);

    if (produto.estoque <= 0) {
      qsa("[data-comprar]").forEach(function (botao) {
        botao.disabled = true;
        botao.textContent = "Esgotado";
      });
    }
  }

  function aplicarAjustesDaLoja() {
    if (qs(".admin")) return;
    atualizarCartoes();
    atualizarPaginaProduto();
  }

  // ---------------------------------------------------------------- busca e sugestões

  function produtosBuscados(termo) {
    var alvo = normalizar(termo);
    if (!alvo) return [];
    var palavras = alvo.split(" ").filter(Boolean);
    return produtos.map(function (base, indice) {
      var p = produtoAtual(base.slug) || base;
      var campos = [p.nome, p.marca, categoriaDoProduto(p), subDoProduto(p)].concat(p.tags || []).join(" ");
      var texto = normalizar(campos);
      var nome = normalizar(p.nome);
      var pontos = 0;
      if (nome === alvo) pontos += 40;
      if (nome.indexOf(alvo) === 0) pontos += 24;
      if (nome.indexOf(alvo) > -1) pontos += 14;
      if (texto.indexOf(alvo) > -1) pontos += 8;
      if (palavras.every(function (parte) { return texto.indexOf(parte) > -1; })) pontos += 5;
      if (pontos === 0) return null;
      return { produto: p, pontos: pontos, ordem: indice };
    }).filter(Boolean).sort(function (a, b) {
      return b.pontos - a.pontos || a.ordem - b.ordem;
    }).map(function (item) { return item.produto; });
  }

  function sugestoesHtml(termo) {
    var achados = produtosBuscados(termo).slice(0, 5);
    if (!achados.length) {
      return '<p class="sugestoes__vazio">Nada encontrado para “' + esc(termo) + '”. Tente “sofá” ou “air fryer”.</p>' +
        '<a class="sugestoes__rodape" href="/busca/?q=' + encodeURIComponent(termo) + '">Ver busca completa</a>';
    }
    var html = '<p class="sugestoes__titulo">Sugestões</p>';
    achados.forEach(function (p) {
      html += '<a class="sugestao" href="/produtos/' + esc(p.slug) + '/">' +
        '<img class="sugestao__img" src="/assets/img/' + esc(p.imagem) + '-800.jpg" alt="" width="44" height="44" loading="lazy">' +
        '<span class="sugestao__texto"><strong>' + esc(p.nome) + "</strong><small>" + esc(p.marca + " · " + categoriaDoProduto(p)) + "</small></span>" +
        '<span class="sugestao__preco">' + brl(p.preco) + "</span></a>";
    });
    html += '<a class="sugestoes__rodape" href="/busca/?q=' + encodeURIComponent(termo) + '">Ver todos os resultados para “' + esc(termo) + '”</a>';
    return html;
  }

  function iniciarBuscaTopo() {
    qsa("[data-busca-form]").forEach(function (form) {
      var input = form.querySelector("[data-busca-input]");
      var caixa = form.querySelector("[data-sugestoes]");
      if (!input || !caixa) return;

      function mostrar() {
        var termo = input.value.trim();
        if (termo.length < 2) { caixa.hidden = true; caixa.innerHTML = ""; return; }
        caixa.innerHTML = sugestoesHtml(termo);
        caixa.hidden = false;
      }

      input.addEventListener("input", mostrar);
      input.addEventListener("focus", mostrar);
      input.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") { caixa.hidden = true; input.blur(); }
        if (evento.key === "ArrowDown" && !caixa.hidden) {
          var primeiro = caixa.querySelector("a");
          if (primeiro) { evento.preventDefault(); primeiro.focus(); }
        }
      });
      caixa.addEventListener("keydown", function (evento) {
        if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;
        var links = qsa("a", caixa);
        var atual = links.indexOf(document.activeElement);
        if (atual === -1) return;
        evento.preventDefault();
        var proximo = evento.key === "ArrowDown" ? atual + 1 : atual - 1;
        if (proximo >= 0 && proximo < links.length) links[proximo].focus();
        else input.focus();
      });
    });

    document.addEventListener("click", function (evento) {
      if (evento.target.closest("[data-busca-form]")) return;
      qsa("[data-sugestoes]").forEach(function (caixa) { caixa.hidden = true; });
    });
  }

  // ---------------------------------------------------------------- listagem com filtros

  function baseDaListagem() {
    var segmentos = location.pathname.split("/").filter(Boolean);
    var primeiro = segmentos[0] || "";
    var lista;
    if (primeiro === "ofertas") {
      lista = produtos.filter(function (p) { return p.precoAntigo && p.precoAntigo > p.preco; });
    } else if (primeiro === "produtos" && segmentos.length === 1) {
      lista = produtos.slice();
    } else {
      var cat = catPorSlug.get(primeiro);
      if (cat) {
        lista = produtos.filter(function (p) {
          return p.categoria === cat.slug && (!segmentos[1] || p.sub === segmentos[1]);
        });
      } else {
        lista = produtos.slice();
      }
    }
    return lista.map(function (p) { return produtoAtual(p.slug) || p; }).sort(function (a, b) {
      return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0) || (b.maisVendido ? 1 : 0) - (a.maisVendido ? 1 : 0);
    });
  }

  function ordenarLista(lista, modo) {
    var copia = lista.slice();
    if (modo === "menor") copia.sort(function (a, b) { return a.preco - b.preco; });
    else if (modo === "maior") copia.sort(function (a, b) { return b.preco - a.preco; });
    else if (modo === "vendidos") copia.sort(function (a, b) { return (b.maisVendido ? 1 : 0) - (a.maisVendido ? 1 : 0) || b.avaliacao - a.avaliacao; });
    else if (modo === "lancamentos") copia.sort(function (a, b) { return (b.lancamento ? 1 : 0) - (a.lancamento ? 1 : 0) || b.avaliacao - a.avaliacao; });
    else if (modo === "avaliacao") copia.sort(function (a, b) { return b.avaliacao - a.avaliacao; });
    return copia;
  }

  function iniciarListagem() {
    var form = qs("[data-filtros]");
    var painel = qs("[data-filtros-painel]");
    var grade = qs("[data-grade]");
    var vazio = qs("[data-vazio]");
    var contagem = qs("[data-contagem]");
    var chips = qs("[data-chips]");
    var seloContagem = qs("[data-filtros-ativos]");
    var ordenar = qs("[data-ordenar]");
    if (!form || !grade) return;

    var fundo = qs("[data-fundo-filtros]");
    var base = baseDaListagem();
    var temporizador = null;

    function valores() {
      var dados = new FormData(form);
      return {
        min: centavosDeReais(dados.get("min")),
        max: centavosDeReais(dados.get("max")),
        marcas: dados.getAll("marca"),
        cores: dados.getAll("cor"),
        materiais: dados.getAll("material"),
        nota: dados.get("nota") ? Number(dados.get("nota")) : null,
        disponivel: dados.get("disponivel") === "on",
        ordem: ordenar ? ordenar.value : "relevancia",
      };
    }

    function filtrar(filtro) {
      return base.filter(function (p) {
        if (filtro.min != null && p.preco < filtro.min) return false;
        if (filtro.max != null && p.preco > filtro.max) return false;
        if (filtro.marcas.length && filtro.marcas.indexOf(p.marca) === -1) return false;
        if (filtro.materiais.length) {
          var materiais = p.materiais || [];
          if (!filtro.materiais.some(function (m) { return materiais.indexOf(m) > -1; })) return false;
        }
        if (filtro.cores.length) {
          var cores = (p.variacoes && p.variacoes.opcoes ? p.variacoes.opcoes : []).map(function (o) { return o.nome; });
          if (!filtro.cores.some(function (c) { return cores.indexOf(c) > -1; })) return false;
        }
        if (filtro.nota != null && p.avaliacao < filtro.nota) return false;
        if (filtro.disponivel && p.estoque <= 0) return false;
        return true;
      });
    }

    function rotuloPreco(min, max) {
      if (min != null && max != null) return "Preço: " + brl(min) + " – " + brl(max);
      if (min != null) return "Preço: a partir de " + brl(min);
      return "Preço: até " + brl(max);
    }

    function desenharChips(filtro) {
      if (!chips) return;
      var itens = [];
      if (filtro.min != null || filtro.max != null) {
        itens.push({ tipo: "preco", valor: "", rotulo: rotuloPreco(filtro.min, filtro.max) });
      }
      filtro.marcas.forEach(function (m) { itens.push({ tipo: "marca", valor: m, rotulo: m }); });
      filtro.cores.forEach(function (c) { itens.push({ tipo: "cor", valor: c, rotulo: c }); });
      filtro.materiais.forEach(function (m) { itens.push({ tipo: "material", valor: m, rotulo: m }); });
      if (filtro.nota != null) itens.push({ tipo: "nota", valor: String(filtro.nota), rotulo: String(filtro.nota).replace(".", ",") + "+ estrelas" });
      if (filtro.disponivel) itens.push({ tipo: "disponivel", valor: "", rotulo: "Em estoque" });

      chips.innerHTML = itens.map(function (item) {
        return '<span class="chip-ativo">' + esc(item.rotulo) +
          '<button type="button" data-remover-filtro="' + item.tipo + '" data-valor="' + esc(item.valor) + '" aria-label="Remover filtro ' + esc(item.rotulo) + '">' + icone("fechar") + "</button></span>";
      }).join("") + (itens.length ? '<button class="chips-ativos__limpar" type="button" data-limpar-filtros>Limpar tudo</button>' : "");
      chips.hidden = itens.length === 0;

      if (seloContagem) {
        var total = itens.length;
        seloContagem.textContent = String(total);
        seloContagem.hidden = total === 0;
      }
      return itens.length;
    }

    function sincronizarUrl(filtro) {
      if (!window.history || !history.replaceState) return;
      var params = new URLSearchParams();
      if (filtro.min != null) params.set("min", String(filtro.min / 100));
      if (filtro.max != null) params.set("max", String(filtro.max / 100));
      if (filtro.marcas.length) params.set("marca", filtro.marcas.join(","));
      if (filtro.cores.length) params.set("cor", filtro.cores.join(","));
      if (filtro.materiais.length) params.set("material", filtro.materiais.join(","));
      if (filtro.nota != null) params.set("nota", String(filtro.nota));
      if (filtro.disponivel) params.set("disponivel", "1");
      if (filtro.ordem && filtro.ordem !== "relevancia") params.set("ordenar", filtro.ordem);
      var busca = params.toString();
      history.replaceState(null, "", location.pathname + (busca ? "?" + busca : ""));
    }

    function aplicar(sincronizar) {
      var filtro = valores();
      var lista = ordenarLista(filtrar(filtro), filtro.ordem);
      grade.innerHTML = lista.map(function (p) { return cardProdutoHtml(p); }).join("");
      grade.hidden = lista.length === 0;
      if (vazio) vazio.hidden = lista.length > 0;
      if (contagem) contagem.textContent = lista.length + (lista.length === 1 ? " produto" : " produtos");
      desenharChips(filtro);
      sincronizarBotoesFavorito();
      if (sincronizar !== false) sincronizarUrl(filtro);
    }

    function aplicarFaixa(texto) {
      var partes = String(texto || "").split("-");
      var min = centavosDeReais(partes[0]);
      var max = centavosDeReais(partes[1]);
      var campoMin = form.elements.namedItem("min");
      var campoMax = form.elements.namedItem("max");
      if (campoMin) campoMin.value = min != null ? String(Math.round(min / 100)) : "";
      if (campoMax) campoMax.value = max != null ? String(Math.round(max / 100)) : "";
      aplicar();
    }

    function limpar() {
      form.reset();
      aplicar();
    }

    function abrir() {
      if (!painel) return;
      painel.classList.add("aberto");
      if (fundo) fundo.hidden = false;
      document.body.classList.add("travado");
    }

    function fechar() {
      if (!painel) return;
      painel.classList.remove("aberto");
      if (fundo) fundo.hidden = true;
      document.body.classList.remove("travado");
    }

    // Filtros vindos da URL
    var params = new URLSearchParams(location.search);
    ["marca", "cor", "material"].forEach(function (nome) {
      var lista = params.get(nome);
      if (!lista) return;
      lista.split(",").forEach(function (valor) {
        var campo = qsa('input[name="' + nome + '"]', form).find(function (el) { return el.value === valor; });
        if (campo) campo.checked = true;
      });
    });
    if (params.get("min")) form.elements.namedItem("min").value = params.get("min");
    if (params.get("max")) form.elements.namedItem("max").value = params.get("max");
    if (params.get("nota")) {
      var radio = qsa('input[name="nota"]', form).find(function (el) { return el.value === params.get("nota"); });
      if (radio) radio.checked = true;
    }
    if (params.get("disponivel") === "1") form.elements.namedItem("disponivel").checked = true;
    if (ordenar && params.get("ordenar")) ordenar.value = params.get("ordenar");

    aplicar(false);

    form.addEventListener("change", function () { aplicar(); });
    form.addEventListener("input", function (evento) {
      if (evento.target && evento.target.type === "number") {
        window.clearTimeout(temporizador);
        temporizador = window.setTimeout(function () { aplicar(); }, 260);
      }
    });
    form.addEventListener("submit", function (evento) { evento.preventDefault(); aplicar(); fechar(); });

    if (ordenar) ordenar.addEventListener("change", function () { aplicar(); });

    qsa("[data-faixa]").forEach(function (botao) {
      botao.addEventListener("click", function () { aplicarFaixa(botao.getAttribute("data-faixa")); });
    });

    qsa("[data-limpar-filtros]").forEach(function (botao) {
      botao.addEventListener("click", function (evento) {
        evento.preventDefault();
        limpar();
        if (botao.closest("[data-filtros-painel]")) fechar();
      });
    });

    qsa("[data-abrir-filtros]").forEach(function (botao) { botao.addEventListener("click", abrir); });
    qsa("[data-fechar-filtros]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        aplicar();
        fechar();
      });
    });
    if (fundo) fundo.addEventListener("click", fechar);

    if (chips) {
      chips.addEventListener("click", function (evento) {
        var remover = evento.target.closest("[data-remover-filtro]");
        if (!remover) return;
        var tipo = remover.getAttribute("data-remover-filtro");
        var valor = remover.getAttribute("data-valor");
        if (tipo === "preco") {
          form.elements.namedItem("min").value = "";
          form.elements.namedItem("max").value = "";
        } else if (tipo === "nota") {
          qsa('input[name="nota"]', form).forEach(function (el) { el.checked = false; });
        } else if (tipo === "disponivel") {
          form.elements.namedItem("disponivel").checked = false;
        } else if (tipo === "marca" || tipo === "cor" || tipo === "material") {
          qsa('input[name="' + tipo + '"]', form).forEach(function (el) {
            if (el.value === valor) el.checked = false;
          });
        }
        aplicar();
      });
    }

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape") fechar();
    });
  }

  // ---------------------------------------------------------------- página de busca

  function iniciarPaginaBusca() {
    var form = qs("[data-busca-pagina]");
    if (!form) return;
    var input = qs("[data-busca-pagina-input]");
    var grade = qs("[data-busca-grade]");
    var vazio = qs("[data-busca-vazio]");
    var categoriasBloco = qs("[data-busca-vazia]");
    var contagem = qs("[data-busca-contagem]");
    var titulo = qs("[data-busca-titulo]");
    var ordenar = qs("[data-ordenar]") || form.parentElement.querySelector("[data-ordenar]");

    function render(termo, atualizarUrl) {
      var q = String(termo || "").trim();
      var achados = produtosBuscados(q);
      if (ordenar && ordenar.value !== "relevancia") achados = ordenarLista(achados, ordenar.value);

      if (!q) {
        grade.innerHTML = "";
        grade.hidden = true;
        vazio.hidden = true;
        categoriasBloco.hidden = false;
        if (contagem) contagem.textContent = "Digite para buscar";
        if (titulo) titulo.textContent = "O que você procura?";
      } else if (!achados.length) {
        grade.innerHTML = "";
        grade.hidden = true;
        vazio.hidden = false;
        categoriasBloco.hidden = true;
        if (contagem) contagem.textContent = "Nenhum produto encontrado";
        if (titulo) titulo.textContent = "Resultados para “" + q + "”";
      } else {
        grade.innerHTML = achados.map(function (p) { return cardProdutoHtml(p); }).join("");
        grade.hidden = false;
        vazio.hidden = true;
        categoriasBloco.hidden = true;
        if (contagem) contagem.textContent = achados.length + (achados.length === 1 ? " produto" : " produtos") + " para “" + q + "”";
        if (titulo) titulo.textContent = "Resultados para “" + q + "”";
      }
      sincronizarBotoesFavorito();
      if (atualizarUrl !== false && window.history && history.replaceState) {
        var params = new URLSearchParams();
        if (q) params.set("q", q);
        if (ordenar && ordenar.value !== "relevancia") params.set("ordenar", ordenar.value);
        history.replaceState(null, "", location.pathname + (params.toString() ? "?" + params.toString() : ""));
      }
    }

    var params = new URLSearchParams(location.search);
    var termoInicial = params.get("q") || "";
    input.value = termoInicial;
    if (ordenar && params.get("ordenar")) ordenar.value = params.get("ordenar");
    render(termoInicial, false);

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      render(input.value, true);
    });
    input.addEventListener("search", function () { render(input.value, true); });
    if (ordenar) ordenar.addEventListener("change", function () { render(input.value || termoInicial, true); });
    qsa("[data-busca-sugerida]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        input.value = botao.getAttribute("data-busca-sugerida") || "";
        render(input.value, true);
        input.focus();
      });
    });
  }

  // ---------------------------------------------------------------- produto

  function iniciarProduto() {
    var slug = slugDaPagina();
    if (!slug) return;
    var produto = produtoAtual(slug);
    if (!produto) return;

    var galeria = qs("[data-galeria]");
    var miniaturas = galeria ? qsa("[data-foto]", galeria) : [];
    var principal = qs("[data-imagem-principal]");
    var legenda = qs("[data-legenda]");
    var zoom = qs(".galeria__zoom");
    var lightbox = qs("[data-lightbox]");
    var lightboxImg = qs("[data-lightbox-img]");
    var lightboxLegenda = qs("[data-lightbox-legenda]");
    var fotoAtual = 0;
    var altOriginal = principal ? principal.getAttribute("alt") : (produto.imagemAlt || produto.nome);
    var fotos = miniaturas.map(function (botao, indice) {
      var img = botao.querySelector("img");
      var src800 = img ? img.getAttribute("src") : "/assets/img/" + produto.imagem + "-800.jpg";
      var src = src800.replace(/-800\.jpg(\?.*)?$/, ".jpg$1");
      var rotulo = botao.getAttribute("aria-label") || "Foto do produto";
      var alt = indice === 0 ? altOriginal : rotulo + " — " + produto.nome;
      return { src: src, src800: src800, rotulo: rotulo, alt: alt };
    });

    function mostrarFoto(indice) {
      if (!fotos.length || !principal) return;
      fotoAtual = (indice + fotos.length) % fotos.length;
      var foto = fotos[fotoAtual];
      principal.setAttribute("src", foto.src);
      principal.setAttribute("srcset", foto.src800 + " 800w, " + foto.src + " 1600w");
      principal.setAttribute("alt", foto.alt);
      miniaturas.forEach(function (botao, i) {
        botao.classList.toggle("ativo", i === fotoAtual);
        botao.setAttribute("aria-selected", i === fotoAtual ? "true" : "false");
      });
      if (legenda) legenda.textContent = foto.rotulo + " · " + foto.alt;
      if (lightboxImg && lightbox && lightbox.open) {
        lightboxImg.setAttribute("src", foto.src);
        lightboxImg.setAttribute("alt", foto.alt);
        if (lightboxLegenda) lightboxLegenda.textContent = foto.alt;
      }
    }

    miniaturas.forEach(function (botao) {
      botao.addEventListener("click", function () { mostrarFoto(Number(botao.getAttribute("data-foto")) || 0); });
    });

    if (zoom) {
      zoom.addEventListener("mousemove", function (evento) {
        var caixa = zoom.getBoundingClientRect();
        var x = ((evento.clientX - caixa.left) / caixa.width) * 100;
        var y = ((evento.clientY - caixa.top) / caixa.height) * 100;
        zoom.style.setProperty("--zoom-x", x + "%");
        zoom.style.setProperty("--zoom-y", y + "%");
        zoom.classList.add("ampliando");
      });
      zoom.addEventListener("mouseleave", function () { zoom.classList.remove("ampliando"); });
      zoom.addEventListener("click", function () { abrirLightbox(fotoAtual); });
    }

    function abrirLightbox(indice) {
      if (!lightbox) return;
      mostrarFoto(indice);
      var foto = fotos[fotoAtual];
      if (lightboxImg && foto) {
        lightboxImg.setAttribute("src", foto.src);
        lightboxImg.setAttribute("alt", foto.alt);
      }
      if (lightboxLegenda && foto) lightboxLegenda.textContent = foto.alt;
      if (typeof lightbox.showModal === "function" && !lightbox.open) lightbox.showModal();
      else lightbox.setAttribute("open", "open");
    }

    if (lightbox) {
      var fecharLb = qs("[data-fechar-lightbox]", lightbox);
      var anterior = qs("[data-lightbox-anterior]", lightbox);
      var proxima = qs("[data-lightbox-proxima]", lightbox);
      if (fecharLb) fecharLb.addEventListener("click", function () { lightbox.close ? lightbox.close() : lightbox.removeAttribute("open"); });
      if (anterior) anterior.addEventListener("click", function () { mostrarFoto(fotoAtual - 1); });
      if (proxima) proxima.addEventListener("click", function () { mostrarFoto(fotoAtual + 1); });
      lightbox.addEventListener("click", function (evento) {
        if (evento.target === lightbox && lightbox.close) lightbox.close();
      });
    }

    qsa("[data-opcao]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        qsa("[data-opcao]").forEach(function (outro) {
          outro.classList.remove("ativo");
          outro.setAttribute("aria-checked", "false");
        });
        botao.classList.add("ativo");
        botao.setAttribute("aria-checked", "true");
        var nome = qs("[data-variacao-nome]");
        if (nome) nome.textContent = botao.getAttribute("data-opcao") || "";
      });
    });

    var campoQtd = qs("[data-qtd]");
    var maximo = Math.max(1, produto.estoque || 1);
    function qtdAtual() {
      var n = parseInt(campoQtd ? campoQtd.value : "1", 10);
      if (!isFinite(n) || n < 1) n = 1;
      if (n > maximo) n = maximo;
      if (campoQtd) campoQtd.value = String(n);
      return n;
    }
    if (campoQtd) {
      campoQtd.setAttribute("max", String(maximo));
      campoQtd.addEventListener("change", qtdAtual);
      campoQtd.addEventListener("input", function () {
        var n = parseInt(campoQtd.value, 10);
        if (isFinite(n) && n > maximo) campoQtd.value = String(maximo);
      });
    }
    var menos = qs("[data-qtd-menos]");
    var mais = qs("[data-qtd-mais]");
    if (menos) menos.addEventListener("click", function () { if (campoQtd) campoQtd.value = String(Math.max(1, qtdAtual() - 1)); });
    if (mais) mais.addEventListener("click", function () { if (campoQtd) campoQtd.value = String(Math.min(maximo, qtdAtual() + 1)); });

    qsa("[data-comprar]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        var variacao = qs("[data-opcao].ativo");
        adicionarAoCarrinho(produto.slug, variacao ? variacao.getAttribute("data-opcao") : "", qtdAtual());
      });
    });

    qsa("[data-aviso-estoque]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        var conta = ler(CHAVES.conta, null);
        if (conta && conta.email) {
          toast("Tudo certo", "Avisaremos " + conta.email + " quando o produto voltar.", { icone: "email" });
        } else {
          toast("Produto esgotado", "Fale com a gente para entrar na lista de aviso.", {
            icone: "whatsapp",
            link: "https://wa.me/" + loja.whatsapp,
            rotuloLink: "WhatsApp",
          });
        }
      });
    });

    var barra = qs("[data-barra-produto]");
    if (barra) {
      var atualizarBarra = function () { barra.hidden = window.scrollY < 420; };
      window.addEventListener("scroll", atualizarBarra, { passive: true });
      atualizarBarra();
    }

    iniciarAvaliacoes(produto);
    atualizarPaginaProduto();
  }

  function iniciarAvaliacoes(produto) {
    var abrir = qs("[data-abrir-avaliacao]");
    var fechar = qs("[data-fechar-avaliacao]");
    var form = qs("[data-avaliacao-form]");
    var lista = qs("[data-avaliacoes-lista]");
    if (!form || !lista) return;

    var guardadas = ler(CHAVES.avaliacoes, {});
    var reviews = guardadas[produto.slug] || [];

    function criarArtigo(avaliacao) {
      return '<article class="avaliacao"><div class="avaliacao__topo"><div><strong>' + esc(avaliacao.nome) +
        '</strong><span class="avaliacao__local">Cliente Casa Viva · ' + esc(avaliacao.data) + "</span></div>" +
        estrelas(avaliacao.nota) + "</div><h3>" + esc(avaliacao.titulo || "Avaliação do produto") + "</h3>" +
        "<p>" + esc(avaliacao.texto) + '</p><div class="avaliacao__rodape"><span>' + icone("check") +
        " Compra verificada</span><span>Agora mesmo</span></div></article>";
    }

    if (reviews.length) {
      lista.insertAdjacentHTML("afterbegin", reviews.map(criarArtigo).join(""));
    }

    if (abrir && form) {
      abrir.addEventListener("click", function () {
        form.hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "center" });
        var nome = form.querySelector('input[name="nome"]');
        if (nome) window.setTimeout(function () { nome.focus(); }, 350);
      });
    }
    if (fechar) fechar.addEventListener("click", function () { form.hidden = true; });

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var dados = new FormData(form);
      var nome = String(dados.get("nome") || "").trim();
      var texto = String(dados.get("texto") || "").trim();
      var nota = Number(dados.get("nota"));
      if (nome.length < 2 || texto.length < 5 || !nota) {
        toast("Quase lá", "Preencha seu nome, a nota e a opinião.", { icone: "relogio" });
        return;
      }
      var avaliacao = {
        nome: nome,
        nota: nota,
        titulo: "Avaliação de " + nome,
        texto: texto,
        data: new Date().toLocaleDateString("pt-BR"),
      };
      var todas = ler(CHAVES.avaliacoes, {});
      todas[produto.slug] = [avaliacao].concat(todas[produto.slug] || []);
      salvar(CHAVES.avaliacoes, todas);
      lista.insertAdjacentHTML("afterbegin", criarArtigo(avaliacao));
      form.reset();
      form.hidden = true;
      toast("Avaliação enviada", "Obrigado por dividir sua experiência.", { icone: "coracao" });
    });
  }

  // ---------------------------------------------------------------- frete por CEP

  function consultarCep(cep) {
    if (!window.fetch) return Promise.resolve(null);
    var controle = window.AbortController ? new AbortController() : null;
    var timer = window.setTimeout(function () { if (controle) controle.abort(); }, 4500);
    return fetch("https://viacep.com.br/ws/" + cep + "/json/", controle ? { signal: controle.signal } : undefined)
      .then(function (resposta) {
        if (!resposta.ok) throw new Error("CEP");
        return resposta.json();
      })
      .then(function (dados) {
        if (!dados || dados.erro) return { erro: true };
        return dados;
      })
      .catch(function () { return null; })
      .then(function (resultado) {
        window.clearTimeout(timer);
        return resultado;
      });
  }

  function regiaoDoCep(cep) {
    return fretes.find(function (f) { return cep.charAt(0) === f.cep; }) || fretes[0] || { regiao: "Brasil", valor: 2990, prazo: [4, 9] };
  }

  function prazoTexto(prazo) {
    if (!prazo) return "Prazo a combinar";
    if (prazo[0] === prazo[1]) return prazo[0] + " dia(s) útil(eis)";
    return prazo[0] + " a " + prazo[1] + " dias úteis";
  }

  function subtotalAtual() {
    return lerCarrinho().reduce(function (soma, item) {
      var p = produtoAtual(item.slug);
      return soma + (p ? p.preco * item.qtd : 0);
    }, 0);
  }

  function cupomVigente() {
    var codigo = ler(CHAVES.cupom, "");
    if (!codigo) return null;
    var subtotal = subtotalAtual();
    var resultado = avaliarCupom(codigo, subtotal);
    return resultado && !resultado.erro ? resultado : null;
  }

  function opcoesDeFrete(cep, contexto) {
    var regiao = regiaoDoCep(cep);
    var base = regiao.valor;
    var gratis = false;
    if (contexto === "carrinho" || contexto === "checkout") {
      var subtotal = subtotalAtual();
      gratis = subtotal >= loja.freteGratisAcimaDe;
      var cupom = cupomVigente();
      if (cupom && cupom.freteGratis) gratis = true;
    } else {
      var produto = slugDaPagina() ? produtoAtual(slugDaPagina()) : null;
      gratis = !!(produto && produto.preco >= loja.freteGratisAcimaDe);
    }
    return {
      regiao: regiao,
      opcoes: [
        { tipo: "padrao", nome: "Entrega padrão", valor: gratis ? 0 : base, prazo: regiao.prazo, gratis: gratis },
        { tipo: "expressa", nome: "Entrega expressa", valor: base + 1490, prazo: [Math.max(1, regiao.prazo[0] - 1), Math.max(1, regiao.prazo[1] - 1)] },
      ],
    };
  }

  function renderizarCep(alvo, contexto, dados, calculo, cep) {
    var local = dados && !dados.erro ? [dados.bairro, dados.cidade && dados.cidade + "/" + dados.uf].filter(Boolean).join(" · ") : "";
    var html = calculo.opcoes.map(function (opcao, indice) {
      return '<label class="cep-opcao"><input type="radio" name="frete-' + contexto + '" value="' + opcao.tipo + '"' + (indice === 0 ? " checked" : "") +
        ' data-tipo="' + opcao.tipo + '" data-valor="' + opcao.valor + '" data-prazo="' + esc(prazoTexto(opcao.prazo)) + '">' +
        '<span class="cep-opcao__nome">' + opcao.nome + "</span>" +
        '<span class="cep-opcao__prazo">' + prazoTexto(opcao.prazo) + "</span>" +
        '<span class="cep-opcao__preco' + (opcao.valor === 0 ? " cep-opcao__preco--gratis" : "") + '">' + (opcao.valor === 0 ? "Grátis" : brl(opcao.valor)) + "</span></label>";
    }).join("");

    var aviso = '<p class="cep-aviso">' + (local ? esc(local) + " · " : "") + esc(calculo.regiao.regiao) +
      (calculo.opcoes[0].gratis ? " · frete grátis nesta compra" : "") + "</p>";
    if (dados === null) aviso = '<p class="cep-aviso">' + esc(calculo.regiao.regiao) + " · estimativa pela faixa do CEP. Não foi possível consultar o ViaCEP agora.</p>";
    alvo.innerHTML = html + aviso;

    qsa("input[type=radio]", alvo).forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (contexto !== "carrinho") return;
        salvar(CHAVES.frete, {
          cep: cep,
          tipo: radio.getAttribute("data-tipo"),
          nome: radio.closest(".cep-opcao").querySelector(".cep-opcao__nome").textContent,
          valor: Number(radio.getAttribute("data-valor")),
          prazo: radio.getAttribute("data-prazo"),
          base: calculo.opcoes[0].valor,
          regiao: calculo.regiao.regiao,
          contexto: "carrinho",
        });
        if (typeof renderizarCarrinho === "function" && qs("[data-carrinho-itens]")) renderizarCarrinho();
      });
    });

    if (contexto === "carrinho") {
      var primeiro = qsa("input[type=radio]", alvo)[0];
      if (primeiro) primeiro.dispatchEvent(new Event("change"));
    }
  }

  function iniciarCep() {
    qsa("[data-cep-form]").forEach(function (form) {
      form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var campo = form.querySelector('input[name="cep"]');
        var alvo = form.parentElement.querySelector("[data-cep-resultado]") || qs("[data-cep-resultado]");
        if (!campo || !alvo) return;
        var cep = somenteDigitos(campo.value);
        if (cep.length !== 8) {
          alvo.innerHTML = '<p class="cep-erro">Digite um CEP válido com 8 números.</p>';
          campo.focus();
          return;
        }
        var contexto = form.getAttribute("data-contexto") || "produto";
        alvo.innerHTML = '<p class="cep-carregando">Calculando frete…</p>';
        consultarCep(cep).then(function (dados) {
          if (dados && dados.erro) {
            alvo.innerHTML = '<p class="cep-erro">CEP não encontrado. Confira os números e tente de novo.</p>';
            return;
          }
          var calculo = opcoesDeFrete(cep, contexto);
          renderizarCep(alvo, contexto, dados, calculo, cep);
        });
      });
    });
  }

  // ---------------------------------------------------------------- cupons

  function avaliarCupom(codigo, subtotal) {
    var chave = String(codigo || "").trim().toUpperCase();
    if (!chave) return { erro: "Digite o código do cupom." };
    var cupom = cupons.find(function (c) { return c.codigo.toUpperCase() === chave; });
    if (!cupom) return { erro: "Cupom não encontrado. Confira o código e tente de novo." };
    if (subtotal < (cupom.minimo || 0)) {
      return { erro: "O cupom " + cupom.codigo + " vale em compras a partir de " + brl(cupom.minimo) + "." };
    }

    var desconto = 0;
    if (cupom.tipo === "percentual") {
      desconto = Math.round(subtotal * (cupom.valor / 100));
      if (cupom.maximo) desconto = Math.min(desconto, cupom.maximo);
    } else if (cupom.tipo === "fixo") {
      desconto = Math.min(cupom.valor, subtotal);
    }

    return {
      codigo: cupom.codigo,
      cupom: cupom,
      desconto: desconto,
      freteGratis: cupom.tipo === "frete",
      rotulo: cupom.descricao,
    };
  }

  function mensagemCupom(texto, tipo) {
    qsa("[data-cupom-msg]").forEach(function (el) {
      el.textContent = texto || "";
      el.classList.toggle("cupom__msg--ok", tipo === "ok");
      el.classList.toggle("cupom__msg--erro", tipo === "erro");
    });
  }

  function textoCupomAplicado(resultado) {
    if (resultado.freteGratis) return "Cupom " + resultado.codigo + " aplicado: frete grátis nesta compra.";
    return "Cupom " + resultado.codigo + " aplicado: " + brl(resultado.desconto) + " de desconto.";
  }

  function iniciarCupons() {
    var codigoSalvo = ler(CHAVES.cupom, "");
    if (codigoSalvo) {
      qsa("[data-cupom-form] input[name='cupom']").forEach(function (input) { input.value = codigoSalvo; });
    }

    qsa("[data-cupom-form]").forEach(function (form) {
      form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var input = form.querySelector("input[name='cupom']");
        var codigo = input ? input.value.trim().toUpperCase() : "";
        if (!codigo) {
          apagar(CHAVES.cupom);
          mensagemCupom("Cupom removido.", "ok");
          atualizarResumosCompra();
          return;
        }
        var resultado = avaliarCupom(codigo, subtotalAtual());
        if (resultado.erro) {
          mensagemCupom(resultado.erro, "erro");
          if (input) input.focus();
          return;
        }
        salvar(CHAVES.cupom, resultado.codigo);
        if (input) input.value = resultado.codigo;
        atualizarResumosCompra();
        mensagemCupom(textoCupomAplicado(resultado), "ok");
        toast("Cupom aplicado", resultado.rotulo, { icone: "presente" });
      });
    });

    qsa("[data-cupom-atalho]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        var form = qs("[data-cupom-form]");
        if (!form) return;
        var input = form.querySelector("input[name='cupom']");
        if (input) input.value = botao.getAttribute("data-cupom-atalho") || "";
        if (typeof form.requestSubmit === "function") form.requestSubmit();
        else form.dispatchEvent(new Event("submit", { cancelable: true }));
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function atualizarResumosCompra() {
    if (qs("[data-carrinho-itens]")) renderizarCarrinho();
    if (typeof atualizarResumoCheckoutPagina === "function") atualizarResumoCheckoutPagina();
  }

  var atualizarResumoCheckoutPagina = null;

  // ---------------------------------------------------------------- carrinho

  function freteDoCarrinho(subtotal, cupom) {
    var salvo = ler(CHAVES.frete, null);
    if (!salvo || !salvo.tipo) return null;
    var valor = Number(salvo.valor) || 0;
    var gratuito = subtotal >= loja.freteGratisAcimaDe || !!(cupom && cupom.freteGratis);
    if (gratuito && salvo.tipo === "padrao") valor = 0;
    return {
      cep: salvo.cep || "",
      tipo: salvo.tipo,
      nome: salvo.nome || "Entrega",
      prazo: salvo.prazo || "",
      regiao: salvo.regiao || "",
      valor: valor,
    };
  }

  function itemCarrinhoHtml(item, indice) {
    var p = produtoAtual(item.slug);
    if (!p) return "";
    var qtd = item.qtd;
    var total = p.preco * qtd;
    var antigo = p.precoAntigo && p.precoAntigo > p.preco ? p.precoAntigo * qtd : null;
    var frete = freteDoCarrinho(subtotalAtual(), cupomVigente());
    var entrega = frete && frete.prazo ? "Chega em " + frete.prazo : "Frete calculado no checkout";
    var rotuloVariacao = p.variacoes && p.variacoes.rotulo ? p.variacoes.rotulo + ": " : "";
    return '\n  <article class="item-carrinho" data-item-carrinho="' + indice + '">' +
      '    <a class="item-carrinho__midia" href="/produtos/' + esc(p.slug) + '/" aria-label="' + esc(p.nome) + '">' +
      '      <img src="/assets/img/' + esc(p.imagem) + '-800.jpg" alt="' + esc(p.imagemAlt) + '" width="800" height="1000" loading="lazy" decoding="async">' +
      "    </a>" +
      '    <div class="item-carrinho__info">' +
      '      <p class="item-carrinho__marca">' + esc(p.marca) + "</p>" +
      '      <h2 class="item-carrinho__nome"><a href="/produtos/' + esc(p.slug) + '/">' + esc(p.nome) + "</a></h2>" +
      (item.variacao ? '<p class="item-carrinho__variacao">' + esc(rotuloVariacao + item.variacao) + "</p>" : "") +
      '      <p class="item-carrinho__entrega">' + icone("caminhao") + " " + esc(entrega) + "</p>" +
      '      <div class="item-carrinho__acoes">' +
      '        <div class="quantidade quantidade--sm">' +
      '          <button type="button" data-carrinho-menos="' + indice + '" aria-label="Diminuir quantidade">' + icone("menos") + "</button>" +
      '          <label class="sr-only" for="qtd-carrinho-' + indice + '">Quantidade</label>' +
      '          <input id="qtd-carrinho-' + indice + '" type="number" inputmode="numeric" min="1" max="' + Math.max(1, p.estoque || 99) + '" value="' + qtd + '" data-carrinho-qtd="' + indice + '">' +
      '          <button type="button" data-carrinho-mais="' + indice + '" aria-label="Aumentar quantidade">' + icone("mais") + "</button>" +
      "        </div>" +
      '        <button class="item-carrinho__remover" type="button" data-carrinho-remover="' + indice + '">' + icone("lixeira") + " Remover</button>" +
      "      </div>" +
      "    </div>" +
      '    <div class="item-carrinho__preco">' +
      (antigo ? "<s>" + brl(antigo) + "</s>" : "") +
      "      <strong>" + brl(total) + "</strong>" +
      '      <span class="item-carrinho__unit">' + brl(p.preco) + " cada</span>" +
      "    </div>" +
      "  </article>";
  }

  function renderizarCarrinho() {
    var area = qs("[data-carrinho-itens]");
    if (!area) return;

    var carrinho = lerCarrinho();
    var subtotal = subtotalAtual();
    var codigoSalvo = ler(CHAVES.cupom, "");
    var avaliado = codigoSalvo ? avaliarCupom(codigoSalvo, subtotal) : null;
    var cupom = avaliado && !avaliado.erro ? avaliado : null;
    var desconto = cupom ? cupom.desconto : 0;
    var frete = freteDoCarrinho(subtotal, cupom);
    var freteValor = frete ? frete.valor : 0;
    var total = Math.max(0, subtotal - desconto + freteValor);

    area.innerHTML = carrinho.map(itemCarrinhoHtml).join("");
    area.hidden = carrinho.length === 0;

    var vazio = qs("[data-carrinho-vazio]");
    if (vazio) vazio.hidden = carrinho.length > 0;
    var extra = qs("[data-carrinho-extra]");
    if (extra) extra.hidden = carrinho.length === 0;
    var continuar = qs(".carrinho-continuar");
    if (continuar) continuar.hidden = carrinho.length === 0;

    var resumo = qs("[data-carrinho-resumo]");
    if (resumo) {
      var unidades = carrinho.reduce(function (soma, item) { return soma + item.qtd; }, 0);
      resumo.textContent = carrinho.length
        ? unidades + (unidades === 1 ? " item" : " itens") + " na sacola · frete grátis acima de " + brl(loja.freteGratisAcimaDe)
        : "Sua sacola está vazia por enquanto.";
    }

    var subtotalEl = qs("[data-resumo-subtotal]");
    if (subtotalEl) subtotalEl.textContent = brl(subtotal);

    var linhaDesconto = qs("[data-resumo-desconto-linha]");
    if (linhaDesconto) linhaDesconto.hidden = desconto <= 0;
    var nomeCupom = qs("[data-resumo-cupom-nome]");
    if (nomeCupom) nomeCupom.textContent = cupom ? "(" + cupom.codigo + ")" : "";
    var descontoEl = qs("[data-resumo-desconto]");
    if (descontoEl) descontoEl.textContent = "− " + brl(desconto);

    var freteEl = qs("[data-resumo-frete]");
    if (freteEl) {
      if (!frete) freteEl.textContent = "Calcular pelo CEP";
      else if (frete.valor === 0) freteEl.textContent = "Grátis";
      else freteEl.textContent = brl(frete.valor);
    }

    var totalEl = qs("[data-resumo-total]");
    if (totalEl) totalEl.textContent = brl(total);
    var parcelasEl = qs("[data-resumo-parcelas]");
    if (parcelasEl) parcelasEl.textContent = total > 0 ? textoParcelas(total) : loja.parcelasSemJuros + "x sem juros no cartão";
    var pixEl = qs("[data-resumo-pix-valor]");
    if (pixEl) pixEl.textContent = brl(precoPix(total));

    var irCheckout = qs("[data-ir-checkout]");
    if (irCheckout) irCheckout.hidden = carrinho.length === 0;

    if (avaliado && avaliado.erro) mensagemCupom(avaliado.erro, "erro");
  }

  function salvarCarrinho(carrinho) {
    salvar(CHAVES.carrinho, carrinho);
    if (!carrinho.length) apagar(CHAVES.frete);
    atualizarContadores();
    renderizarCarrinho();
  }

  function iniciarCarrinho() {
    var area = qs("[data-carrinho-itens]");
    if (!area) return;

    renderizarCarrinho();

    area.addEventListener("click", function (evento) {
      var menos = evento.target.closest("[data-carrinho-menos]");
      var mais = evento.target.closest("[data-carrinho-mais]");
      var remover = evento.target.closest("[data-carrinho-remover]");
      var carrinho = lerCarrinho();

      if (menos) {
        var i = Number(menos.getAttribute("data-carrinho-menos"));
        if (carrinho[i]) {
          if (carrinho[i].qtd <= 1) carrinho.splice(i, 1);
          else carrinho[i].qtd -= 1;
          salvarCarrinho(carrinho);
        }
      } else if (mais) {
        var j = Number(mais.getAttribute("data-carrinho-mais"));
        if (carrinho[j]) {
          var produto = produtoAtual(carrinho[j].slug);
          var limite = Math.max(1, produto ? produto.estoque : 99);
          if (carrinho[j].qtd >= limite) {
            toast("Limite de estoque", "Temos " + limite + " unidade(s) deste produto.", { icone: "relogio" });
          } else {
            carrinho[j].qtd += 1;
            salvarCarrinho(carrinho);
          }
        }
      } else if (remover) {
        var k = Number(remover.getAttribute("data-carrinho-remover"));
        if (carrinho[k]) {
          var removido = produtoAtual(carrinho[k].slug);
          carrinho.splice(k, 1);
          salvarCarrinho(carrinho);
          toast("Produto removido", removido ? removido.nome : "Item do carrinho", { icone: "lixeira" });
        }
      }
    });

    area.addEventListener("change", function (evento) {
      var campo = evento.target.closest("[data-carrinho-qtd]");
      if (!campo) return;
      var indice = Number(campo.getAttribute("data-carrinho-qtd"));
      var carrinho = lerCarrinho();
      if (!carrinho[indice]) return;
      var produto = produtoAtual(carrinho[indice].slug);
      var maximo = Math.max(1, produto ? produto.estoque : 99);
      var qtd = Math.max(1, Math.min(maximo, Math.floor(numero(campo.value, 1))));
      carrinho[indice].qtd = qtd;
      salvarCarrinho(carrinho);
    });

    var ir = qs("[data-ir-checkout]");
    if (ir) {
      ir.addEventListener("click", function (evento) {
        if (!lerCarrinho().length) {
          evento.preventDefault();
          toast("Carrinho vazio", "Escolha uma peça antes de finalizar.", { icone: "sacola" });
        }
      });
    }
  }

  // ---------------------------------------------------------------- checkout

  function campoCheckout(nome) {
    var form = qs("[data-checkout]");
    return form ? form.elements.namedItem(nome) : null;
  }

  function mostrarErroCampo(nome, mensagem) {
    var alvo = qs('[data-erro="' + nome + '"]');
    if (alvo) alvo.textContent = mensagem || "";
    var campo = campoCheckout(nome);
    if (campo) {
      campo.setAttribute("aria-invalid", mensagem ? "true" : "false");
      var caixa = campo.closest(".campo");
      if (caixa) caixa.classList.toggle("campo--erro", !!mensagem);
    }
    return !mensagem;
  }

  function limparErrosCheckout() {
    qsa("[data-checkout] [data-erro]").forEach(function (el) { el.textContent = ""; });
    qsa("[data-checkout] [aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    qsa("[data-checkout] .campo--erro").forEach(function (el) { el.classList.remove("campo--erro"); });
  }

  function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(valor || "").trim());
  }

  function cpfValido(valor) {
    var n = somenteDigitos(valor);
    if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
    var soma = 0;
    for (var i = 0; i < 9; i++) soma += Number(n.charAt(i)) * (10 - i);
    var d1 = (soma * 10) % 11;
    if (d1 === 10) d1 = 0;
    if (d1 !== Number(n.charAt(9))) return false;
    soma = 0;
    for (var j = 0; j < 10; j++) soma += Number(n.charAt(j)) * (11 - j);
    var d2 = (soma * 10) % 11;
    if (d2 === 10) d2 = 0;
    return d2 === Number(n.charAt(10));
  }

  function luhnValido(valor) {
    var n = somenteDigitos(valor);
    if (n.length < 13 || n.length > 19) return false;
    var soma = 0;
    var alternar = false;
    for (var i = n.length - 1; i >= 0; i--) {
      var d = Number(n.charAt(i));
      if (alternar) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      soma += d;
      alternar = !alternar;
    }
    return soma % 10 === 0;
  }

  function validadeCartaoValida(valor) {
    var achado = /^(\d{2})\/(\d{2})$/.exec(String(valor || "").trim());
    if (!achado) return false;
    var mes = Number(achado[1]);
    var ano = 2000 + Number(achado[2]);
    if (mes < 1 || mes > 12) return false;
    var hoje = new Date();
    return ano > hoje.getFullYear() || (ano === hoje.getFullYear() && mes >= hoje.getMonth() + 1);
  }

  function mascararTelefone(valor) {
    var n = somenteDigitos(valor).slice(0, 11);
    if (n.length <= 2) return n;
    if (n.length <= 6) return "(" + n.slice(0, 2) + ") " + n.slice(2);
    if (n.length <= 10) return "(" + n.slice(0, 2) + ") " + n.slice(2, 6) + "-" + n.slice(6);
    return "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
  }

  function mascararCpf(valor) {
    var n = somenteDigitos(valor).slice(0, 11);
    return n
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  }

  function mascararCep(valor) {
    var n = somenteDigitos(valor).slice(0, 8);
    return n.replace(/^(\d{5})(\d)/, "$1-$2");
  }

  function mascararCartao(valor) {
    var n = somenteDigitos(valor).slice(0, 19);
    return n.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function mascararValidade(valor) {
    var n = somenteDigitos(valor).slice(0, 4);
    return n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n;
  }

  function aplicarMascara(input, funcao) {
    if (!input) return;
    input.addEventListener("input", function () { input.value = funcao(input.value); });
  }

  function iniciarCheckout() {
    var form = qs("[data-checkout]");
    if (!form) return;

    if (!lerCarrinho().length) {
      location.replace("/carrinho/");
      return;
    }

    var passoAtual = 1;
    var freteEscolhido = null;
    var cepConsultado = "";

    function irPara(passo) {
      passoAtual = passo;
      qsa("[data-etapa]", form).forEach(function (painel) {
        var numeroPainel = Number(painel.getAttribute("data-etapa"));
        var ativa = numeroPainel === passo;
        painel.hidden = !ativa;
        painel.classList.toggle("ativa", ativa);
      });
      qsa("[data-etapa-indicador]").forEach(function (indicador) {
        var numeroIndicador = Number(indicador.getAttribute("data-etapa-indicador"));
        indicador.classList.toggle("ativa", numeroIndicador === passo);
        indicador.classList.toggle("concluida", numeroIndicador < passo);
        if (numeroIndicador === passo) indicador.setAttribute("aria-current", "step");
        else indicador.removeAttribute("aria-current");
      });
      var alvo = qs("[data-etapas]") || form;
      var topo = alvo.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, topo), behavior: "smooth" });
      limparErrosCheckout();
    }

    function validarPasso1() {
      limparErrosCheckout();
      var nome = String(campoCheckout("nome").value || "").trim();
      var email = String(campoCheckout("email").value || "").trim();
      var telefone = somenteDigitos(campoCheckout("telefone").value);
      var cpf = somenteDigitos(campoCheckout("cpf").value);
      var ok = true;

      if (nome.length < 3) ok = mostrarErroCampo("nome", "Digite seu nome completo.") && ok;
      else mostrarErroCampo("nome", "");
      if (!emailValido(email)) ok = mostrarErroCampo("email", "Informe um e-mail válido.") && ok;
      else mostrarErroCampo("email", "");
      if (telefone.length < 10 || telefone.length > 11) ok = mostrarErroCampo("telefone", "Informe um celular com DDD.") && ok;
      else mostrarErroCampo("telefone", "");
      if (!cpfValido(cpf)) ok = mostrarErroCampo("cpf", "Confira o CPF informado.") && ok;
      else mostrarErroCampo("cpf", "");

      if (!ok) {
        var primeiro = qs("[data-checkout] [aria-invalid='true']");
        if (primeiro) primeiro.focus();
      }
      return ok;
    }

    function validarPasso2() {
      limparErrosCheckout();
      var cep = somenteDigitos(campoCheckout("cep").value);
      var ok = true;

      if (cep.length !== 8) ok = mostrarErroCampo("cep", "Digite um CEP com 8 números.") && ok;
      else mostrarErroCampo("cep", "");
      if (String(campoCheckout("logradouro").value || "").trim().length < 3) ok = mostrarErroCampo("logradouro", "Informe o endereço.") && ok;
      else mostrarErroCampo("logradouro", "");
      if (!String(campoCheckout("numero").value || "").trim()) ok = mostrarErroCampo("numero", "Informe o número.") && ok;
      else mostrarErroCampo("numero", "");
      if (String(campoCheckout("bairro").value || "").trim().length < 2) ok = mostrarErroCampo("bairro", "Informe o bairro.") && ok;
      else mostrarErroCampo("bairro", "");
      if (String(campoCheckout("cidade").value || "").trim().length < 2) ok = mostrarErroCampo("cidade", "Informe a cidade.") && ok;
      else mostrarErroCampo("cidade", "");
      var uf = String(campoCheckout("uf").value || "").trim().toUpperCase();
      if (!/^[A-Z]{2}$/.test(uf)) ok = mostrarErroCampo("uf", "Use a sigla do estado.") && ok;
      else mostrarErroCampo("uf", "");

      var selecionado = qs('input[name="frete"]:checked', form);
      if (!selecionado) {
        ok = false;
        var vazio = qs("[data-frete-vazio]");
        if (vazio) {
          vazio.hidden = false;
          vazio.innerHTML = icone("caminhao") + " Informe o CEP e escolha uma opção de entrega.";
        }
      }

      if (!ok) {
        var primeiro = qs("[data-checkout] [aria-invalid='true']");
        if (primeiro) primeiro.focus();
        else if (selecionado == null) {
          var cepCampo = campoCheckout("cep");
          if (cepCampo) cepCampo.focus();
        }
      }
      return ok;
    }

    // checagens silenciosas: usadas no envio final para voltar
    // à etapa certa sem apagar os erros já visíveis na tela
    function passo1Completo() {
      var nome = String(campoCheckout("nome").value || "").trim();
      var telefone = somenteDigitos(campoCheckout("telefone").value);
      return nome.length >= 3 &&
        emailValido(campoCheckout("email").value) &&
        telefone.length >= 10 && telefone.length <= 11 &&
        cpfValido(campoCheckout("cpf").value);
    }

    function passo2Completo() {
      var uf = String(campoCheckout("uf").value || "").trim().toUpperCase();
      return somenteDigitos(campoCheckout("cep").value).length === 8 &&
        String(campoCheckout("logradouro").value || "").trim().length >= 3 &&
        String(campoCheckout("numero").value || "").trim() !== "" &&
        String(campoCheckout("bairro").value || "").trim().length >= 2 &&
        String(campoCheckout("cidade").value || "").trim().length >= 2 &&
        /^[A-Z]{2}$/.test(uf) &&
        !!qs('input[name="frete"]:checked', form);
    }

    function validarPasso3() {
      limparErrosCheckout();
      var ok = true;
      var aceite = campoCheckout("aceite");
      if (!aceite || !aceite.checked) {
        ok = false;
        var erroAceite = qs('[data-erro="aceite"]');
        if (erroAceite) erroAceite.textContent = "Aceite os termos para continuar.";
      }

      var pagamento = qs('input[name="pagamento"]:checked', form);
      var metodo = pagamento ? pagamento.value : "pix";
      if (metodo === "cartao") {
        var numero = campoCheckout("cartao-numero");
        var nomeCartao = campoCheckout("cartao-nome");
        var validade = campoCheckout("cartao-validade");
        var cvv = campoCheckout("cartao-cvv");
        if (!luhnValido(numero.value)) ok = mostrarErroCampo("cartao-numero", "Número de cartão inválido.") && ok;
        else mostrarErroCampo("cartao-numero", "");
        if (String(nomeCartao.value || "").trim().length < 3) ok = mostrarErroCampo("cartao-nome", "Informe o nome impresso no cartão.") && ok;
        else mostrarErroCampo("cartao-nome", "");
        if (!validadeCartaoValida(validade.value)) ok = mostrarErroCampo("cartao-validade", "Validade inválida (MM/AA).") && ok;
        else mostrarErroCampo("cartao-validade", "");
        if (somenteDigitos(cvv.value).length < 3) ok = mostrarErroCampo("cartao-cvv", "CVV incompleto.") && ok;
        else mostrarErroCampo("cartao-cvv", "");
      }

      if (!ok) {
        var primeiro = qs("[data-checkout] [aria-invalid='true']");
        if (primeiro) primeiro.focus();
      }
      return ok;
    }

    function renderizarItensCheckout() {
      var alvo = qs("[data-checkout-itens]");
      if (!alvo) return;
      alvo.innerHTML = lerCarrinho().map(function (item) {
        var p = produtoAtual(item.slug);
        if (!p) return "";
        var rotulo = p.variacoes && p.variacoes.rotulo && item.variacao ? p.variacoes.rotulo + ": " + item.variacao : item.variacao;
        return '<div class="item-checkout">' +
          '  <div class="item-checkout__midia"><img src="/assets/img/' + esc(p.imagem) + '-800.jpg" alt="" width="100" height="116" loading="lazy">' +
          '    <span class="item-checkout__qtd">' + item.qtd + "</span></div>" +
          '  <div class="item-checkout__info"><span class="item-checkout__nome">' + esc(p.nome) + "</span>" +
          (rotulo ? '<span class="item-checkout__variacao">' + esc(rotulo) + "</span>" : "") +
          "  </div>" +
          '  <span class="item-checkout__preco">' + brl(p.preco * item.qtd) + "</span>" +
          "</div>";
      }).join("");
    }

    function opcoesParcelas(total) {
      var maximo = Math.max(1, Math.min(loja.parcelasSemJuros, Math.floor(total / 2000)));
      var select = qs("[data-parcelas-select]");
      if (!select) return;
      var anterior = Number(select.value) || 1;
      var html = "";
      for (var i = 1; i <= maximo; i++) {
        var valor = Math.round(total / i);
        html += '<option value="' + i + '">' + i + "x de " + brl(valor) + (i === 1 ? " à vista" : " sem juros") + " · total " + brl(total) + "</option>";
      }
      select.innerHTML = html;
      select.value = String(Math.min(anterior, maximo));
    }

    function atualizarResumoCheckout() {
      var subtotal = subtotalAtual();
      var codigoSalvo = ler(CHAVES.cupom, "");
      var avaliado = codigoSalvo ? avaliarCupom(codigoSalvo, subtotal) : null;
      var cupom = avaliado && !avaliado.erro ? avaliado : null;
      var desconto = cupom ? cupom.desconto : 0;
      var frete = freteEscolhido ? freteEscolhido.valor : 0;
      var base = Math.max(0, subtotal - desconto + frete);

      var subtotalEl = qs("[data-checkout-subtotal]");
      if (subtotalEl) subtotalEl.textContent = brl(subtotal);
      var linhaDesconto = qs("[data-checkout-desconto-linha]");
      if (linhaDesconto) linhaDesconto.hidden = desconto <= 0;
      var descontoEl = qs("[data-checkout-desconto]");
      if (descontoEl) descontoEl.textContent = "− " + brl(desconto);
      var freteEl = qs("[data-checkout-frete]");
      if (freteEl) {
        if (!freteEscolhido) freteEl.textContent = "A calcular";
        else if (freteEscolhido.valor === 0) freteEl.textContent = "Grátis";
        else freteEl.textContent = brl(freteEscolhido.valor);
      }
      var totalEl = qs("[data-checkout-total]");
      if (totalEl) totalEl.textContent = brl(base);
      var parcelasEl = qs("[data-checkout-parcelas]");
      if (parcelasEl) parcelasEl.textContent = textoParcelas(base);
      var pixEl = qs("[data-checkout-pix-valor]");
      if (pixEl) pixEl.textContent = brl(precoPix(base));
      var economia = qs("[data-pix-economia]");
      if (economia) economia.textContent = brl(base - precoPix(base));
      opcoesParcelas(base);

      if (avaliado && avaliado.erro) mensagemCupom(avaliado.erro, "erro");
      else if (cupom) mensagemCupom(textoCupomAplicado(cupom), "ok");
    }

    function renderizarFretesCheckout(cep) {
      var calculo = opcoesDeFrete(cep, "checkout");
      var lista = qs("[data-frete-lista]");
      var vazio = qs("[data-frete-vazio]");
      if (!lista) return;
      if (vazio) vazio.hidden = true;

      var salvo = ler(CHAVES.frete, null);
      var preferido = salvo && salvo.cep === cep ? salvo.tipo : "padrao";
      var escolhido = false;

      lista.innerHTML = calculo.opcoes.map(function (opcao, indice) {
        var marcado = !escolhido && (opcao.tipo === preferido || (indice === 0 && preferido !== "expressa"));
        if (marcado) escolhido = true;
        return '<label class="opcao-frete">' +
          '<input type="radio" name="frete" value="' + opcao.tipo + '" data-valor="' + opcao.valor + '" data-prazo="' + esc(prazoTexto(opcao.prazo)) + '" data-nome="' + esc(opcao.nome) + '"' + (marcado ? " checked" : "") + ">" +
          '<span class="opcao-frete__info"><span class="opcao-frete__nome">' + esc(opcao.nome) + "</span>" +
          '<span class="opcao-frete__prazo">' + esc(prazoTexto(opcao.prazo)) + " · " + esc(calculo.regiao.regiao) + "</span></span>" +
          '<span class="opcao-frete__preco' + (opcao.valor === 0 ? " opcao-frete__preco--gratis" : "") + '">' + (opcao.valor === 0 ? "Grátis" : brl(opcao.valor)) + "</span></label>";
      }).join("");

      atualizarFreteEscolhido(calculo.regiao.regiao);
    }

    function atualizarFreteEscolhido(regiao) {
      var selecionado = qs('input[name="frete"]:checked', form);
      if (!selecionado) {
        freteEscolhido = null;
        return;
      }
      freteEscolhido = {
        tipo: selecionado.value,
        nome: selecionado.getAttribute("data-nome") || "Entrega",
        valor: Number(selecionado.getAttribute("data-valor")) || 0,
        prazo: selecionado.getAttribute("data-prazo") || "",
        regiao: regiao || "",
      };
      atualizarResumoCheckout();
    }

    function buscarEnderecoCheckout() {
      var cep = somenteDigitos(campoCheckout("cep").value);
      var status = qs("[data-cep-status]");
      if (cep.length !== 8) {
        if (status) status.textContent = "";
        return;
      }
      if (cep === cepConsultado) return;
      cepConsultado = cep;
      if (status) status.textContent = "Buscando endereço…";
      consultarCep(cep).then(function (dados) {
        if (dados && !dados.erro) {
          campoCheckout("logradouro").value = dados.logradouro || "";
          campoCheckout("bairro").value = dados.bairro || "";
          campoCheckout("cidade").value = dados.localidade || "";
          campoCheckout("uf").value = dados.uf || "";
          if (status) status.textContent = "Endereço encontrado. Confira o número e o complemento.";
          mostrarErroCampo("cep", "");
        } else if (dados && dados.erro) {
          if (status) status.textContent = "CEP não encontrado. Preencha o endereço manualmente.";
        } else if (status) {
          status.textContent = "Não foi possível consultar o CEP agora. Preencha manualmente.";
        }
        renderizarFretesCheckout(cep);
      });
    }

    // preenche com os dados da conta, se houver
    var conta = contaAtual();
    if (conta) {
      if (conta.nome && !campoCheckout("nome").value) campoCheckout("nome").value = conta.nome;
      if (conta.email && !campoCheckout("email").value) campoCheckout("email").value = conta.email;
      if (conta.telefone && !campoCheckout("telefone").value) campoCheckout("telefone").value = conta.telefone;
      var principal = (conta.enderecos || []).find(function (e) { return e.principal; }) || (conta.enderecos || [])[0];
      if (principal) {
        campoCheckout("cep").value = mascararCep(principal.cep || "");
        campoCheckout("logradouro").value = principal.logradouro || "";
        campoCheckout("numero").value = principal.numero || "";
        campoCheckout("complemento").value = principal.complemento || "";
        campoCheckout("bairro").value = principal.bairro || "";
        campoCheckout("cidade").value = principal.cidade || "";
        campoCheckout("uf").value = principal.uf || "";
        var cepPrincipal = somenteDigitos(principal.cep);
        if (cepPrincipal.length === 8) {
          cepConsultado = cepPrincipal;
          renderizarFretesCheckout(cepPrincipal);
        }
      }
    }

    renderizarItensCheckout();
    atualizarResumoCheckout();
    atualizarResumoCheckoutPagina = atualizarResumoCheckout;

    qsa("[data-proximo]", form).forEach(function (botao) {
      botao.addEventListener("click", function () {
        var passo = Number(botao.getAttribute("data-proximo"));
        if (passo === 1 && !validarPasso1()) return;
        if (passo === 2) {
          if (!validarPasso2()) return;
          atualizarFreteEscolhido();
        }
        irPara(passo + 1);
      });
    });

    qsa("[data-voltar]", form).forEach(function (botao) {
      botao.addEventListener("click", function () {
        var passo = Number(botao.getAttribute("data-voltar"));
        irPara(Math.max(1, passo - 1));
      });
    });

    form.addEventListener("change", function (evento) {
      if (evento.target.name === "frete") {
        var regiao = evento.target.closest(".opcao-frete");
        var rotulo = regiao ? regiao.querySelector(".opcao-frete__prazo") : null;
        atualizarFreteEscolhido(rotulo ? rotulo.textContent.split(" · ").pop() : "");
      }
      if (evento.target.name === "pagamento") {
        qsa(".metodo", form).forEach(function (metodo) {
          var radio = metodo.querySelector("input");
          metodo.classList.toggle("ativo", !!(radio && radio.checked));
        });
        qsa("[data-pagamento-painel]").forEach(function (painel) {
          painel.hidden = painel.getAttribute("data-pagamento-painel") !== evento.target.value;
        });
      }
    });

    qsa("[data-copiar-pix]").forEach(function (botao) { botao.hidden = true; });

    var cepCampo = campoCheckout("cep");
    if (cepCampo) {
      aplicarMascara(cepCampo, mascararCep);
      cepCampo.addEventListener("blur", buscarEnderecoCheckout);
      cepCampo.addEventListener("change", buscarEnderecoCheckout);
      cepCampo.addEventListener("input", function () {
        if (somenteDigitos(cepCampo.value).length === 8) buscarEnderecoCheckout();
      });
    }
    aplicarMascara(campoCheckout("telefone"), mascararTelefone);
    aplicarMascara(campoCheckout("cpf"), mascararCpf);
    aplicarMascara(campoCheckout("cartao-numero"), mascararCartao);
    aplicarMascara(campoCheckout("cartao-validade"), mascararValidade);
    aplicarMascara(campoCheckout("cartao-cvv"), function (v) { return somenteDigitos(v).slice(0, 4); });

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      if (passoAtual !== 3) return;
      if (!passo1Completo()) {
        irPara(1);
        validarPasso1();
        return;
      }
      if (!passo2Completo()) {
        irPara(2);
        validarPasso2();
        return;
      }
      if (!validarPasso3()) return;
      var pedido = montarPedido(form, freteEscolhido);
      if (!pedido) {
        toast("Não foi possível finalizar", "Confira os dados e tente novamente.", { icone: "relogio" });
        return;
      }
      var pedidos = ler(CHAVES.pedidos, []);
      if (!Array.isArray(pedidos)) pedidos = [];
      pedido.numero = proximoNumero(pedidos);
      if (pedido.pagamento === "pix") pedido.pixCodigo = gerarPix(pedido);
      if (pedido.pagamento === "boleto") pedido.boletoCodigo = gerarBoleto(pedido);
      pedidos.unshift(pedido);
      salvar(CHAVES.pedidos, pedidos);
      apagar(CHAVES.carrinho);
      apagar(CHAVES.cupom);
      apagar(CHAVES.frete);
      atualizarContadores();
      location.href = "/pedido-confirmado/?pedido=" + encodeURIComponent(pedido.numero);
    });
  }

  function montarPedido(form, frete) {
    var dados = new FormData(form);
    var carrinho = lerCarrinho();
    if (!carrinho.length) return null;
    var subtotal = subtotalAtual();
    var codigoSalvo = ler(CHAVES.cupom, "");
    var avaliado = codigoSalvo ? avaliarCupom(codigoSalvo, subtotal) : null;
    var cupom = avaliado && !avaliado.erro ? avaliado : null;
    var desconto = cupom ? cupom.desconto : 0;
    var freteValor = frete ? frete.valor : 0;
    var base = Math.max(0, subtotal - desconto + freteValor);
    var pagamento = String(dados.get("pagamento") || "pix");
    var descontoPix = pagamento === "pix" ? base - precoPix(base) : 0;
    var parcelas = pagamento === "cartao" ? Number(dados.get("cartao-parcelas")) || 1 : 1;

    var itens = carrinho.map(function (item) {
      var p = produtoAtual(item.slug);
      if (!p) return null;
      return {
        slug: p.slug,
        nome: p.nome,
        marca: p.marca,
        imagem: p.imagem,
        imagemAlt: p.imagemAlt,
        variacao: item.variacao || "",
        qtd: item.qtd,
        preco: p.preco,
      };
    }).filter(Boolean);
    if (!itens.length) return null;

    return {
      numero: "",
      criadoEm: new Date().toISOString(),
      nome: String(dados.get("nome") || "").trim(),
      email: String(dados.get("email") || "").trim().toLowerCase(),
      telefone: String(dados.get("telefone") || "").trim(),
      cpf: somenteDigitos(dados.get("cpf")),
      endereco: {
        cep: somenteDigitos(dados.get("cep")),
        logradouro: String(dados.get("logradouro") || "").trim(),
        numero: String(dados.get("numero") || "").trim(),
        complemento: String(dados.get("complemento") || "").trim(),
        bairro: String(dados.get("bairro") || "").trim(),
        cidade: String(dados.get("cidade") || "").trim(),
        uf: String(dados.get("uf") || "").trim().toUpperCase(),
        referencia: String(dados.get("referencia") || "").trim(),
      },
      entrega: {
        tipo: frete ? frete.tipo : "padrao",
        nome: frete ? frete.nome : "Entrega padrão",
        valor: freteValor,
        prazo: frete ? frete.prazo : "",
        regiao: frete ? frete.regiao : "",
      },
      pagamento: pagamento,
      parcelas: parcelas,
      cartaoFinal: pagamento === "cartao" ? somenteDigitos(dados.get("cartao-numero")).slice(-4) : "",
      cupom: cupom ? cupom.codigo : "",
      subtotal: subtotal,
      desconto: desconto,
      descontoPix: descontoPix,
      frete: freteValor,
      total: base - descontoPix,
      status: pagamento === "boleto" ? "boleto" : "pago",
      itens: itens,
      newsletter: dados.get("newsletter") === "on",
    };
  }

  function proximoNumero(pedidos) {
    var maior = 10420;
    pedidos.forEach(function (p) {
      var achado = String(p.numero || "").replace(/\D/g, "");
      if (achado) maior = Math.max(maior, Number(achado));
    });
    return "#CV" + String(maior + 1);
  }

  // ---------------------------------------------------------------- Pix e boleto

  function campoPix(id, valor) {
    var tamanho = String(valor).length;
    return id + (tamanho < 10 ? "0" : "") + tamanho + String(valor);
  }

  function crc16(payload) {
    var crc = 0xffff;
    for (var i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) {
        if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
        else crc <<= 1;
        crc &= 0xffff;
      }
    }
    var hex = crc.toString(16).toUpperCase();
    while (hex.length < 4) hex = "0" + hex;
    return hex;
  }

  function semAcento(texto) {
    return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function gerarPix(pedido) {
    var chave = loja.email;
    var nome = semAcento(loja.nome).toUpperCase().slice(0, 25);
    var cidade = "SAO PAULO";
    var valor = ((Number(pedido.total) || 0) / 100).toFixed(2);
    var txid = String(pedido.numero || "CASVIVA").replace(/[^A-Z0-9]/gi, "").slice(0, 20) || "CASVIVA";
    var conta = campoPix("00", "BR.GOV.BCB.PIX") + campoPix("01", chave);
    var payload = campoPix("00", "01") +
      campoPix("26", conta) +
      campoPix("52", "0000") +
      campoPix("53", "986") +
      campoPix("54", valor) +
      campoPix("58", "BR") +
      campoPix("59", nome) +
      campoPix("60", cidade) +
      campoPix("62", campoPix("05", txid)) +
      "6304";
    return payload + crc16(payload);
  }

  function gerarBoleto(pedido) {
    var semente = String(pedido.numero || "CV").replace(/\D/g, "") + String(pedido.total || 0);
    var digitos = "";
    var i = 0;
    while (digitos.length < 47) {
      var base = Number(semente.charAt(i % semente.length)) || 0;
      digitos += String((base + i * 7 + 3) % 10);
      i++;
    }
    digitos = digitos.slice(0, 47);
    return digitos.slice(0, 5) + "." + digitos.slice(5, 10) + " " +
      digitos.slice(10, 15) + "." + digitos.slice(15, 21) + " " +
      digitos.slice(21, 26) + "." + digitos.slice(26, 32) + " " +
      digitos.slice(32, 33) + " " + digitos.slice(33, 47);
  }

  // ---------------------------------------------------------------- status dos pedidos

  var STATUS_PEDIDO = {
    pendente: { rotulo: "Aguardando pagamento", classe: "pendente", passos: 1 },
    boleto: { rotulo: "Boleto gerado", classe: "boleto", passos: 1 },
    pago: { rotulo: "Pagamento aprovado", classe: "pago", passos: 2 },
    separacao: { rotulo: "Em separação", classe: "pendente", passos: 3 },
    enviado: { rotulo: "Enviado", classe: "enviado", passos: 4 },
    transporte: { rotulo: "Em transporte", classe: "transporte", passos: 5 },
    entregue: { rotulo: "Entregue", classe: "entregue", passos: 6 },
    cancelado: { rotulo: "Cancelado", classe: "cancelado", passos: 1 },
  };

  function statusPedido(pedido) {
    return STATUS_PEDIDO[pedido && pedido.status] || STATUS_PEDIDO.pendente;
  }

  function statusHtml(pedido) {
    var info = statusPedido(pedido);
    return '<span class="status status--' + info.classe + '">' + esc(info.rotulo) + "</span>";
  }

  function rotuloPagamento(pedido) {
    if (pedido.pagamento === "pix") return "Pix";
    if (pedido.pagamento === "boleto") return "Boleto bancário";
    if (pedido.pagamento === "cartao") return "Cartão de crédito" + (pedido.parcelas > 1 ? " · " + pedido.parcelas + "x" : "");
    return "Pagamento";
  }

  function enderecoEmLinha(endereco) {
    if (!endereco) return "";
    var linha1 = [endereco.logradouro, endereco.numero].filter(Boolean).join(", ");
    if (endereco.complemento) linha1 += " · " + endereco.complemento;
    var linha2 = [endereco.bairro, endereco.cidade && endereco.cidade + "/" + endereco.uf].filter(Boolean).join(" · ");
    var linha3 = endereco.cep ? "CEP " + String(endereco.cep).replace(/^(\d{5})(\d{3})$/, "$1-$2") : "";
    return [linha1, linha2, linha3].filter(Boolean).join(" — ");
  }

  function pedidosDoEmail(email) {
    var alvo = String(email || "").trim().toLowerCase();
    if (!alvo) return [];
    var lista = ler(CHAVES.pedidos, []);
    if (!Array.isArray(lista)) return [];
    return lista.filter(function (p) { return String(p.email || "").toLowerCase() === alvo; });
  }

  // ---------------------------------------------------------------- confirmação

  function iniciarConfirmacao() {
    var conteudo = qs("[data-confirmacao-conteudo]");
    if (!conteudo) return;

    var carregando = qs("[data-confirmacao-carregando]");
    var vazio = qs("[data-confirmacao-vazio]");
    var params = new URLSearchParams(location.search);
    var numero = params.get("pedido") || location.hash.replace(/^#/, "");
    var alvo = String(numero || "").replace(/\s+/g, "").toUpperCase();

    var pedidos = ler(CHAVES.pedidos, []);
    var pedido = Array.isArray(pedidos)
      ? pedidos.find(function (p) { return String(p.numero || "").replace(/\s+/g, "").toUpperCase() === alvo; })
      : null;

    if (carregando) carregando.hidden = true;
    if (!pedido) {
      if (vazio) vazio.hidden = false;
      return;
    }

    conteudo.hidden = false;
    var primeiro = qs("[data-pedido-primeiro-nome]");
    if (primeiro) primeiro.textContent = primeiroNome(pedido.nome);
    var email = qs("[data-pedido-email]");
    if (email) email.textContent = pedido.email;
    var numeroEl = qs("[data-pedido-numero]");
    if (numeroEl) numeroEl.textContent = pedido.numero;
    var nomeEl = qs("[data-pedido-nome]");
    if (nomeEl) nomeEl.textContent = pedido.nome;
    var enderecoEl = qs("[data-pedido-endereco]");
    if (enderecoEl) enderecoEl.textContent = enderecoEmLinha(pedido.endereco);
    var prazoEl = qs("[data-pedido-prazo]");
    if (prazoEl) prazoEl.textContent = pedido.entrega && pedido.entrega.prazo ? "Estimativa: " + pedido.entrega.prazo : "Estimativa enviada por e-mail";
    var freteEl = qs("[data-pedido-frete]");
    if (freteEl) {
      freteEl.textContent = (pedido.entrega ? pedido.entrega.nome : "Entrega") + " · " +
        (pedido.frete === 0 ? "Grátis" : brl(pedido.frete)) +
        (pedido.entrega && pedido.entrega.regiao ? " · " + pedido.entrega.regiao : "");
    }

    var itens = qs("[data-pedido-itens]");
    if (itens) {
      itens.innerHTML = (pedido.itens || []).map(function (item) {
        var rotulo = item.variacao ? " · " + item.variacao : "";
        return '<div class="item-pedido">' +
          '<img src="/assets/img/' + esc(item.imagem) + '-800.jpg" alt="" width="52" height="60" loading="lazy">' +
          '<div class="item-pedido__info"><strong>' + esc(item.nome) + "</strong><span>" + item.qtd + " × " + brl(item.preco) + esc(rotulo) + "</span></div>" +
          '<span class="item-pedido__preco">' + brl(item.preco * item.qtd) + "</span></div>";
      }).join("");
    }

    var subtotalEl = qs("[data-pedido-subtotal]");
    if (subtotalEl) subtotalEl.textContent = brl(pedido.subtotal);
    var desconto = (Number(pedido.desconto) || 0) + (Number(pedido.descontoPix) || 0);
    var linhaDesconto = qs("[data-pedido-desconto-linha]");
    if (linhaDesconto) linhaDesconto.hidden = desconto <= 0;
    var descontoEl = qs("[data-pedido-desconto]");
    if (descontoEl) descontoEl.textContent = "− " + brl(desconto);
    var freteValorEl = qs("[data-pedido-frete-valor]");
    if (freteValorEl) freteValorEl.textContent = pedido.frete === 0 ? "Grátis" : brl(pedido.frete);
    var totalEl = qs("[data-pedido-total]");
    if (totalEl) totalEl.textContent = brl(pedido.total);

    var blocoPix = qs("[data-pix-bloco]");
    var blocoCartao = qs("[data-cartao-bloco]");
    var blocoBoleto = qs("[data-boleto-bloco]");
    if (blocoPix) blocoPix.hidden = pedido.pagamento !== "pix";
    if (blocoCartao) blocoCartao.hidden = pedido.pagamento !== "cartao";
    if (blocoBoleto) blocoBoleto.hidden = pedido.pagamento !== "boleto";

    if (pedido.pagamento === "pix") {
      var codigo = pedido.pixCodigo || gerarPix(pedido);
      var caixaPix = qs("[data-pix-codigo]");
      if (caixaPix) caixaPix.value = codigo;
      var valorPix = qs("[data-pix-valor]");
      if (valorPix) valorPix.textContent = brl(pedido.total);
      var copiarPix = qs("[data-copiar-pix]");
      if (copiarPix) {
        copiarPix.hidden = false;
        copiarPix.addEventListener("click", function () { copiarTexto(codigo, "Código Pix copiado."); });
      }
      if (caixaPix) caixaPix.addEventListener("click", function () { caixaPix.select(); });
    }

    if (pedido.pagamento === "boleto") {
      var linha = pedido.boletoCodigo || gerarBoleto(pedido);
      var codigoBoleto = qs("[data-boleto-codigo]");
      if (codigoBoleto) codigoBoleto.textContent = linha;
      var copiarBoleto = qs("[data-copiar-boleto]");
      if (copiarBoleto) copiarBoleto.addEventListener("click", function () { copiarTexto(linha, "Linha digitável copiada."); });
    }

    var rastrear = qs(".confirmacao__lateral a[href='/rastreamento/']");
    if (rastrear) {
      rastrear.href = "/rastreamento/?pedido=" + encodeURIComponent(pedido.numero) + "&email=" + encodeURIComponent(pedido.email);
    }
  }

  function copiarTexto(texto, mensagem) {
    function alternativa() {
      try {
        var area = document.createElement("textarea");
        area.value = texto;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
        toast("Copiado", mensagem, { icone: "check" });
      } catch (erro) {
        toast("Copie manualmente", "Selecione o texto e use Ctrl+C.", { icone: "relogio" });
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () {
        toast("Copiado", mensagem, { icone: "check" });
      }).catch(alternativa);
    } else {
      alternativa();
    }
  }

  // ---------------------------------------------------------------- conta

  function contaAtual() {
    var conta = ler(CHAVES.conta, null);
    if (!conta || typeof conta !== "object" || !conta.logado) return null;
    return conta;
  }

  function salvarConta(conta) {
    salvar(CHAVES.conta, conta);
  }

  function voltarSeguro() {
    var voltar = new URLSearchParams(location.search).get("voltar");
    if (voltar && voltar.charAt(0) === "/" && voltar.charAt(1) !== "/") return voltar;
    return null;
  }

  function iniciarConta() {
    var raiz = qs(".pagina-conta");
    if (!raiz) return;

    var deslogada = qs("[data-conta-deslogada]");
    var logada = qs("[data-conta-logada]");
    var formEntrar = qs("[data-form-entrar]");
    var formCriar = qs("[data-form-criar]");

    function alternarAba(nome) {
      qsa("[data-aba]").forEach(function (botao) {
        var ativa = botao.getAttribute("data-aba") === nome;
        botao.classList.toggle("ativa", ativa);
        botao.setAttribute("aria-selected", ativa ? "true" : "false");
      });
      qsa("[data-painel-aba]").forEach(function (painel) {
        painel.hidden = painel.getAttribute("data-painel-aba") !== nome;
      });
    }

    qsa("[data-aba]").forEach(function (botao) {
      botao.addEventListener("click", function () { alternarAba(botao.getAttribute("data-aba")); });
    });

    function abrirPainelConta(nome) {
      qsa("[data-painel]", raiz).forEach(function (botao) {
        botao.classList.toggle("ativo", botao.getAttribute("data-painel") === nome);
      });
      qsa("[data-conta-painel]", raiz).forEach(function (painel) {
        painel.hidden = painel.getAttribute("data-conta-painel") !== nome;
      });
    }

    qsa("[data-painel]", raiz).forEach(function (botao) {
      botao.addEventListener("click", function () { abrirPainelConta(botao.getAttribute("data-painel")); });
    });

    function renderizarConta() {
      var conta = contaAtual();
      if (deslogada) deslogada.hidden = !!conta;
      if (logada) logada.hidden = !conta;
      if (!conta) {
        var anterior = ler(CHAVES.conta, null);
        if (anterior && anterior.email && formEntrar) {
          var campo = formEntrar.querySelector("input[name='email']");
          if (campo) campo.value = anterior.email;
        }
        return;
      }

      var nome = qs("[data-conta-nome]", raiz);
      if (nome) nome.textContent = primeiroNome(conta.nome);
      var email = qs("[data-conta-email]", raiz);
      if (email) email.textContent = conta.email;

      var dados = qs("[data-form-dados]", raiz);
      if (dados) {
        dados.elements.namedItem("nome").value = conta.nome || "";
        dados.elements.namedItem("email").value = conta.email || "";
        dados.elements.namedItem("telefone").value = conta.telefone || "";
        dados.elements.namedItem("nascimento").value = conta.nascimento || "";
        dados.elements.namedItem("newsletter").checked = !!conta.newsletter;
      }

      renderizarPedidosConta(conta);
      renderizarEnderecos(conta);
    }

    function renderizarPedidosConta(conta) {
      var lista = qs("[data-pedidos-lista]", raiz);
      var vazio = qs("[data-pedidos-vazio]", raiz);
      if (!lista) return;
      var pedidos = pedidosDoEmail(conta.email);
      lista.innerHTML = pedidos.map(function (pedido) {
        var itens = pedido.itens || [];
        var unidades = itens.reduce(function (soma, item) { return soma + item.qtd; }, 0);
        var thumbs = itens.slice(0, 5).map(function (item) {
          return '<img src="/assets/img/' + esc(item.imagem) + '-800.jpg" alt="' + esc(item.nome) + '" width="44" height="52" loading="lazy">';
        }).join("");
        return '<article class="pedido-card">' +
          '<div class="pedido-card__topo"><div><span class="pedido-card__numero">' + esc(pedido.numero) + "</span>" +
          '<span class="pedido-card__data">' + dinheiroData(pedido.criadoEm) + " · " + unidades + (unidades === 1 ? " item" : " itens") + "</span></div>" +
          statusHtml(pedido) + "</div>" +
          '<div class="pedido-card__itens">' + thumbs + "</div>" +
          '<div class="pedido-card__rodape"><span class="pedido-card__total">' + brl(pedido.total) + "<small>" + esc(rotuloPagamento(pedido)) + "</small></span>" +
          '<a class="btn btn--contorno" href="/rastreamento/?pedido=' + encodeURIComponent(pedido.numero) + "&email=" + encodeURIComponent(pedido.email) + '">Rastrear pedido</a></div>' +
          "</article>";
      }).join("");
      if (vazio) vazio.hidden = pedidos.length > 0;
    }

    function renderizarEnderecos(conta) {
      var lista = qs("[data-enderecos-lista]", raiz);
      if (!lista) return;
      var enderecos = conta.enderecos || [];
      if (!enderecos.length) {
        lista.innerHTML = '<p class="endereco-card__texto">Nenhum endereço salvo ainda. Cadastre um para agilizar as próximas compras.</p>';
        return;
      }
      lista.innerHTML = enderecos.map(function (endereco, indice) {
        return '<div class="endereco-card" data-endereco="' + indice + '">' +
          '<div class="endereco-card__texto"><strong>' + esc(endereco.logradouro) + ", " + esc(endereco.numero) + "</strong>" +
          (endereco.principal ? '<span class="endereco-tag">Principal</span>' : "") +
          "<br>" + esc([endereco.complemento, endereco.bairro].filter(Boolean).join(" · ")) +
          "<br>" + esc(endereco.cidade) + "/" + esc(endereco.uf) + " · CEP " + esc(mascararCep(endereco.cep)).replace("CEP ", "") +
          "</div>" +
          '<div class="endereco-card__acoes">' +
          '<button type="button" data-editar-endereco="' + indice + '">Editar</button>' +
          '<button type="button" data-remover-endereco="' + indice + '">Remover</button>' +
          (!endereco.principal ? '<button type="button" data-principal-endereco="' + indice + '">Tornar principal</button>' : "") +
          "</div></div>";
      }).join("");

      qsa("[data-editar-endereco]", lista).forEach(function (botao) {
        botao.addEventListener("click", function () {
          var indice = Number(botao.getAttribute("data-editar-endereco"));
          abrirFormEndereco(indice);
        });
      });
      qsa("[data-remover-endereco]", lista).forEach(function (botao) {
        botao.addEventListener("click", function () {
          var indice = Number(botao.getAttribute("data-remover-endereco"));
          var contaAtualizada = contaAtual();
          if (!contaAtualizada) return;
          if (!window.confirm("Remover este endereço?")) return;
          contaAtualizada.enderecos.splice(indice, 1);
          if (!contaAtualizada.enderecos.some(function (e) { return e.principal; }) && contaAtualizada.enderecos[0]) {
            contaAtualizada.enderecos[0].principal = true;
          }
          salvarConta(contaAtualizada);
          renderizarConta();
          toast("Endereço removido", "Sua lista foi atualizada.", { icone: "local" });
        });
      });
      qsa("[data-principal-endereco]", lista).forEach(function (botao) {
        botao.addEventListener("click", function () {
          var indice = Number(botao.getAttribute("data-principal-endereco"));
          var contaAtualizada = contaAtual();
          if (!contaAtualizada) return;
          contaAtualizada.enderecos.forEach(function (e, i) { e.principal = i === indice; });
          salvarConta(contaAtualizada);
          renderizarConta();
          toast("Endereço principal atualizado", "", { icone: "check" });
        });
      });
    }

    var formEndereco = qs("[data-form-endereco]", raiz);
    var indiceEdicao = -1;

    function abrirFormEndereco(indice) {
      if (!formEndereco) return;
      var conta = contaAtual();
      if (!conta) return;
      indiceEdicao = typeof indice === "number" ? indice : -1;
      formEndereco.reset();
      var endereco = indiceEdicao > -1 ? conta.enderecos[indiceEdicao] : null;
      if (endereco) {
        ["cep", "logradouro", "numero", "complemento", "bairro", "cidade", "uf"].forEach(function (campo) {
          var el = formEndereco.elements.namedItem(campo);
          if (el) el.value = endereco[campo] || "";
        });
        formEndereco.elements.namedItem("principal").checked = !!endereco.principal;
      }
      formEndereco.hidden = false;
      formEndereco.scrollIntoView({ behavior: "smooth", block: "center" });
      var primeiro = formEndereco.querySelector("input[name='cep']");
      if (primeiro) window.setTimeout(function () { primeiro.focus(); }, 300);
    }

    var novoEndereco = qs("[data-novo-endereco]", raiz);
    if (novoEndereco) novoEndereco.addEventListener("click", function () { abrirFormEndereco(-1); });
    var cancelarEndereco = qs("[data-cancelar-endereco]", raiz);
    if (cancelarEndereco) cancelarEndereco.addEventListener("click", function () {
      formEndereco.hidden = true;
      formEndereco.reset();
      indiceEdicao = -1;
    });

    var cepEndereco = formEndereco ? formEndereco.elements.namedItem("cep") : null;
    if (cepEndereco) {
      aplicarMascara(cepEndereco, mascararCep);
      cepEndereco.addEventListener("blur", function () {
        var cep = somenteDigitos(cepEndereco.value);
        if (cep.length !== 8) return;
        consultarCep(cep).then(function (dados) {
          if (!dados || dados.erro) return;
          formEndereco.elements.namedItem("logradouro").value = dados.logradouro || "";
          formEndereco.elements.namedItem("bairro").value = dados.bairro || "";
          formEndereco.elements.namedItem("cidade").value = dados.localidade || "";
          formEndereco.elements.namedItem("uf").value = dados.uf || "";
        });
      });
    }

    if (formEndereco) {
      formEndereco.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var conta = contaAtual();
        if (!conta) return;
        var dados = new FormData(formEndereco);
        var endereco = {
          cep: somenteDigitos(dados.get("cep")),
          logradouro: String(dados.get("logradouro") || "").trim(),
          numero: String(dados.get("numero") || "").trim(),
          complemento: String(dados.get("complemento") || "").trim(),
          bairro: String(dados.get("bairro") || "").trim(),
          cidade: String(dados.get("cidade") || "").trim(),
          uf: String(dados.get("uf") || "").trim().toUpperCase(),
          principal: dados.get("principal") === "on",
        };
        if (endereco.cep.length !== 8 || !endereco.logradouro || !endereco.numero || !endereco.cidade || !/^[A-Z]{2}$/.test(endereco.uf)) {
          toast("Quase lá", "Preencha CEP, endereço, número, cidade e UF.", { icone: "relogio" });
          return;
        }
        conta.enderecos = conta.enderecos || [];
        if (indiceEdicao > -1) conta.enderecos[indiceEdicao] = endereco;
        else conta.enderecos.push(endereco);

        var principal = endereco.principal;
        if (!conta.enderecos.some(function (e) { return e.principal; })) {
          conta.enderecos[0].principal = true;
          principal = true;
        }
        if (principal) {
          conta.enderecos.forEach(function (e) { e.principal = e === endereco || (indiceEdicao > -1 && e === conta.enderecos[indiceEdicao]); });
          conta.enderecos[indiceEdicao > -1 ? indiceEdicao : conta.enderecos.length - 1].principal = true;
        }
        salvarConta(conta);
        renderizarConta();
        formEndereco.hidden = true;
        formEndereco.reset();
        indiceEdicao = -1;
        toast("Endereço salvo", "Já pode usar nas próximas compras.", { icone: "local" });
      });
    }

    if (formEntrar) {
      formEntrar.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var dados = new FormData(formEntrar);
        var email = String(dados.get("email") || "").trim().toLowerCase();
        var senha = String(dados.get("senha") || "");
        var erro = qs("[data-erro-login]", raiz);
        if (!emailValido(email)) {
          if (erro) erro.textContent = "Informe um e-mail válido.";
          return;
        }
        if (senha.length < 4) {
          if (erro) erro.textContent = "A senha precisa ter 4 caracteres ou mais.";
          return;
        }
        if (erro) erro.textContent = "";
        var existente = ler(CHAVES.conta, null);
        var conta = existente && existente.email && existente.email.toLowerCase() === email
          ? existente
          : {
              nome: email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, function (l) { return l.toUpperCase(); }),
              email: email,
              telefone: "",
              nascimento: "",
              newsletter: false,
              enderecos: [],
            };
        conta.logado = true;
        salvarConta(conta);
        renderizarConta();
        toast("Bem-vindo de volta", primeiroNome(conta.nome), { icone: "usuario" });
        var voltar = voltarSeguro();
        if (voltar) location.href = voltar;
      });
    }

    if (formCriar) {
      formCriar.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var dados = new FormData(formCriar);
        var nome = String(dados.get("nome") || "").trim();
        var email = String(dados.get("email") || "").trim().toLowerCase();
        var senha = String(dados.get("senha") || "");
        var erro = qs("[data-erro-criar]", raiz);
        if (nome.length < 3) {
          if (erro) erro.textContent = "Digite seu nome completo.";
          return;
        }
        if (!emailValido(email)) {
          if (erro) erro.textContent = "Informe um e-mail válido.";
          return;
        }
        if (senha.length < 4) {
          if (erro) erro.textContent = "A senha precisa ter 4 caracteres ou mais.";
          return;
        }
        if (dados.get("aceite") !== "on") {
          if (erro) erro.textContent = "Aceite a política de privacidade para criar a conta.";
          return;
        }
        if (erro) erro.textContent = "";
        var conta = {
          logado: true,
          nome: nome,
          email: email,
          telefone: String(dados.get("telefone") || "").trim(),
          nascimento: "",
          newsletter: false,
          enderecos: [],
          criadoEm: new Date().toISOString(),
        };
        salvarConta(conta);
        renderizarConta();
        toast("Conta criada", "Que bom ter você por aqui, " + primeiroNome(nome) + ".", { icone: "coracao" });
        var voltar = voltarSeguro();
        if (voltar) location.href = voltar;
      });
    }

    var sair = qs("[data-sair]", raiz);
    if (sair) {
      sair.addEventListener("click", function () {
        var conta = ler(CHAVES.conta, null);
        if (conta) {
          conta.logado = false;
          salvarConta(conta);
        }
        renderizarConta();
        toast("Você saiu da conta", "Seus dados continuam salvos neste navegador.", { icone: "usuario" });
      });
    }

    var formDados = qs("[data-form-dados]", raiz);
    if (formDados) {
      formDados.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var conta = contaAtual();
        if (!conta) return;
        var dados = new FormData(formDados);
        var novoEmail = String(dados.get("email") || "").trim().toLowerCase();
        var nome = String(dados.get("nome") || "").trim();
        if (nome.length < 3 || !emailValido(novoEmail)) {
          toast("Confira os dados", "Nome e e-mail precisam estar completos.", { icone: "relogio" });
          return;
        }
        var emailAntigo = conta.email;
        conta.nome = nome;
        conta.email = novoEmail;
        conta.telefone = String(dados.get("telefone") || "").trim();
        conta.nascimento = String(dados.get("nascimento") || "");
        conta.newsletter = dados.get("newsletter") === "on";
        salvarConta(conta);

        if (emailAntigo && emailAntigo.toLowerCase() !== novoEmail) {
          var pedidos = ler(CHAVES.pedidos, []);
          if (Array.isArray(pedidos)) {
            pedidos.forEach(function (p) {
              if (String(p.email || "").toLowerCase() === emailAntigo.toLowerCase()) p.email = novoEmail;
            });
            salvar(CHAVES.pedidos, pedidos);
          }
        }
        renderizarConta();
        toast("Dados atualizados", "Tudo certo por aqui.", { icone: "check" });
      });
    }

    // hashtag para abrir uma seção específica (ex.: /conta/#pedidos)
    if (location.hash) {
      var secao = location.hash.replace("#", "");
      if (qs('[data-painel="' + secao + '"]', raiz)) abrirPainelConta(secao);
    }

    renderizarConta();
  }

  // ---------------------------------------------------------------- favoritos

  function iniciarFavoritos() {
    var grade = qs("[data-favoritos-grade]");
    if (!grade) return;

    function renderizarFavoritos() {
      var favoritos = lerFavoritos();
      var vazio = qs("[data-favoritos-vazio]");
      var sugestoes = qs("[data-favoritos-sugestoes]");
      var resumo = qs("[data-favoritos-resumo]");
      grade.innerHTML = favoritos.map(function (slug) {
        var p = porSlug.get(slug);
        return p ? cardProdutoHtml(p) : "";
      }).join("");
      grade.hidden = favoritos.length === 0;
      if (vazio) vazio.hidden = favoritos.length > 0;
      if (sugestoes) sugestoes.hidden = favoritos.length > 0;
      if (resumo) {
        resumo.textContent = favoritos.length
          ? favoritos.length + (favoritos.length === 1 ? " peça salva" : " peças salvas") + " para decidir com calma."
          : "As peças que você salvar aparecem aqui.";
      }
      sincronizarBotoesFavorito();
    }

    aoMudarFavoritos = renderizarFavoritos;
    renderizarFavoritos();
  }

  // ---------------------------------------------------------------- rastreamento

  function normalizarNumeroPedido(valor) {
    return String(valor || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  }

  function iniciarRastreio() {
    var form = qs("[data-rastreio-form]");
    if (!form) return;
    var resultado = qs("[data-rastreio-resultado]");
    var erro = qs("[data-rastreio-erro]");

    var params = new URLSearchParams(location.search);
    if (params.get("pedido")) form.elements.namedItem("pedido").value = params.get("pedido");
    if (params.get("email")) form.elements.namedItem("email").value = params.get("email");

    function renderizarRastreio(pedido) {
      if (!resultado) return;
      var info = statusPedido(pedido);
      var passos = ["Pedido recebido", "Pagamento aprovado", "Em separação", "Enviado", "Em transporte", "Entregue"];
      var feitos = info.passos;
      var itens = pedido.itens || [];
      resultado.innerHTML = '<div class="pedido-rastreio">' +
        '<div class="pedido-rastreio__topo"><div><span class="pedido-rastreio__numero">' + esc(pedido.numero) + "</span>" +
        '<span class="pedido-rastreio__data">Feito em ' + dinheiroData(pedido.criadoEm) + " · " + itens.length + (itens.length === 1 ? " produto" : " produtos") + "</span></div>" +
        statusHtml(pedido) + "</div>" +
        '<div class="pedido-rastreio__grade">' +
        '<div class="pedido-rastreio__bloco"><strong>Entrega</strong><p><strong>' + esc(pedido.nome) + "</strong><br>" + esc(enderecoEmLinha(pedido.endereco)) + "</p></div>" +
        '<div class="pedido-rastreio__bloco"><strong>Pagamento</strong><p>' + esc(rotuloPagamento(pedido)) + " · " + brl(pedido.total) + "<br>" + esc(info.rotulo) + "</p></div>" +
        '<div class="pedido-rastreio__bloco"><strong>Frete</strong><p>' + esc(pedido.entrega ? pedido.entrega.nome : "Entrega") + "<br>" + (pedido.entrega && pedido.entrega.prazo ? esc(pedido.entrega.prazo) : "Prazo enviado por e-mail") + "</p></div>" +
        '<div class="pedido-rastreio__bloco"><strong>Itens</strong><p>' + itens.slice(0, 3).map(function (item) { return esc(item.nome) + " (" + item.qtd + ")"; }).join("<br>") + (itens.length > 3 ? "<br>e mais " + (itens.length - 3) : "") + "</p></div>" +
        "</div>" +
        '<div class="pedido-rastreio__passos">' + passos.map(function (texto, indice) {
          return '<span class="passo-rastreio' + (indice < feitos ? " feito" : "") + '">' + texto + "</span>";
        }).join("") + "</div>" +
        '<div class="pedido-rastreio__acoes"><a class="btn btn--contorno" href="/conta/#pedidos">Ver na minha conta</a>' +
        '<a class="btn btn--fantasma" href="https://wa.me/' + loja.whatsapp + '" target="_blank" rel="noopener">' + icone("whatsapp") + " Falar com a gente</a></div>" +
        "</div>";
      resultado.hidden = false;
      resultado.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function consultar() {
      var numero = form.elements.namedItem("pedido").value;
      var email = form.elements.namedItem("email").value;
      if (erro) erro.textContent = "";
      if (resultado) resultado.hidden = true;
      if (!normalizarNumeroPedido(numero)) {
        if (erro) erro.textContent = "Informe o número do pedido.";
        form.elements.namedItem("pedido").focus();
        return;
      }
      if (!emailValido(email)) {
        if (erro) erro.textContent = "Informe o e-mail usado na compra.";
        form.elements.namedItem("email").focus();
        return;
      }
      var alvo = normalizarNumeroPedido(numero);
      var pedidos = ler(CHAVES.pedidos, []);
      var pedido = Array.isArray(pedidos) ? pedidos.find(function (p) {
        return normalizarNumeroPedido(p.numero) === alvo && String(p.email || "").toLowerCase() === String(email).trim().toLowerCase();
      }) : null;
      if (!pedido) {
        if (erro) erro.textContent = "Não encontramos um pedido com esse número e e-mail. Confira os dados ou fale com a gente.";
        return;
      }
      renderizarRastreio(pedido);
    }

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      consultar();
    });
  }

  // ---------------------------------------------------------------- FAQ

  function iniciarFaq() {
    var grupos = qs("[data-faq-grupos]");
    if (!grupos) return;
    var busca = qs("[data-faq-busca]");
    var botoes = qsa("[data-faq-categoria]");
    var vazio = qs("[data-faq-vazio]");
    var categoriaAtiva = "";

    function filtrar() {
      var termo = normalizar(busca ? busca.value : "");
      var visiveis = 0;
      qsa("[data-faq-grupo]", grupos).forEach(function (grupo) {
        var categoria = grupo.getAttribute("data-faq-grupo") || "";
        var combinaCategoria = !categoriaAtiva || categoria === categoriaAtiva;
        var visiveisNoGrupo = 0;
        qsa("[data-faq-item]", grupo).forEach(function (item) {
          var texto = normalizar(item.textContent);
          var combinaTexto = !termo || texto.indexOf(termo) > -1;
          var mostrar = combinaCategoria && combinaTexto;
          item.hidden = !mostrar;
          if (mostrar) {
            visiveisNoGrupo++;
            if (termo) item.setAttribute("open", "open");
            else item.removeAttribute("open");
          }
        });
        grupo.hidden = visiveisNoGrupo === 0;
        visiveis += visiveisNoGrupo;
      });
      if (vazio) vazio.hidden = visiveis > 0;
    }

    if (busca) busca.addEventListener("input", filtrar);

    botoes.forEach(function (botao) {
      botao.addEventListener("click", function () {
        var valor = botao.getAttribute("data-faq-categoria") || "";
        categoriaAtiva = categoriaAtiva === valor ? "" : valor;
        botoes.forEach(function (b) {
          var ativo = b === botao && categoriaAtiva === valor;
          b.classList.toggle("ativo", ativo);
          b.setAttribute("aria-pressed", ativo ? "true" : "false");
        });
        filtrar();
      });
    });

    filtrar();
  }

  // ---------------------------------------------------------------- formulários gerais

  function iniciarNewsletter() {
    qsa("[data-newsletter]").forEach(function (form) {
      form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var input = form.querySelector("input[name='email']");
        var sucesso = form.querySelector("[data-newsletter-sucesso]");
        var email = input ? input.value.trim().toLowerCase() : "";
        if (!emailValido(email)) {
          toast("Confira o e-mail", "Digite um endereço válido para receber a carta.", { icone: "email" });
          if (input) input.focus();
          return;
        }
        var lista = ler(CHAVES.newsletter, []);
        if (!Array.isArray(lista)) lista = [];
        var jaAssina = lista.indexOf(email) > -1;
        if (!jaAssina) {
          lista.push(email);
          salvar(CHAVES.newsletter, lista);
        }
        if (sucesso) {
          sucesso.hidden = false;
          if (jaAssina) sucesso.textContent = "Você já está na lista. A próxima carta chega em breve.";
        }
        form.reset();
        toast(jaAssina ? "Você já assina" : "Inscrição confirmada", "Bem-vindo à carta da Casa Viva.", { icone: "email" });
      });
    });
  }

  function iniciarContato() {
    var form = qs("[data-contato-form]");
    if (!form) return;
    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var dados = new FormData(form);
      var nome = String(dados.get("nome") || "").trim();
      var email = String(dados.get("email") || "").trim();
      var assunto = String(dados.get("assunto") || "").trim();
      var mensagem = String(dados.get("mensagem") || "").trim();
      if (nome.length < 2 || !emailValido(email) || !assunto || mensagem.length < 10) {
        toast("Quase lá", "Preencha nome, e-mail, assunto e uma mensagem com pelo menos 10 caracteres.", { icone: "relogio" });
        return;
      }
      var sucesso = qs("[data-contato-sucesso]", form);
      if (sucesso) sucesso.hidden = false;
      form.reset();
      toast("Mensagem enviada", "Respondemos em até 1 dia útil.", { icone: "email" });
    });
  }

  // ---------------------------------------------------------------- menu mobile

  function iniciarMenuMobile() {
    var menu = qs("[data-menu-mobile]");
    if (!menu) return;
    var botaoAbrir = qsa("[data-abrir-menu]");
    var botoesFechar = qsa("[data-fechar-menu]");

    function abrir() {
      menu.hidden = false;
      document.body.classList.add("travado");
      botaoAbrir.forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
      var fechar = qs(".menu-mobile__topo [data-fechar-menu]", menu);
      if (fechar) window.setTimeout(function () { fechar.focus(); }, 60);
    }

    function fechar() {
      menu.hidden = true;
      document.body.classList.remove("travado");
      botaoAbrir.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    }

    botaoAbrir.forEach(function (b) { b.addEventListener("click", abrir); });
    botoesFechar.forEach(function (b) { b.addEventListener("click", fechar); });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && !menu.hidden) fechar();
    });

    menu.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) fechar();
    });
  }

  // ---------------------------------------------------------------- ações globais

  function iniciarAcoesGlobais() {
    document.addEventListener("click", function (evento) {
      var favorito = evento.target.closest("[data-favorito]");
      if (favorito) {
        evento.preventDefault();
        alternarFavorito(favorito.getAttribute("data-favorito"));
        return;
      }
      var adicionar = evento.target.closest("[data-adicionar]");
      if (adicionar) {
        evento.preventDefault();
        adicionarAoCarrinho(adicionar.getAttribute("data-adicionar"), adicionar.getAttribute("data-variacao") || "", 1);
      }
    });
  }

  // ---------------------------------------------------------------- início

  function iniciar() {
    aplicarAjustesDaLoja();
    atualizarContadores();
    sincronizarBotoesFavorito();
    iniciarAcoesGlobais();
    iniciarMenuMobile();
    iniciarBuscaTopo();
    iniciarCupons();
    iniciarListagem();
    iniciarPaginaBusca();
    iniciarProduto();
    iniciarCep();
    iniciarCarrinho();
    iniciarCheckout();
    iniciarConfirmacao();
    iniciarConta();
    iniciarFavoritos();
    iniciarRastreio();
    iniciarFaq();
    iniciarNewsletter();
    iniciarContato();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
