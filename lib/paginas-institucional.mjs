// Páginas institucionais e de conteúdo.
import fs from "node:fs";
import path from "node:path";
import { loja, categorias } from "../data/catalogo.mjs";
import {
  sobre,
  numeros,
  vantagens,
  faq,
  trocas,
  privacidade,
  contato,
  rastreamento,
  selos,
} from "../data/conteudo.mjs";
import { esc, icone, layout, trilha, estrelas, brl } from "./ui.mjs";

const RAIZ = path.resolve(import.meta.dirname, "..");

function cabecaInstitucional({ eyebrow, titulo, lead, imagem, imagemAlt, extra = "" }) {
  return `
  <section class="inst-cabeca">
    <div class="wrap">
      <div class="inst-cabeca__texto">
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h1>${titulo}</h1>
        <p class="inst-cabeca__lead">${esc(lead)}</p>
        ${extra}
      </div>
      ${
        imagem
          ? `<figure class="inst-cabeca__midia">
              <img src="/assets/img/${imagem}.jpg" srcset="/assets/img/${imagem}-800.jpg 800w, /assets/img/${imagem}.jpg 1600w" sizes="(max-width: 900px) 92vw, 46vw" alt="${esc(imagemAlt)}" width="1600" height="1067" loading="lazy">
            </figure>`
          : ""
      }
    </div>
  </section>`;
}

// ---------------------------------------------------------------- SOBRE

