// Painel do lojista: estrutura renderizada no build, dados pelo admin.js.
import { layoutAdmin, LOGO, icone, esc, SITE } from "./ui.mjs";
import { loja } from "../data/catalogo.mjs";

export function paginaAdmin() {
  const corpo = `
  <div class="admin-login" data-admin-login>
    <div class="admin-login__lado">
      <a class="marca marca--clara" href="/">${LOGO("/", true)}</a>
      <div class="admin-login__texto">
        <p class="eyebrow eyebrow--claro">Área do lojista</p>
        <h1>A casa<br><em>na sua mão.</em></h1>
        <p>Atualize preços, acompanhe o estoque e mova os pedidos sem sair do navegador. Um painel simples, do tamanho da sua operação.</p>
        <ul class="lista-check lista-check--claro">
          <li>${icone("check")} Preços e estoque em tempo real</li>
          <li>${icone("check")} Pedidos com status e rastreio</li>
          <li>${icone("check")} Cupons e condições da loja</li>
        </ul>
      </div>
      <p class="admin-login__rodape">Casa Viva · painel demonstrativo · ${loja.ano}</p>
    </div>

    <main class="admin-login__caixa">
      <div class="admin-login__form-wrap">
        <div class="admin-login__simbolo">${icone("cadeado")}</div>
        <h2>Entrar no painel</h2>
        <p>Use a senha de demonstração para explorar o painel com o catálogo real da loja.</p>
        <form class="admin-login__form" data-admin-form novalidate>
          <div class="campo">
            <label for="admin-email">E-mail</label>
            <input id="admin-email" name="email" type="email" autocomplete="username" value="equipe@casaviva.com.br" required>
          </div>
          <div class="campo">
            <label for="admin-senha">Senha</label>
            <input id="admin-senha" name="senha" type="password" autocomplete="current-password" placeholder="Senha de demonstração" required>
          </div>
          <p class="campo__erro" data-admin-erro role="alert"></p>
          <button class="btn btn--principal btn--bloco" type="submit">Entrar ${icone("seta")}</button>
        </form>
        <div class="admin-login__dica">
          <strong>Demonstração</strong>
          <p>Senha: <code>casaviva</code> · Os dados são salvos apenas neste navegador (localStorage).</p>
        </div>
        <a class="admin-login__voltar" href="/">${icone("setaEsq")} Voltar para a loja</a>
      </div>
    </main>
  </div>

  <div class="admin-app" data-admin-app hidden>
    <aside class="admin-sidebar" data-admin-sidebar>
      <div class="admin-sidebar__topo">
        <a class="marca marca--clara" href="/">${LOGO("/", true)}</a>
        <span class="admin-sidebar__badge">Painel</span>
      </div>
      <nav class="admin-nav" aria-label="Painel">
        <button type="button" class="ativo" data-admin-nav="visao">${icone("ajustes")} Visão geral</button>
        <button type="button" data-admin-nav="produtos">${icone("pacote")} Produtos <span class="admin-nav__cont" data-admin-cont-produtos></span></button>
        <button type="button" data-admin-nav="pedidos">${icone("sacola")} Pedidos <span class="admin-nav__cont" data-admin-cont-pedidos></span></button>
        <button type="button" data-admin-nav="cupons">${icone("presente")} Cupons</button>
        <button type="button" data-admin-nav="config">${icone("cadeado")} Configurações</button>
      </nav>
      <div class="admin-sidebar__rodape">
        <a href="/" target="_blank" rel="noopener">${icone("setaDiagonal")} Ver a loja</a>
        <button type="button" data-admin-sair>${icone("setaEsq")} Sair</button>
        <p>${esc(loja.nomeCompleto)}<br>CNPJ ${loja.cnpj}</p>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-topo">
        <button class="icone-btn admin-topo__menu" type="button" data-admin-menu aria-label="Abrir menu do painel">${icone("menu")}</button>
        <div>
          <p class="admin-topo__rotulo">Painel da loja</p>
          <h1 data-admin-titulo>Visão geral</h1>
        </div>
        <div class="admin-topo__acoes">
          <span class="admin-topo__data" data-admin-data></span>
          <span class="admin-topo__avatar" aria-hidden="true">CV</span>
        </div>
      </header>

      <main class="admin-conteudo">
        <section class="admin-painel ativo" data-admin-painel="visao">
          <div class="admin-boas-vindas">
            <div><h2>Olá, equipe Casa Viva</h2><p>Aqui está o resumo da loja hoje. As alterações de preço e estoque aparecem imediatamente no site.</p></div>
            <button class="btn btn--contorno" type="button" data-admin-atualizar>${icone("troca")} Atualizar dados</button>
          </div>
          <div class="admin-stats" data-admin-stats></div>
          <div class="admin-duas-colunas">
            <section class="admin-bloco">
              <div class="admin-bloco__topo"><h2>Últimos pedidos</h2><button class="link-seta" type="button" data-admin-ir="pedidos">Ver todos ${icone("seta")}</button></div>
              <div data-admin-recentes></div>
            </section>
            <section class="admin-bloco">
              <div class="admin-bloco__topo"><h2>Estoque baixo</h2><button class="link-seta" type="button" data-admin-ir="produtos">Gerenciar ${icone("seta")}</button></div>
              <div data-admin-estoque-baixo></div>
            </section>
          </div>
          <div class="admin-aviso">
            ${icone("sparkle")}
            <div><strong>Ambiente de demonstração</strong><p>As alterações são salvas no seu navegador e aplicadas às páginas da loja. Para uma operação real, conecte o painel a um backend (Supabase, Firebase, API própria) e a um gateway de pagamento.</p></div>
          </div>
        </section>

        <section class="admin-painel" data-admin-painel="produtos" hidden>
          <div class="admin-bloco">
            <div class="admin-bloco__topo">
              <div><h2>Produtos</h2><p class="admin-bloco__sub">Edite preço e estoque. Campos em branco mantêm o valor original do catálogo.</p></div>
              <div class="admin-busca">${icone("busca")}<input type="search" placeholder="Buscar produto" data-admin-busca aria-label="Buscar produto"></div>
            </div>
            <div class="admin-tabela-wrap">
              <table class="admin-tabela">
                <thead><tr><th>Produto</th><th>Preço atual</th><th>Novo preço (R$)</th><th>Estoque</th><th>Novo estoque</th><th>Status</th></tr></thead>
                <tbody data-admin-produtos></tbody>
              </table>
            </div>
            <div class="admin-salvar" data-admin-salvar>
              <p><strong data-admin-alteracoes>0 alterações</strong> <span>não salvas</span></p>
              <div><button class="btn btn--texto" type="button" data-admin-descartar>Descartar</button><button class="btn btn--principal" type="button" data-admin-salvar-btn>Salvar alterações</button></div>
            </div>
          </div>
        </section>

        <section class="admin-painel" data-admin-painel="pedidos" hidden>
          <div class="admin-bloco">
            <div class="admin-bloco__topo">
              <div><h2>Pedidos</h2><p class="admin-bloco__sub">Pedidos de demonstração são criados ao finalizar uma compra na loja. Mude o status para acompanhar o fluxo.</p></div>
              <button class="btn btn--contorno" type="button" data-admin-pedido-demo>${icone("mais")} Criar pedido de teste</button>
            </div>
            <div data-admin-pedidos-lista></div>
          </div>
        </section>

        <section class="admin-painel" data-admin-painel="cupons" hidden>
          <div class="admin-bloco">
            <div class="admin-bloco__topo"><div><h2>Cupons ativos</h2><p class="admin-bloco__sub">Cupons definidos no catálogo. Para editar, altere <code>data/catalogo.mjs</code> e gere o site novamente.</p></div></div>
            <div class="admin-tabela-wrap">
              <table class="admin-tabela">
                <thead><tr><th>Código</th><th>Benefício</th><th>Mínimo</th><th>Descrição</th></tr></thead>
                <tbody data-admin-cupons></tbody>
              </table>
            </div>
          </div>
          <div class="admin-bloco">
            <div class="admin-bloco__topo"><div><h2>Frete grátis</h2><p class="admin-bloco__sub">Regra aplicada automaticamente no carrinho.</p></div></div>
            <p class="admin-config-linha">Frete grátis acima de <strong>${(loja.freteGratisAcimaDe / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p>
            <p class="admin-config-linha">Desconto no Pix <strong>${(loja.descontoPix * 100).toFixed(0)}%</strong> · Parcelamento <strong>${loja.parcelasSemJuros}x sem juros</strong></p>
          </div>
        </section>

        <section class="admin-painel" data-admin-painel="config" hidden>
          <div class="admin-bloco">
            <div class="admin-bloco__topo"><div><h2>Configurações da demonstração</h2><p class="admin-bloco__sub">Gerencie os dados salvos localmente neste navegador.</p></div></div>
            <div class="admin-config">
              <div class="admin-config__item">
                <div><strong>Restaurar catálogo</strong><p>Remove todos os preços e estoques editados e volta aos valores originais de <code>data/catalogo.mjs</code>.</p></div>
                <button class="btn btn--contorno" type="button" data-admin-reset-produtos>Restaurar produtos</button>
              </div>
              <div class="admin-config__item">
                <div><strong>Apagar pedidos</strong><p>Remove os pedidos de demonstração salvos neste navegador. Não afeta os produtos.</p></div>
                <button class="btn btn--contorno" type="button" data-admin-reset-pedidos>Apagar pedidos</button>
              </div>
              <div class="admin-config__item admin-config__item--perigo">
                <div><strong>Apagar todos os dados</strong><p>Remove produtos editados, pedidos, conta e carrinho deste navegador. A loja volta ao estado inicial.</p></div>
                <button class="btn btn--perigo" type="button" data-admin-reset-tudo>Apagar tudo</button>
              </div>
            </div>
          </div>
          <div class="admin-bloco">
            <div class="admin-bloco__topo"><div><h2>Integrações</h2><p class="admin-bloco__sub">Pontos de extensão documentados no README.</p></div></div>
            <ul class="admin-integracoes">
              <li>${icone("cartao")} <div><strong>Pagamento</strong><p>Pix (payload EMV + CRC16), cartão (validação Luhn, simulado) e boleto. Conecte Mercado Pago, PagSeguro, Asaas ou Stripe no endpoint de criação de pedido.</p></div><span class="admin-tag">Demo</span></li>
              <li>${icone("caminhao")} <div><strong>Frete</strong><p>Tabela regional por faixa de CEP + hook para Correios/transportadora. ViaCEP usado para autocompletar endereço.</p></div><span class="admin-tag">Demo</span></li>
              <li>${icone("email")} <div><strong>E-mail e WhatsApp</strong><p>Links diretos de WhatsApp e formulário demonstrativo. Conecte um provedor de e-mail transacional para pedidos reais.</p></div><span class="admin-tag">Demo</span></li>
            </ul>
          </div>
          <div class="admin-bloco admin-bloco--sobre">
            <p><strong>Casa Viva</strong> · versão demonstrativa · ${loja.ano}<br>
            Site: <a href="${SITE}" target="_blank" rel="noopener">casaviva.com.br</a> · CNPJ ${loja.cnpj}</p>
          </div>
        </section>
      </main>
    </div>
    <div class="admin-sidebar__fundo" data-admin-fundo hidden></div>
  </div>`;

  return layoutAdmin({ titulo: "Painel do lojista", corpo });
}
