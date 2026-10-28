/* ============================================================
   Casa Viva — painel do lojista (demonstração)
   Lê o catálogo gerado em catalogo.js e guarda as alterações
   no localStorage, no mesmo formato usado pela loja.
   ============================================================ */

(function () {
  "use strict";

  var CATALOGO = window.CATALOGO || {};
  var loja = CATALOGO.loja || {};
  var produtos = Array.isArray(CATALOGO.produtos) ? CATALOGO.produtos : [];
  var categorias = Array.isArray(CATALOGO.categorias) ? CATALOGO.categorias : [];
  var cupons = Array.isArray(CATALOGO.cupons) ? CATALOGO.cupons : [];

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

  var SENHA_DEMO = "casaviva";

  var STATUS = {
    pendente: { rotulo: "Aguardando pagamento", classe: "pendente" },
    boleto: { rotulo: "Boleto gerado", classe: "boleto" },
    pago: { rotulo: "Pagamento aprovado", classe: "pago" },
    separacao: { rotulo: "Em separação", classe: "pendente" },
    enviado: { rotulo: "Enviado", classe: "enviado" },
    transporte: { rotulo: "Em transporte", classe: "transporte" },
    entregue: { rotulo: "Entregue", classe: "entregue" },
    cancelado: { rotulo: "Cancelado", classe: "cancelado" },
  };

  var POR_SLUG = new Map(produtos.map(function (p) { return [p.slug, p]; }));
  var CAT_POR_SLUG = new Map(categorias.map(function (c) { return [c.slug, c]; }));

  var fmtMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  // ---------------------------------------------------------------- utilidades

  function qs(seletor, raiz) { return (raiz || document).querySelector(seletor); }
  function qsa(seletor, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(seletor)); }

  function esc(valor) {
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function brl(centavos) {
    return fmtMoeda.format((Number(centavos) || 0) / 100);
  }

  function numero(valor, padrao) {
    var n = Number(valor);
    return isFinite(n) ? n : padrao;
  }

  function ler(chave, padrao) {
    try {
      var bruto = localStorage.getItem(chave);
      if (bruto == null) return padrao;
      return JSON.parse(bruto);
    } catch (erro) {
      return padrao;
    }
  }

  function salvar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (erro) {
      return false;
    }
  }

  function apagar(chave) {
    try { localStorage.removeItem(chave); } catch (erro) { /* ignora */ }
  }

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function dataCurta(iso) {
    var data = iso ? new Date(iso) : new Date();
    if (isNaN(data.getTime())) return "";
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function dataLonga(data) {
    var texto = data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  // ---------------------------------------------------------------- ícones

  var ICONES = {
    busca: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.7-4.7"/>',
    sacola: '<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    pacote: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    pix: '<path d="m12 2.5 4.2 4.2-4.2 4.2-4.2-4.2L12 2.5ZM12 13.1l4.2 4.2L12 21.5l-4.2-4.2 4.2-4.2ZM2.5 12l4.2-4.2 4.2 4.2-4.2 4.2L2.5 12ZM13.1 12l4.2-4.2 4.2 4.2-4.2 4.2L13.1 12Z"/>',
    medalha: '<circle cx="12" cy="8" r="6.5"/><path d="m8.5 13.5-1 8L12 19l4.5 2.5-1-8"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    seta: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    setaEsq: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    relogio: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.8 2.2"/>',
    lixeira: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6"/><path d="M10 11v5M14 11v5"/>',
    caminhao:
      '<path d="M1 4h14v12H1z"/><path d="M15 8h4l4 4v4h-8V8Z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>',
  };

  function icone(nome) {
    var path = ICONES[nome] || ICONES.check;
    return '<svg class="icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + path + "</svg>";
  }

  function toast(titulo, texto) {
    var area = qs("[data-toasts]");
    if (!area) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = icone("check") + "<div><strong>" + esc(titulo) + "</strong>" +
      (texto ? "<span>" + esc(texto) + "</span>" : "") + "</div>";
    area.appendChild(el);
    window.setTimeout(function () {
      el.classList.add("toast--saindo");
      window.setTimeout(function () { el.remove(); }, 260);
    }, 4200);
  }

  // ---------------------------------------------------------------- catálogo com ajustes

  function lerOverrides() {
    var dados = ler(CHAVES.adminProdutos, {});
    return dados && typeof dados === "object" ? dados : {};
  }

  function produtoAtual(slug) {
    var base = POR_SLUG.get(slug);
    if (!base) return null;
    var ajuste = lerOverrides()[slug];
    if (!ajuste) return base;
    var p = Object.assign({}, base);
    if (ajuste.preco != null) p.preco = Number(ajuste.preco);
    if (ajuste.estoque != null) p.estoque = Number(ajuste.estoque);
    return p;
  }

  function categoriaNome(p) {
    var cat = CAT_POR_SLUG.get(p.categoria);
    return cat ? cat.nome : "";
  }

  function tagEstoque(estoque) {
    if (estoque <= 0) return { rotulo: "Esgotado", classe: "fora" };
    if (estoque <= 5) return { rotulo: "Estoque baixo", classe: "baixo" };
    return { rotulo: "Disponível", classe: "ok" };
  }

  function pedidosSalvos() {
    var lista = ler(CHAVES.pedidos, []);
    return Array.isArray(lista) ? lista : [];
  }

  function salvarPedidos(lista) {
    salvar(CHAVES.pedidos, lista);
  }

  function statusInfo(status) {
    return STATUS[status] || STATUS.pendente;
  }

  function statusHtml(status) {
    var info = statusInfo(status);
    return '<span class="status status--' + info.classe + '">' + esc(info.rotulo) + "</span>";
  }

  function rotuloPagamento(pedido) {
    if (pedido.pagamento === "pix") return "Pix";
    if (pedido.pagamento === "boleto") return "Boleto";
    if (pedido.pagamento === "cartao") return "Cartão" + (pedido.parcelas > 1 ? " " + pedido.parcelas + "x" : "");
    return "Pagamento";
  }

  function proximoNumero(lista) {
    var maior = 10420;
    lista.forEach(function (p) {
      var achado = String(p.numero || "").replace(/\D/g, "");
      if (achado) maior = Math.max(maior, Number(achado));
    });
    return "#CV" + String(maior + 1);
  }

  // ---------------------------------------------------------------- navegação

  var TITULOS = {
    visao: "Visão geral",
    produtos: "Produtos",
    pedidos: "Pedidos",
    cupons: "Cupons",
    config: "Configurações",
  };

  function abrirPainel(nome) {
    if (!TITULOS[nome]) return;
    qsa("[data-admin-nav]").forEach(function (botao) {
      botao.classList.toggle("ativo", botao.getAttribute("data-admin-nav") === nome);
    });
    qsa("[data-admin-painel]").forEach(function (painel) {
      var ativo = painel.getAttribute("data-admin-painel") === nome;
      painel.hidden = !ativo;
      painel.classList.toggle("ativo", ativo);
    });
    var titulo = qs("[data-admin-titulo]");
    if (titulo) titulo.textContent = TITULOS[nome];
    fecharMenuAdmin();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function abrirMenuAdmin() {
    var sidebar = qs("[data-admin-sidebar]");
    var fundo = qs("[data-admin-fundo]");
    if (!sidebar) return;
    sidebar.classList.add("aberto");
    if (fundo) fundo.hidden = false;
    document.body.classList.add("travado");
  }

  function fecharMenuAdmin() {
    var sidebar = qs("[data-admin-sidebar]");
    var fundo = qs("[data-admin-fundo]");
    if (!sidebar) return;
    sidebar.classList.remove("aberto");
    if (fundo) fundo.hidden = true;
    document.body.classList.remove("travado");
  }

  // ---------------------------------------------------------------- visão geral

  function renderizarStats() {
    var area = qs("[data-admin-stats]");
    if (!area) return;

    var pedidos = pedidosSalvos();
    var pagos = pedidos.filter(function (p) {
      return ["pago", "separacao", "enviado", "transporte", "entregue"].indexOf(p.status) > -1;
    });
    var aguardando = pedidos.filter(function (p) {
      return p.status === "pendente" || p.status === "boleto";
    });
    var cancelados = pedidos.filter(function (p) { return p.status === "cancelado"; });
    var vendas = pagos.reduce(function (soma, p) { return soma + (Number(p.total) || 0); }, 0);
    var ticket = pagos.length ? Math.round(vendas / pagos.length) : 0;
    var baixos = produtos.filter(function (p) {
      var atual = produtoAtual(p.slug) || p;
      return atual.estoque > 0 && atual.estoque <= 5;
    });
    var esgotados = produtos.filter(function (p) {
      var atual = produtoAtual(p.slug) || p;
      return atual.estoque === 0;
    });

    function contar(n, singular, plural) {
      return n + " " + (n === 1 ? singular : plural);
    }

    var metaPedidos;
    if (!pedidos.length) metaPedidos = "nenhum pedido ainda";
    else if (aguardando.length) metaPedidos = contar(aguardando.length, "aguardando pagamento", "aguardando pagamento");
    else if (cancelados.length === pedidos.length) metaPedidos = "todos cancelados";
    else metaPedidos = "todos em andamento ou concluídos";

    var metaEstoque = baixos.length + esgotados.length
      ? contar(baixos.length, "com estoque baixo", "com estoque baixo") + " · " + contar(esgotados.length, "esgotado", "esgotados")
      : "estoque saudável";

    var cartoes = [
      {
        icone: "sacola",
        valor: String(pedidos.length),
        rotulo: pedidos.length === 1 ? "Pedido recebido" : "Pedidos recebidos",
        meta: icone("relogio") + metaPedidos,
        alerta: false,
      },
      {
        icone: "pix",
        valor: brl(vendas),
        rotulo: "Vendas confirmadas",
        meta: icone("check") + (pagos.length
          ? contar(pagos.length, "pedido pago", "pedidos pagos") + (cancelados.length ? " · " + contar(cancelados.length, "cancelado", "cancelados") : "")
          : "nenhuma venda ainda"),
        alerta: false,
      },
      {
        icone: "medalha",
        valor: brl(ticket),
        rotulo: "Ticket médio",
        meta: icone("seta") + (pagos.length ? "média por pedido pago" : "aparece após a 1ª venda"),
        alerta: false,
      },
      {
        icone: "pacote",
        valor: String(baixos.length + esgotados.length),
        rotulo: "Produtos em atenção",
        meta: icone("relogio") + metaEstoque,
        alerta: baixos.length + esgotados.length > 0,
      },
    ];

    area.innerHTML = cartoes.map(function (c) {
      return '<article class="admin-stat' + (c.alerta ? " admin-stat--alerta" : "") + '">' +
        '<span class="admin-stat__icone">' + icone(c.icone) + "</span>" +
        '<span class="admin-stat__valor">' + esc(c.valor) + "</span>" +
        '<span class="admin-stat__rotulo">' + esc(c.rotulo) + "</span>" +
        '<span class="admin-stat__meta">' + c.meta + "</span>" +
        "</article>";
    }).join("");
  }

  function renderizarRecentes() {
    var area = qs("[data-admin-recentes]");
    if (!area) return;
    var pedidos = pedidosSalvos().slice(0, 4);
    if (!pedidos.length) {
      area.innerHTML = '<div class="admin-vazio">Nenhum pedido ainda. Finalize uma compra na loja ou crie um pedido de teste.</div>';
      return;
    }
    area.innerHTML = '<div class="admin-lista">' + pedidos.map(function (pedido) {
      var itens = pedido.itens || [];
      var unidades = itens.reduce(function (soma, item) { return soma + (Number(item.qtd) || 0); }, 0);
      return '<div class="admin-item">' +
        '<div class="admin-item__info">' +
        '<span class="admin-item__nome">' + esc(pedido.numero) + " · " + esc(pedido.nome) + "</span>" +
        '<span class="admin-item__meta">' + esc(dataCurta(pedido.criadoEm)) + " · " + unidades + (unidades === 1 ? " item" : " itens") + " · " + esc(rotuloPagamento(pedido)) + "</span>" +
        "</div><span class=\"admin-item__valor\">" + brl(pedido.total) + "</span></div>";
    }).join("") + "</div>";
  }

  function renderizarEstoqueBaixo() {
    var area = qs("[data-admin-estoque-baixo]");
    if (!area) return;
    var lista = produtos.map(function (p) {
      var atual = produtoAtual(p.slug) || p;
      return atual;
    }).filter(function (p) {
      return p.estoque <= 5;
    }).sort(function (a, b) {
      return a.estoque - b.estoque;
    }).slice(0, 5);

    if (!lista.length) {
      area.innerHTML = '<div class="admin-vazio">Todo o catálogo está com estoque saudável. Bom trabalho.</div>';
      return;
    }
    area.innerHTML = '<div class="admin-lista">' + lista.map(function (p) {
      var tag = tagEstoque(p.estoque);
      return '<div class="admin-item' + (p.estoque === 0 ? " admin-item--alerta" : "") + '">' +
        '<img src="/assets/img/' + esc(p.imagem) + '-800.jpg" alt="" width="42" height="48" loading="lazy">' +
        '<div class="admin-item__info">' +
        '<span class="admin-item__nome">' + esc(p.nome) + "</span>" +
        '<span class="admin-item__meta">' + esc(p.marca) + " · " + esc(tag.rotulo) + "</span>" +
        "</div>" +
        '<span class="admin-item__valor' + (p.estoque <= 5 ? " admin-item__valor--baixo" : "") + '">' + p.estoque + " un.</span>" +
        "</div>";
    }).join("") + "</div>";
  }

  function renderizarContadores() {
    var pedidos = pedidosSalvos();
    var acompanhar = pedidos.filter(function (p) {
      return ["pendente", "boleto", "pago", "separacao"].indexOf(p.status) > -1;
    }).length;
    var baixos = produtos.filter(function (p) {
      var atual = produtoAtual(p.slug) || p;
      return atual.estoque <= 5;
    }).length;
    var contPedidos = qs("[data-admin-cont-pedidos]");
    if (contPedidos) contPedidos.textContent = acompanhar ? String(acompanhar) : "";
    var contProdutos = qs("[data-admin-cont-produtos]");
    if (contProdutos) contProdutos.textContent = baixos ? String(baixos) : "";
  }

  function renderizarVisao() {
    renderizarStats();
    renderizarRecentes();
    renderizarEstoqueBaixo();
    renderizarContadores();
  }

  // ---------------------------------------------------------------- produtos

  var estadoTabela = new Map();
  var termoBusca = "";

  function precoParaCentavos(texto) {
    var bruto = String(texto == null ? "" : texto).trim();
    if (!bruto) return null;
    var limpo = bruto.replace(/[^\d,.-]/g, "");
    if (limpo.indexOf(",") > -1) limpo = limpo.replace(/\./g, "").replace(",", ".");
    var valor = Number(limpo);
    if (!isFinite(valor) || valor <= 0) return NaN;
    return Math.round(valor * 100);
  }

  function valoresLinha(p) {
    var linha = qs('[data-linha-produto="' + p.slug + '"]');
    if (!linha) return null;
    var campoPreco = qs("[data-campo-preco]", linha);
    var campoEstoque = qs("[data-campo-estoque]", linha);
    var preco = campoPreco ? precoParaCentavos(campoPreco.value) : null;
    if (preco != null && !isFinite(preco)) preco = null;
    var estoque = null;
    if (campoEstoque && campoEstoque.value.trim() !== "") {
      var bruto = Number(campoEstoque.value);
      if (isFinite(bruto) && bruto >= 0) estoque = Math.floor(bruto);
    }
    var estado = estadoTabela.get(p.slug) || { preco: p.preco, estoque: p.estoque };
    return {
      preco: preco == null ? estado.preco : preco,
      estoque: estoque == null ? estado.estoque : estoque,
      precoEfetivo: preco == null ? p.preco : preco,
      estoqueEfetivo: estoque == null ? p.estoque : estoque,
    };
  }

  function atualizarLinha(p) {
    var linha = qs('[data-linha-produto="' + p.slug + '"]');
    if (!linha) return;
    var valores = valoresLinha(p);
    if (!valores) return;
    var precoEl = qs("[data-preco-atual]", linha);
    if (precoEl) precoEl.textContent = brl(valores.precoEfetivo);
    var estoqueEl = qs("[data-estoque-atual]", linha);
    if (estoqueEl) {
      estoqueEl.textContent = String(valores.estoqueEfetivo);
      estoqueEl.classList.toggle("admin-estoque-atual--baixo", valores.estoqueEfetivo <= 5);
    }
    var tagEl = qs("[data-tag-estoque]", linha);
    if (tagEl) {
      var tag = tagEstoque(valores.estoqueEfetivo);
      tagEl.textContent = tag.rotulo;
      tagEl.className = "admin-tag admin-tag--" + tag.classe;
    }
    atualizarContagemAlteracoes();
  }

  function alteracoesPendentes() {
    var total = 0;
    produtos.forEach(function (p) {
      var valores = valoresLinha(p);
      if (!valores) return;
      var estado = estadoTabela.get(p.slug);
      if (!estado) return;
      if (valores.preco !== estado.preco || valores.estoque !== estado.estoque) total++;
    });
    return total;
  }

  function atualizarContagemAlteracoes() {
    var alvo = qs("[data-admin-alteracoes]");
    if (!alvo) return;
    var total = alteracoesPendentes();
    alvo.textContent = total + (total === 1 ? " alteração" : " alterações");
  }

  function renderizarProdutos() {
    var corpo = qs("[data-admin-produtos]");
    if (!corpo) return;
    var overrides = lerOverrides();
    estadoTabela = new Map();

    corpo.innerHTML = produtos.map(function (p) {
      var atual = produtoAtual(p.slug) || p;
      var ajuste = overrides[p.slug] || {};
      estadoTabela.set(p.slug, { preco: atual.preco, estoque: atual.estoque });
      var tag = tagEstoque(atual.estoque);
      var valorPreco = ajuste.preco != null ? (Number(ajuste.preco) / 100).toFixed(2) : "";
      var valorEstoque = ajuste.estoque != null ? String(ajuste.estoque) : "";
      var textoBusca = normalizar(p.nome + " " + p.marca + " " + categoriaNome(p));
      return '<tr data-linha-produto="' + esc(p.slug) + '" data-busca="' + esc(textoBusca) + '">' +
        '<td><div class="admin-produto">' +
        '<img src="/assets/img/' + esc(p.imagem) + '-800.jpg" alt="" width="38" height="44" loading="lazy">' +
        '<div><span class="admin-produto__nome">' + esc(p.nome) + "</span>" +
        '<span class="admin-produto__meta">' + esc(p.marca) + " · " + esc(categoriaNome(p)) + "</span></div>" +
        "</div></td>" +
        '<td><span class="admin-preco-atual" data-preco-atual>' + brl(atual.preco) + "</span></td>" +
        '<td><input class="admin-campo" type="number" min="0" step="0.01" inputmode="decimal" data-campo-preco value="' + esc(valorPreco) + '" placeholder="' + esc((p.preco / 100).toFixed(2)) + '" aria-label="Novo preço de ' + esc(p.nome) + '"></td>' +
        '<td><span class="admin-estoque-atual' + (atual.estoque <= 5 ? " admin-estoque-atual--baixo" : "") + '" data-estoque-atual>' + atual.estoque + "</span></td>" +
        '<td><input class="admin-campo admin-campo--estoque" type="number" min="0" step="1" inputmode="numeric" data-campo-estoque value="' + esc(valorEstoque) + '" placeholder="' + p.estoque + '" aria-label="Novo estoque de ' + esc(p.nome) + '"></td>' +
        '<td><span class="admin-tag admin-tag--' + tag.classe + '" data-tag-estoque>' + esc(tag.rotulo) + "</span></td>" +
        "</tr>";
    }).join("");

    qsa("[data-admin-produtos] tr").forEach(function (linha) {
      var slug = linha.getAttribute("data-linha-produto");
      var produto = POR_SLUG.get(slug);
      qsa("input", linha).forEach(function (campo) {
        campo.addEventListener("input", function () {
          if (produto) atualizarLinha(produto);
        });
      });
    });

    aplicarBuscaProdutos();
    atualizarContagemAlteracoes();
  }

  function aplicarBuscaProdutos() {
    var termo = normalizar(termoBusca);
    qsa("[data-admin-produtos] tr").forEach(function (linha) {
      var alvo = linha.getAttribute("data-busca") || "";
      linha.hidden = !!termo && alvo.indexOf(termo) === -1;
    });
  }

  function salvarProdutos() {
    var overrides = {};
    var invalido = null;

    produtos.forEach(function (p) {
      var linha = qs('[data-linha-produto="' + p.slug + '"]');
      if (!linha) return;
      var campoPreco = qs("[data-campo-preco]", linha);
      var campoEstoque = qs("[data-campo-estoque]", linha);
      var ajuste = {};

      if (campoPreco && campoPreco.value.trim() !== "") {
        var preco = precoParaCentavos(campoPreco.value);
        if (!isFinite(preco) || preco == null || preco <= 0) {
          invalido = campoPreco;
          return;
        }
        if (preco !== p.preco) ajuste.preco = preco;
      }

      if (campoEstoque && campoEstoque.value.trim() !== "") {
        var estoque = Number(campoEstoque.value);
        if (!isFinite(estoque) || estoque < 0) {
          invalido = campoEstoque;
          return;
        }
        estoque = Math.floor(estoque);
        if (estoque !== p.estoque) ajuste.estoque = estoque;
      }

      if (Object.keys(ajuste).length) overrides[p.slug] = ajuste;
    });

    if (invalido) {
      toast("Confira o valor", "Preço e estoque precisam ser números válidos.");
      invalido.focus();
      if (invalido.select) invalido.select();
      return;
    }

    var mudancas = alteracoesPendentes();
    if (!mudancas) {
      toast("Tudo em dia", "Nenhuma alteração para salvar.");
      return;
    }

    if (salvar(CHAVES.adminProdutos, overrides)) {
      renderizarProdutos();
      renderizarVisao();
      toast("Alterações salvas", "Os novos preços e estoques já valem na loja.");
    } else {
      toast("Não foi possível salvar", "O armazenamento do navegador está indisponível.");
    }
  }

  // ---------------------------------------------------------------- pedidos

  function renderizarPedidos() {
    var area = qs("[data-admin-pedidos-lista]");
    if (!area) return;
    var pedidos = pedidosSalvos();

    if (!pedidos.length) {
      area.innerHTML = '<div class="admin-vazio">Nenhum pedido por aqui. Use “Criar pedido de teste” para ver o fluxo do painel.</div>';
      return;
    }

    area.innerHTML = '<div class="admin-pedidos">' + pedidos.map(function (pedido) {
      var itens = pedido.itens || [];
      var resumo = itens.slice(0, 3).map(function (item) {
        return item.qtd + "× " + esc(item.nome);
      }).join(" · ");
      if (itens.length > 3) resumo += " · +" + (itens.length - 3) + " item(ns)";
      var opcoes = Object.keys(STATUS).map(function (chave) {
        return '<option value="' + chave + '"' + (pedido.status === chave ? " selected" : "") + ">" + esc(STATUS[chave].rotulo) + "</option>";
      }).join("");
      return '<article class="admin-pedido" data-admin-pedido="' + esc(pedido.numero) + '">' +
        '<div class="admin-pedido__topo">' +
        '<span class="admin-pedido__numero">' + esc(pedido.numero) + "</span>" +
        statusHtml(pedido.status) +
        '<span class="admin-pedido__cliente">' + esc(pedido.nome) + " · " + esc(dataCurta(pedido.criadoEm)) + "</span>" +
        "</div>" +
        '<div class="admin-pedido__itens">' + (resumo || "Sem itens") + " · " + esc(rotuloPagamento(pedido)) + "</div>" +
        '<div class="admin-pedido__acoes">' +
        '<span class="admin-pedido__valor">' + brl(pedido.total) + "</span>" +
        '<select class="admin-select" data-admin-status="' + esc(pedido.numero) + '" aria-label="Status do pedido ' + esc(pedido.numero) + '">' + opcoes + "</select>" +
        "</div>" +
        "</article>";
    }).join("") + "</div>";

    qsa("[data-admin-status]", area).forEach(function (select) {
      select.addEventListener("change", function () {
        mudarStatus(select.getAttribute("data-admin-status"), select.value);
      });
    });
  }

  function mudarStatus(numero, novoStatus) {
    if (!STATUS[novoStatus]) return;
    var pedidos = pedidosSalvos();
    var pedido = pedidos.find(function (p) { return p.numero === numero; });
    if (!pedido) return;
    pedido.status = novoStatus;
    pedido.atualizadoEm = new Date().toISOString();
    salvarPedidos(pedidos);
    renderizarPedidos();
    renderizarVisao();
    toast("Pedido atualizado", numero + " agora está em “" + STATUS[novoStatus].rotulo + "”.");
  }

  function criarPedidoTeste() {
    var disponiveis = produtos.map(function (p) { return produtoAtual(p.slug) || p; })
      .filter(function (p) { return p.estoque > 0; });
    if (!disponiveis.length) {
      toast("Catálogo esgotado", "Reponha o estoque antes de criar um pedido de teste.");
      return;
    }

    var escolhidos = disponiveis.slice(0, 2);
    var itens = escolhidos.map(function (p) {
      return {
        slug: p.slug,
        nome: p.nome,
        marca: p.marca,
        imagem: p.imagem,
        imagemAlt: p.imagemAlt,
        variacao: p.variacoes && p.variacoes.opcoes && p.variacoes.opcoes[0] ? p.variacoes.opcoes[0].nome : "",
        qtd: 1,
        preco: p.preco,
      };
    });
    var subtotal = itens.reduce(function (soma, item) { return soma + item.preco * item.qtd; }, 0);
    var frete = subtotal >= (loja.freteGratisAcimaDe || 0) ? 0 : 4900;
    var pedidos = pedidosSalvos();
    var pedido = {
      numero: proximoNumero(pedidos),
      criadoEm: new Date().toISOString(),
      nome: "Cliente de teste",
      email: "cliente@exemplo.com.br",
      telefone: "(11) 99999-0000",
      cpf: "00000000000",
      endereco: {
        cep: "01310100",
        logradouro: "Avenida Paulista",
        numero: "1000",
        complemento: "Apto 42",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        uf: "SP",
        referencia: "",
      },
      entrega: { tipo: "padrao", nome: "Entrega padrão", valor: frete, prazo: "3 a 6 dias úteis", regiao: "Sudeste" },
      pagamento: "pix",
      parcelas: 1,
      cartaoFinal: "",
      cupom: "",
      subtotal: subtotal,
      desconto: 0,
      descontoPix: 0,
      frete: frete,
      total: subtotal + frete,
      status: "pago",
      itens: itens,
      newsletter: false,
      demo: true,
    };

    pedidos.unshift(pedido);
    salvarPedidos(pedidos);
    renderizarPedidos();
    renderizarVisao();
    toast("Pedido de teste criado", pedido.numero + " · " + brl(pedido.total));
  }

  // ---------------------------------------------------------------- cupons

  function beneficioCupom(cupom) {
    if (cupom.tipo === "percentual") return cupom.valor + "% de desconto";
    if (cupom.tipo === "fixo") return brl(cupom.valor) + " de desconto";
    if (cupom.tipo === "frete") return "Frete grátis";
    return cupom.descricao || "—";
  }

  function renderizarCupons() {
    var corpo = qs("[data-admin-cupons]");
    if (!corpo) return;
    corpo.innerHTML = cupons.map(function (cupom) {
      var minimo = cupom.minimo ? brl(cupom.minimo) : "Sem mínimo";
      return "<tr><td><strong>" + esc(cupom.codigo) + "</strong></td>" +
        "<td>" + esc(beneficioCupom(cupom)) + "</td>" +
        "<td>" + esc(minimo) + "</td>" +
        "<td>" + esc(cupom.descricao || "") + "</td></tr>";
    }).join("");
  }

  // ---------------------------------------------------------------- configurações

  function limparDados(quais) {
    quais.forEach(function (chave) {
      if (chave === "cv:") {
        try {
          Object.keys(localStorage).forEach(function (k) {
            if (k.indexOf("cv:") === 0 && k !== CHAVES.adminSessao) localStorage.removeItem(k);
          });
        } catch (erro) { /* ignora */ }
        return;
      }
      apagar(chave);
    });
  }

  function restaurarProdutos(silencioso) {
    apagar(CHAVES.adminProdutos);
    if (qs("[data-admin-produtos]")) {
      renderizarProdutos();
      renderizarVisao();
    }
    if (!silencioso) toast("Catálogo restaurado", "Preços e estoques voltaram aos valores originais.");
  }

  function apagarPedidos(silencioso) {
    apagar(CHAVES.pedidos);
    if (qs("[data-admin-pedidos-lista]")) {
      renderizarPedidos();
      renderizarVisao();
    }
    if (!silencioso) toast("Pedidos apagados", "A lista de pedidos deste navegador está vazia.");
  }

  // ---------------------------------------------------------------- sessão

  function sessaoAtiva() {
    try {
      return localStorage.getItem(CHAVES.adminSessao) === "1";
    } catch (erro) {
      return false;
    }
  }

  function mostrarApp(ativo) {
    var login = qs("[data-admin-login]");
    var app = qs("[data-admin-app]");
    if (login) login.hidden = !!ativo;
    if (app) app.hidden = !ativo;
    document.body.classList.toggle("admin-logado", !!ativo);
  }

  function entrar(evento) {
    evento.preventDefault();
    var form = qs("[data-admin-form]");
    if (!form) return;
    var dados = new FormData(form);
    var email = String(dados.get("email") || "").trim();
    var senha = String(dados.get("senha") || "");
    var erro = qs("[data-admin-erro]");

    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
      if (erro) erro.textContent = "Informe um e-mail válido.";
      return;
    }
    if (senha !== SENHA_DEMO) {
      if (erro) erro.textContent = "Senha incorreta. Na demonstração, use “casaviva”.";
      var campoSenha = form.elements.namedItem("senha");
      if (campoSenha) {
        campoSenha.focus();
        if (campoSenha.select) campoSenha.select();
      }
      return;
    }

    if (erro) erro.textContent = "";
    try { localStorage.setItem(CHAVES.adminSessao, "1"); } catch (e) { /* ignora */ }
    form.reset();
    mostrarApp(true);
    abrirPainel("visao");
    renderizarTudo();
    toast("Bem-vindo ao painel", "As alterações aparecem na loja na hora.");
  }

  function sair() {
    try { localStorage.removeItem(CHAVES.adminSessao); } catch (erro) { /* ignora */ }
    mostrarApp(false);
    var form = qs("[data-admin-form]");
    if (form) {
      form.reset();
      var email = form.elements.namedItem("email");
      if (email) email.value = "equipe@casaviva.com.br";
      var senha = form.elements.namedItem("senha");
      if (senha) senha.focus();
    }
    toast("Sessão encerrada", "Você saiu do painel do lojista.");
  }

  // ---------------------------------------------------------------- início

  function renderizarTudo() {
    renderizarVisao();
    renderizarProdutos();
    renderizarPedidos();
    renderizarCupons();
  }

  function iniciar() {
    var data = qs("[data-admin-data]");
    if (data) data.textContent = dataLonga(new Date());

    var formLogin = qs("[data-admin-form]");
    if (formLogin) formLogin.addEventListener("submit", entrar);

    qsa("[data-admin-nav]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        abrirPainel(botao.getAttribute("data-admin-nav"));
      });
    });

    qsa("[data-admin-ir]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        abrirPainel(botao.getAttribute("data-admin-ir"));
      });
    });

    qsa("[data-admin-sair]").forEach(function (botao) {
      botao.addEventListener("click", sair);
    });

    var menu = qs("[data-admin-menu]");
    if (menu) menu.addEventListener("click", abrirMenuAdmin);

    var fundo = qs("[data-admin-fundo]");
    if (fundo) fundo.addEventListener("click", fecharMenuAdmin);

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape") fecharMenuAdmin();
    });

    var salvarBtn = qs("[data-admin-salvar-btn]");
    if (salvarBtn) salvarBtn.addEventListener("click", salvarProdutos);

    var descartar = qs("[data-admin-descartar]");
    if (descartar) descartar.addEventListener("click", function () {
      renderizarProdutos();
      toast("Alterações descartadas", "Os campos voltaram aos valores salvos.");
    });

    var busca = qs("[data-admin-busca]");
    if (busca) busca.addEventListener("input", function () {
      termoBusca = busca.value;
      aplicarBuscaProdutos();
    });

    var demo = qs("[data-admin-pedido-demo]");
    if (demo) demo.addEventListener("click", criarPedidoTeste);

    var atualizar = qs("[data-admin-atualizar]");
    if (atualizar) atualizar.addEventListener("click", function () {
      renderizarTudo();
      toast("Dados atualizados", "O painel mostra o estado mais recente da loja.");
    });

    var resetProdutos = qs("[data-admin-reset-produtos]");
    if (resetProdutos) resetProdutos.addEventListener("click", function () {
      if (!window.confirm("Restaurar todos os preços e estoques originais?")) return;
      restaurarProdutos(false);
    });

    var resetPedidos = qs("[data-admin-reset-pedidos]");
    if (resetPedidos) resetPedidos.addEventListener("click", function () {
      if (!window.confirm("Apagar todos os pedidos salvos neste navegador?")) return;
      apagarPedidos(false);
    });

    var resetTudo = qs("[data-admin-reset-tudo]");
    if (resetTudo) resetTudo.addEventListener("click", function () {
      if (!window.confirm("Apagar todos os dados da demonstração (produtos, pedidos, conta e carrinho)?")) return;
      limparDados(["cv:"]);
      renderizarTudo();
      toast("Dados apagados", "A loja voltou ao estado inicial.");
    });

    window.addEventListener("storage", function (evento) {
      if (!evento.key) return;
      if (evento.key === CHAVES.pedidos) {
        renderizarPedidos();
        renderizarVisao();
      } else if (evento.key === CHAVES.adminProdutos) {
        renderizarProdutos();
        renderizarVisao();
      }
    });

    if (sessaoAtiva()) {
      mostrarApp(true);
      renderizarTudo();
    } else {
      mostrarApp(false);
      renderizarCupons();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