export function paginaSobre() {
  const corpo = `
  ${cabecaInstitucional({
    eyebrow: "Sobre a Casa Viva",
    titulo: sobre.titulo.replace("Uma casa viva se faz de escolhas boas", "Uma casa viva se faz<br><em>de escolhas boas</em>"),
    lead: sobre.chamada,
    imagem: "amb-sofas-2",
    imagemAlt: "Sala ampla em tons neutros com sofá claro e luz natural",
    extra: `<a class="btn btn--principal" href="/produtos/">Conhecer o catálogo ${icone("seta")}</a>`,
  })}

  <section class="secao">
    <div class="wrap">
      <div class="numeros">
        ${numeros.map((n) => `<div class="numero"><strong>${esc(n.valor)}</strong><span>${esc(n.rotulo)}</span></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="secao">
    <div class="wrap sobre-historia">
      <div class="sobre-historia__texto">
        <p class="eyebrow">Nossa história</p>
        <h2>Começou numa sala.<br>Hoje cabe no Brasil inteiro.</h2>
        ${sobre.historia.map((p) => `<p>${esc(p)}</p>`).join("")}
        <p class="sobre-historia__citacao">“Se não deixa a casa mais confortável, não entra no catálogo.”</p>
        <p class="sobre-historia__assinatura">— Helena e Rafael, fundadores</p>
      </div>
      <div class="sobre-historia__midia">
        <img src="/assets/img/amb-casa-1.jpg" srcset="/assets/img/amb-casa-1-800.jpg 800w, /assets/img/amb-casa-1.jpg 1600w" sizes="(max-width: 900px) 92vw, 42vw" alt="Detalhes de decoração rústica em madeira e cerâmica" width="1600" height="1067" loading="lazy">
        <div class="sobre-historia__selo">
          <strong>desde 2014</strong>
          <span>escolhendo peças<br>para casas de verdade</span>
        </div>
      </div>
    </div>
  </section>

  <section class="secao secao--clara">
    <div class="wrap">
      <div class="secao__topo"><div><p class="eyebrow">No que acreditamos</p><h2>Quatro ideias que guiam a curadoria</h2></div></div>
      <div class="valores">
        ${sobre.valores
          .map(
            (v, i) => `
          <article class="valor">
            <span class="valor__num">0${i + 1}</span>
            <h3>${esc(v.titulo)}</h3>
            <p>${esc(v.texto)}</p>
          </article>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section class="secao">
    <div class="wrap sobre-bastidores">
      <div class="sobre-bastidores__midia">
        <img src="/assets/img/amb-eletro-2.jpg" srcset="/assets/img/amb-eletro-2-800.jpg 800w, /assets/img/amb-eletro-2.jpg 1600w" sizes="(max-width: 900px) 92vw, 46vw" alt="Cozinha aberta com bancada de madeira e eletrodomésticos" width="1600" height="1067" loading="lazy">
      </div>
      <div>
        <p class="eyebrow">Bastidores</p>
        <h2>Curadoria que visita a fábrica</h2>
        <p>${esc(sobre.bastidores)}</p>
        <div class="sobre-bastidores__selos">
          ${selos.map((s) => `<div>${icone(s.icone)}<span><strong>${esc(s.titulo)}</strong><small>${esc(s.texto)}</small></span></div>`).join("")}
        </div>
      </div>
    </div>
  </section>

  <section class="secao">
    <div class="wrap">
      <div class="cta-faixa">
        <div><p class="eyebrow eyebrow--claro">Vamos juntos</p><h2>A sua casa é o próximo capítulo.</h2><p>Conte com a gente para escolher, medir e montar. Do primeiro sofá ao último detalhe.</p></div>
        <div class="cta-faixa__acoes">
          <a class="btn btn--claro" href="/produtos/">Ver produtos ${icone("seta")}</a>
          <a class="btn btn--contorno-claro" href="/contato/">Falar com a gente</a>
        </div>
      </div>
    </div>
  </section>`;

  return layout({
    titulo: "Sobre a Casa Viva",
    descricao:
      "Desde 2014, a Casa Viva escolhe sofás, objetos e eletrodomésticos que deixam a casa mais confortável, com preço honesto e atendimento próximo.",
    corpo,
    caminho: "/sobre/",
    imagem: "amb-sofas-2",
    imagemAlt: "Sala ampla em tons neutros com sofá claro",
    ativo: "",
    classe: "pagina-sobre",
  });
}

// ---------------------------------------------------------------- CONTATO

export function paginaContato() {
  const corpo = `
  ${cabecaInstitucional({
    eyebrow: "Atendimento",
    titulo: "Fale com a gente",
    lead: contato.resumo,
    imagem: "amb-casa-2",
    imagemAlt: "Quarto aconchegante com abajur aceso e roupa de cama clara",
  })}

  <section class="secao">
    <div class="wrap contato__grade">
      <div class="contato__canais">
        ${contato.canais
          .map(
            (c) => `
          <a class="canal" href="${c.href}"${c.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>
            <span class="canal__icone">${icone(c.icone)}</span>
            <span><strong>${esc(c.titulo)}</strong><span class="canal__valor">${esc(c.valor)}</span><small>${esc(c.detalhe)}</small></span>
            ${icone("setaDiagonal", "canal__seta")}
          </a>`
          )
          .join("")}
        <div class="canal canal--endereco">
          <span class="canal__icone">${icone("relogio")}</span>
          <span><strong>Horário de atendimento</strong><span class="canal__valor">${esc(loja.horario)}</span><small>Showroom com visita agendada</small></span>
        </div>
      </div>

      <div class="contato__form-card">
        <h2>Mande uma mensagem</h2>
        <p>Preencha os campos e a gente responde em até 1 dia útil. Para assuntos urgentes, o WhatsApp é o caminho mais rápido.</p>
        <form class="contato-form" data-contato-form novalidate>
          <div class="campo"><label for="contato-nome">Seu nome</label><input id="contato-nome" name="nome" type="text" autocomplete="name" required placeholder="Como podemos te chamar?"></div>
          <div class="campo"><label for="contato-email">E-mail</label><input id="contato-email" name="email" type="email" autocomplete="email" required placeholder="voce@email.com"></div>
          <div class="campo"><label for="contato-telefone">Telefone <span class="opcional">(opcional)</span></label><input id="contato-telefone" name="telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-0000"></div>
          <div class="campo"><label for="contato-assunto">Assunto</label>
            <select id="contato-assunto" name="assunto" required>
              <option value="">Selecione</option>
              ${contato.assuntos.map((a) => `<option>${esc(a)}</option>`).join("")}
            </select>
          </div>
          <div class="campo"><label for="contato-pedido">Número do pedido <span class="opcional">(se houver)</span></label><input id="contato-pedido" name="pedido" type="text" placeholder="#CV00000"></div>
          <div class="campo"><label for="contato-mensagem">Mensagem</label><textarea id="contato-mensagem" name="mensagem" rows="5" required placeholder="Conte com detalhes o que você precisa."></textarea></div>
          <button class="btn btn--principal btn--bloco" type="submit">Enviar mensagem ${icone("seta")}</button>
          <p class="form__nota">Seus dados são usados apenas para responder a esta mensagem. Veja a <a href="/privacidade/">política de privacidade</a>.</p>
          <p class="form__sucesso" data-contato-sucesso hidden role="status">Mensagem enviada! A gente responde em até 1 dia útil. Obrigado por escrever.</p>
        </form>
      </div>
    </div>
  </section>

  <section class="secao secao--clara">
    <div class="wrap showroom">
      <div class="showroom__texto">
        <p class="eyebrow">Venha sentir de perto</p>
        <h2>Showroom Casa Viva</h2>
        <p>Um espaço de 600 m² com salas montadas, tecidos para tocar e uma equipe para ajudar a medir. Atendimento com agendamento para você ter toda a atenção.</p>
        <address>
          ${icone("local")} ${esc(loja.endereco)}<br>
          ${icone("relogio")} ${esc(loja.horario)}<br>
          ${icone("whatsapp")} <a href="https://wa.me/${loja.whatsapp}" target="_blank" rel="noopener">Agendar visita pelo WhatsApp</a>
        </address>
        <a class="btn btn--contorno" href="https://maps.google.com/?q=Av.+das+Na%C3%A7%C3%B5es+1200+S%C3%A3o+Paulo" target="_blank" rel="noopener">Ver no mapa ${icone("setaDiagonal")}</a>
      </div>
      <div class="showroom__mapa" role="img" aria-label="Ilustração de mapa com a localização do showroom">
        <div class="mapa__linhas" aria-hidden="true"></div>
        <span class="mapa__pin">${icone("local")}</span>
        <span class="mapa__legenda">Vila Nova · São Paulo</span>
        <span class="mapa__rua mapa__rua--1">Av. das Nações</span>
        <span class="mapa__rua mapa__rua--2">Rua das Acácias</span>
      </div>
    </div>
  </section>`;

  return layout({
    titulo: "Contato",
    descricao: "Fale com a Casa Viva por WhatsApp, e-mail ou telefone. Atendimento de segunda a sábado e showroom em São Paulo.",
    corpo,
    caminho: "/contato/",
    imagem: "amb-casa-2",
    imagemAlt: "Quarto aconchegante em tons neutros",
    classe: "pagina-contato",
  });
}

// ---------------------------------------------------------------- TEXTO / POLÍTICAS

function paginaPolitica({ dados, caminho, eyebrow, imagem, imagemAlt, titulo, resumo, atualizado, classe }) {
  const corpo = `
  ${cabecaInstitucional({
    eyebrow,
    titulo: `<em>${titulo}</em>`,
    lead: resumo,
    imagem,
    imagemAlt,
    extra: atualizado ? `<p class="inst-cabeca__atualizado">${icone("relogio")} ${esc(atualizado)}</p>` : "",
  })}

  <section class="secao">
    <div class="wrap politica">
      <nav class="politica__indice" aria-label="Nesta página">
        <p class="eyebrow">Nesta página</p>
        <ol>
          ${dados.secoes.map((s, i) => `<li><a href="#secao-${i + 1}">${esc(s.titulo)}</a></li>`).join("")}
        </ol>
        <div class="politica__ajuda">
          <p>Ficou com dúvida?</p>
          <a class="link-seta" href="/contato/">Fale com a gente ${icone("seta")}</a>
        </div>
      </nav>
      <div class="politica__conteudo">
        ${dados.secoes
          .map(
            (s, i) => `
          <section id="secao-${i + 1}" class="politica__secao">
            <h2>${esc(s.titulo)}</h2>
            ${(s.paragrafos || []).map((p) => `<p>${esc(p)}</p>`).join("")}
            ${s.lista ? `<ul class="lista-check">${s.lista.map((li) => `<li>${icone("check")} ${esc(li)}</li>`).join("")}</ul>` : ""}
          </section>`
          )
          .join("")}
        <div class="politica__contato">
          ${icone("atendimento")}
          <div>
            <h3>Precisa falar sobre seus dados ou pedido?</h3>
            <p>Nosso time responde de segunda a sexta, das 9h às 18h.</p>
          </div>
          <a class="btn btn--contorno" href="/contato/">Contato</a>
        </div>
      </div>
    </div>
  </section>`;

  return layout({
    titulo,
    descricao: resumo,
    corpo,
    caminho,
    imagem,
    imagemAlt,
    classe,
  });
}

export function paginaTrocas() {
  return paginaPolitica({
    dados: trocas,
    caminho: "/trocas-e-devolucoes/",
    eyebrow: "Compra tranquila",
    imagem: "amb-casa-1",
    imagemAlt: "Detalhes de decoração em madeira e cerâmica",
    titulo: "Trocas e devoluções",
    resumo: trocas.resumo,
    classe: "pagina-trocas",
  });
}

export function paginaPrivacidade() {
  return paginaPolitica({
    dados: privacidade,
    caminho: "/privacidade/",
    eyebrow: "Transparência",
    imagem: "amb-casa-2",
    imagemAlt: "Ambiente de casa em tons neutros",
    titulo: "Privacidade",
    resumo: privacidade.resumo,
    atualizado: privacidade.atualizado,
    classe: "pagina-privacidade",
  });
}

// ---------------------------------------------------------------- FAQ

export function paginaFaq() {
  const corpo = `
  ${cabecaInstitucional({
    eyebrow: "Central de ajuda",
    titulo: "Perguntas <em>frequentes</em>",
    lead: "Pedido, entrega, pagamento, produto ou troca: reunião aqui as respostas mais procuradas. Se não encontrar, é só chamar.",
    extra: `
      <div class="faq-busca">
        ${icone("busca")}
        <label class="sr-only" for="faq-busca">Buscar nas perguntas</label>
        <input id="faq-busca" type="search" placeholder="Buscar uma dúvida…" data-faq-busca autocomplete="off">
      </div>
      <div class="faq-chips">
        ${faq.map((g) => `<button type="button" data-faq-categoria="${esc(g.categoria)}">${esc(g.categoria)}</button>`).join("")}
      </div>`,
  })}

  <section class="secao">
    <div class="wrap faq">
      <div class="faq__grupos" data-faq-grupos>
        ${faq
          .map(
            (g) => `
          <section class="faq__grupo" data-faq-grupo="${esc(g.categoria)}">
            <h2>${esc(g.categoria)}</h2>
            ${g.perguntas
              .map(
                (q, i) => `
              <details class="faq__item" data-faq-item>
                <summary>${esc(q.q)}</summary>
                <div class="faq__resposta"><p>${esc(q.a)}</p></div>
              </details>`
              )
              .join("")}
          </section>`
          )
          .join("")}
        <div class="vazio" data-faq-vazio hidden>
          ${icone("busca")}
          <h2>Não encontramos essa dúvida</h2>
          <p>Tente outra palavra ou fale com a gente. Respondemos em até 1 dia útil.</p>
          <a class="btn btn--principal" href="/contato/">Falar com a gente</a>
        </div>
      </div>

      <aside class="faq__lateral">
        <div class="cartao-lateral">
          <h2>Ainda com dúvida?</h2>
          <p>O atendimento é humano, de segunda a sábado. A gente ajuda a medir, escolher tecido e acompanhar pedido.</p>
          <a class="btn btn--principal btn--bloco" href="https://wa.me/${loja.whatsapp}" target="_blank" rel="noopener">${icone("whatsapp")} Chamar no WhatsApp</a>
          <a class="btn btn--fantasma btn--bloco" href="/contato/">Enviar mensagem</a>
        </div>
        <div class="cartao-lateral cartao-lateral--leve">
          <h2>Links úteis</h2>
          <a class="link-seta" href="/rastreamento/">Rastrear pedido ${icone("seta")}</a>
          <a class="link-seta" href="/trocas-e-devolucoes/">Trocas e devoluções ${icone("seta")}</a>
          <a class="link-seta" href="/privacidade/">Privacidade ${icone("seta")}</a>
        </div>
      </aside>
    </div>
  </section>`;

  return layout({
    titulo: "Perguntas frequentes",
    descricao: "Respostas sobre pedidos, entrega, pagamento, produtos e trocas na Casa Viva.",
    corpo,
    caminho: "/faq/",
    imagem: "amb-casa-1",
    imagemAlt: "Decoração de casa em tons naturais",
    classe: "pagina-faq",
  });
}

// ---------------------------------------------------------------- RASTREAMENTO

export function paginaRastreamento() {
  const corpo = `
  <section class="inst-cabeca inst-cabeca--curta">
    <div class="wrap">
      <p class="eyebrow">Acompanhe de perto</p>
      <h1>Rastrear <em>pedido</em></h1>
      <p class="inst-cabeca__lead">${esc(rastreamento.resumo)}</p>
      <form class="rastreio-form" data-rastreio-form novalidate>
        <div class="campo">
          <label for="rastreio-pedido">Número do pedido</label>
          <input id="rastreio-pedido" name="pedido" type="text" required placeholder="#CV00000" autocomplete="off">
        </div>
        <div class="campo">
          <label for="rastreio-email">E-mail da compra</label>
          <input id="rastreio-email" name="email" type="email" required placeholder="voce@email.com" autocomplete="email">
        </div>
        <button class="btn btn--principal" type="submit">Rastrear ${icone("seta")}</button>
      </form>
      <p class="campo__erro rastreio-form__erro" data-rastreio-erro role="alert"></p>
    </div>
  </section>

  <section class="secao">
    <div class="wrap rastreio">
      <div class="rastreio__resultado" data-rastreio-resultado hidden aria-live="polite"></div>

      <div class="rastreio__timeline">
        <div class="rastreio__timeline-topo">
          <h2>Como funciona a entrega</h2>
          <p>Do pagamento à sua porta, cada etapa é acompanhada pelo nosso time.</p>
        </div>
        <ol class="linha-tempo">
          ${rastreamento.etapas
            .map(
              (e, i) => `
            <li>
              <span class="linha-tempo__ponto">${i + 1}</span>
              <div><strong>${esc(e.titulo)}</strong><p>${esc(e.texto)}</p></div>
            </li>`
            )
            .join("")}
        </ol>
      </div>

      <aside class="rastreio__ajuda">
        <div class="cartao-lateral">
          <h2>Não lembra o número?</h2>
          <p>Entre em <a href="/conta/">Minha conta</a> para ver todos os pedidos ou fale com a gente informando o e-mail da compra.</p>
          <a class="btn btn--principal btn--bloco" href="/conta/">Ir para minha conta</a>
          <a class="btn btn--fantasma btn--bloco" href="https://wa.me/${loja.whatsapp}" target="_blank" rel="noopener">${icone("whatsapp")} Falar no WhatsApp</a>
        </div>
        <div class="cartao-lateral cartao-lateral--leve">
          <h2>Prazo médio</h2>
          <p><strong>2 a 5 dias úteis</strong> na Grande São Paulo<br><strong>4 a 12 dias úteis</strong> nas demais regiões</p>
          <p class="cartao-lateral__nota">O prazo começa a contar após a confirmação do pagamento e a emissão da nota fiscal.</p>
        </div>
      </aside>
    </div>
  </section>`;

  return layout({
    titulo: "Rastrear pedido",
    descricao: "Acompanhe o status e o prazo de entrega do seu pedido na Casa Viva.",
    corpo,
    caminho: "/rastreamento/",
    imagem: "amb-sofas-1",
    imagemAlt: "Sala iluminada com sofá e plantas",
    semNewsletter: true,
    classe: "pagina-rastreamento",
  });
}

// ---------------------------------------------------------------- CRÉDITOS

export function paginaCreditos() {
  const arquivo = path.join(RAIZ, "src", "img", "creditos.json");
  const creditos = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  const porFonte = new Map();
  for (const c of creditos) {
    const fonte = c.fonte || "Wikimedia Commons";
    if (!porFonte.has(fonte)) porFonte.set(fonte, []);
    porFonte.get(fonte).push(c);
  }
  const grupos = [...porFonte.entries()];

  const corpo = `
  ${cabecaInstitucional({
    eyebrow: "Transparência",
    titulo: "Créditos das <em>fotos</em>",
    lead: "As imagens desta versão demonstrativa vêm de bancos gratuitos e do Wikimedia Commons. Cada foto mantém a licença original e pode ser substituída pelas fotos oficiais da loja.",
  })}

  <section class="secao">
    <div class="wrap creditos">
      <div class="aviso-creditos">
        ${icone("sparkle")}
        <div>
          <strong>Fotos de demonstração</strong>
          <p>As imagens são usadas para simular a experiência da loja. Antes de publicar, troque por fotos próprias dos produtos, com direitos garantidos. O arquivo <code>src/img/creditos.json</code> guarda a origem de cada imagem.</p>
        </div>
      </div>

      ${grupos
        .map(
          ([fonte, itens]) => `
        <section class="creditos__grupo">
          <h2>${esc(fonte)}</h2>
          <p class="creditos__nota">${
            fonte === "Wikimedia Commons"
              ? "Imagens sob licenças Creative Commons ou domínio público. Consulte a página de cada arquivo para os termos completos."
              : "Fotos de uso comercial gratuito, sem atribuição obrigatória. Mantemos os créditos por cortesia."
          }</p>
          <div class="creditos__grade">
            ${itens
              .map(
                (c) => `
              <a class="credito" href="${esc(c.pagina || c.url || "#")}" target="_blank" rel="noopener">
                <img src="/assets/img/${esc(c.arquivo)}" alt="" width="120" height="120" loading="lazy">
                <span><strong>${esc(c.arquivo)}</strong><small>${esc(c.autor || fonte)}</small><small class="credito__licenca">${esc(c.licenca || "Ver licença")}</small></span>
                ${icone("setaDiagonal")}
              </a>`
              )
              .join("")}
          </div>
        </section>`
        )
        .join("")}

      <div class="creditos__fontes">
        <h2>Tipografia</h2>
        <p><strong>Fraunces</strong> e <strong>Inter</strong>, distribuídas sob a SIL Open Font License. Arquivos self-hosted em <code>src/fontes/</code>.</p>
      </div>
    </div>
  </section>`;

  return layout({
    titulo: "Créditos das fotos",
    descricao: "Créditos e licenças das fotografias usadas na demonstração da Casa Viva.",
    corpo,
    caminho: "/creditos/",
    imagem: "cat-casa",
    imagemAlt: "Ambiente minimalista em tons neutros",
    semNewsletter: true,
    classe: "pagina-creditos",
  });
}

// ---------------------------------------------------------------- 404

export function pagina404() {
  const corpo = `
  <section class="erro-404">
    <div class="wrap erro-404__interno">
      <p class="erro-404__codigo">404</p>
      <p class="eyebrow">Essa página saiu de casa</p>
      <h1>Não encontramos o que você procurava.</h1>
      <p>O link pode estar quebrado ou a página mudou de lugar. Mas a casa continua aberta: comece por uma categoria ou faça uma busca.</p>
      <form class="busca busca--grande" role="search" action="/busca/" method="get">
        ${icone("busca", "busca__icone")}
        <label class="sr-only" for="busca-404">Buscar produtos</label>
        <input id="busca-404" type="search" name="q" placeholder="O que você procura?">
        <button class="btn btn--principal" type="submit">Buscar</button>
      </form>
      <div class="erro-404__links">
        ${categorias.map((c) => `<a class="chip" href="/${c.slug}/">${esc(c.nome)}</a>`).join("")}
        <a class="chip" href="/ofertas/">Ofertas</a>
        <a class="chip" href="/contato/">Contato</a>
      </div>
      <a class="btn btn--fantasma" href="/">Voltar para o início ${icone("seta")}</a>
    </div>
    <div class="erro-404__img" aria-hidden="true">
      <img src="/assets/img/amb-sofas-1.jpg" alt="" width="1600" height="1616" loading="lazy">
    </div>
  </section>`;

  return layout({
    titulo: "Página não encontrada",
    descricao: "A página que você procurou não existe ou mudou de endereço.",
    corpo,
    caminho: "/404.html",
    imagem: "amb-sofas-1",
    semNewsletter: true,
    noindex: true,
    classe: "pagina-404",
  });
}

export { estrelas, brl };
