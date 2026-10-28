// Páginas transacionais: carrinho, checkout, confirmação, conta e favoritos.
import { loja, produtos, cupons } from "../data/catalogo.mjs";
import {
  brl,
  esc,
  icone,
  layout,
  cardProduto,
  trilha,
  estrelas,
} from "./ui.mjs";

const porSlug = new Map(produtos.map((p) => [p.slug, p]));

function crossSell() {
  const slugs = ["luminaria-arco", "kit-toalhas", "kit-organizadores", "mesa-lateral-nara"];
  return slugs.map((s) => porSlug.get(s)).filter(Boolean);
}

const selosCompra = `
  <div class="selos-compra">
    <span>${icone("cadeado")} Ambiente seguro</span>
    <span>${icone("cartao")} 12x sem juros</span>
    <span>${icone("troca")} Troca em 30 dias</span>
  </div>`;

// ---------------------------------------------------------------- CARRINHO

export function paginaCarrinho() {
  const corpo = `
  <section class="pagina-compra">
    <div class="wrap">
      ${trilha([{ rotulo: "Início", href: "/" }, { rotulo: "Carrinho" }])}
      <header class="compra-cabeca">
        <p class="eyebrow">Quase lá</p>
        <h1>Seu carrinho</h1>
        <p class="compra-cabeca__sub" data-carrinho-resumo>Conferindo as peças que você escolheu…</p>
      </header>

      <div class="compra-grade">
        <div class="compra-principal">
          <div class="carrinho-itens" data-carrinho-itens></div>

          <div class="vazio vazio--compra" data-carrinho-vazio hidden>
            ${icone("sacola")}
            <h2>Seu carrinho está vazio</h2>
            <p>Que tal começar pela sala? Temos sofás que abraçam e detalhes que mudam o ambiente inteiro.</p>
            <div class="vazio__acoes">
              <a class="btn btn--principal" href="/sofas/">Ver sofás</a>
              <a class="btn btn--fantasma" href="/produtos/">Explorar o catálogo</a>
            </div>
          </div>

          <div class="carrinho-extra" data-carrinho-extra>
            <div class="carrinho-frete">
              <div class="carrinho-frete__cabeca">
                <span class="carrinho-frete__icone">${icone("caminhao")}</span>
                <div><strong>Calcular frete</strong><p>Informe o CEP para ver o prazo da sua região.</p></div>
              </div>
              <form class="cep-form" data-cep-form data-contexto="carrinho">
                <label class="sr-only" for="cep-carrinho">CEP</label>
                <input id="cep-carrinho" name="cep" type="text" inputmode="numeric" placeholder="Seu CEP" maxlength="9" autocomplete="postal-code">
                <button class="btn btn--contorno" type="submit">Calcular</button>
              </form>
              <div class="cep-resultado" data-cep-resultado aria-live="polite"></div>
            </div>
            <div class="carrinho-cupom-atalho">
              <span>${icone("presente")}</span>
              <p><strong>Tem um cupom?</strong> Aplique no resumo do pedido. Primeira compra? Use <button type="button" data-cupom-atalho="BEMVINDO">BEMVINDO</button>.</p>
            </div>
          </div>

          <a class="link-seta carrinho-continuar" href="/produtos/">${icone("setaEsq")} Continuar comprando</a>
        </div>

        <aside class="resumo" aria-labelledby="resumo-titulo">
          <h2 id="resumo-titulo">Resumo do pedido</h2>

          <form class="cupom" data-cupom-form>
            <label for="cupom-codigo">Cupom de desconto</label>
            <div class="cupom__linha">
              <input id="cupom-codigo" name="cupom" type="text" placeholder="Código do cupom" autocomplete="off" maxlength="24">
              <button class="btn btn--contorno" type="submit">Aplicar</button>
            </div>
            <p class="cupom__msg" data-cupom-msg aria-live="polite"></p>
          </form>

          <div class="resumo__linhas">
            <div><span>Subtotal</span><span data-resumo-subtotal>${brl(0)}</span></div>
            <div data-resumo-desconto-linha hidden><span>Desconto <span data-resumo-cupom-nome></span></span><span class="texto-desconto" data-resumo-desconto>− ${brl(0)}</span></div>
            <div data-resumo-frete-linha><span>Frete</span><span data-resumo-frete>Calcular pelo CEP</span></div>
            <div class="resumo__total"><span>Total</span><strong data-resumo-total>${brl(0)}</strong></div>
            <div class="resumo__parcelas" data-resumo-parcelas>${loja.parcelasSemJuros}x sem juros no cartão</div>
          </div>

          <div class="resumo__pix" data-resumo-pix>
            ${icone("pix")}
            <div><strong data-resumo-pix-valor>${brl(0)}</strong><span>no Pix, com 5% de desconto</span></div>
          </div>

          <a class="btn btn--principal btn--bloco btn--grande" href="/checkout/" data-ir-checkout>Finalizar compra ${icone("seta")}</a>
          <p class="resumo__nota">${icone("cadeado")} Você será levado ao checkout seguro. Nenhum dado de cartão fica salvo neste site.</p>
          ${selosCompra}
        </aside>
      </div>

      <section class="secao secao--relacionada" aria-labelledby="complete-titulo">
        <div class="secao__topo">
          <div><p class="eyebrow">Complete a casa</p><h2 id="complete-titulo">Combina com o que você levou</h2></div>
          <a class="link-seta" href="/produtos/">Ver catálogo ${icone("seta")}</a>
        </div>
        <div class="grade-produtos grade-produtos--4">${crossSell().map((p) => cardProduto(p)).join("")}</div>
      </section>
    </div>
  </section>`;

  return layout({
    titulo: "Carrinho",
    descricao: "Confira os produtos do seu carrinho, calcule o frete e finalize sua compra na Casa Viva.",
    corpo,
    caminho: "/carrinho/",
    semNewsletter: true,
    noindex: true,
    classe: "pagina-carrinho",
  });
}

// ---------------------------------------------------------------- CHECKOUT

export function paginaCheckout() {
  const corpo = `
  <section class="pagina-compra pagina-checkout">
    <div class="wrap">
      ${trilha([{ rotulo: "Início", href: "/" }, { rotulo: "Carrinho", href: "/carrinho/" }, { rotulo: "Finalizar compra" }])}
      <header class="compra-cabeca compra-cabeca--checkout">
        <div>
          <p class="eyebrow">Compra segura</p>
          <h1>Finalizar compra</h1>
        </div>
        <a class="checkout__login" href="/conta/?voltar=/checkout/">Já tem conta? <strong>Entrar</strong></a>
      </header>

      <ol class="etapas" data-etapas>
        <li class="etapa ativa" data-etapa-indicador="1"><span>1</span> Identificação</li>
        <li class="etapa" data-etapa-indicador="2"><span>2</span> Entrega</li>
        <li class="etapa" data-etapa-indicador="3"><span>3</span> Pagamento</li>
      </ol>

      <div class="compra-grade compra-grade--checkout">
        <div class="checkout__principal">
          <form class="checkout__form" data-checkout novalidate>
            <section class="etapa-painel ativa" data-etapa="1" aria-labelledby="etapa-1">
              <div class="painel-cabeca"><span class="painel-numero">1</span><div><h2 id="etapa-1">Quem vai receber?</h2><p>Usamos seus dados apenas para o pedido e a nota fiscal.</p></div></div>
              <div class="campos">
                <div class="campo campo--largo">
                  <label for="nome">Nome completo</label>
                  <input id="nome" name="nome" type="text" autocomplete="name" required placeholder="Como no documento">
                  <small class="campo__erro" data-erro="nome"></small>
                </div>
                <div class="campo">
                  <label for="email">E-mail</label>
                  <input id="email" name="email" type="email" autocomplete="email" required placeholder="voce@email.com">
                  <small class="campo__erro" data-erro="email"></small>
                </div>
                <div class="campo">
                  <label for="telefone">Celular / WhatsApp</label>
                  <input id="telefone" name="telefone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="(11) 99999-0000">
                  <small class="campo__erro" data-erro="telefone"></small>
                </div>
                <div class="campo">
                  <label for="cpf">CPF</label>
                  <input id="cpf" name="cpf" type="text" inputmode="numeric" required placeholder="000.000.000-00" maxlength="14">
                  <small class="campo__erro" data-erro="cpf"></small>
                </div>
                <div class="campo campo--largo">
                  <label class="check check--termos"><input type="checkbox" name="newsletter" checked><span>Quero receber novidades e ofertas da Casa Viva por e-mail. Sem spam.</span></label>
                </div>
              </div>
              <div class="painel-acoes">
                <a class="btn btn--texto" href="/carrinho/">${icone("setaEsq")} Voltar ao carrinho</a>
                <button class="btn btn--principal" type="button" data-proximo="1">Continuar para entrega ${icone("seta")}</button>
              </div>
            </section>

            <section class="etapa-painel" data-etapa="2" aria-labelledby="etapa-2" hidden>
              <div class="painel-cabeca"><span class="painel-numero">2</span><div><h2 id="etapa-2">Onde entregamos?</h2><p>Preencha o CEP para buscarmos o endereço automaticamente.</p></div></div>
              <div class="campos">
                <div class="campo">
                  <label for="cep">CEP</label>
                  <input id="cep" name="cep" type="text" inputmode="numeric" autocomplete="postal-code" required placeholder="00000-000" maxlength="9">
                  <small class="campo__erro" data-erro="cep"></small>
                  <small class="campo__ajuda" data-cep-status></small>
                </div>
                <div class="campo campo--largo"></div>
                <div class="campo campo--largo">
                  <label for="logradouro">Endereço</label>
                  <input id="logradouro" name="logradouro" type="text" autocomplete="address-line1" required placeholder="Rua, avenida, alameda…">
                  <small class="campo__erro" data-erro="logradouro"></small>
                </div>
                <div class="campo">
                  <label for="numero">Número</label>
                  <input id="numero" name="numero" type="text" inputmode="numeric" required placeholder="123">
                  <small class="campo__erro" data-erro="numero"></small>
                </div>
                <div class="campo">
                  <label for="complemento">Complemento <span class="opcional">(opcional)</span></label>
                  <input id="complemento" name="complemento" type="text" placeholder="Apto, bloco, fundos">
                </div>
                <div class="campo">
                  <label for="bairro">Bairro</label>
                  <input id="bairro" name="bairro" type="text" autocomplete="address-line3" required placeholder="Seu bairro">
                  <small class="campo__erro" data-erro="bairro"></small>
                </div>
                <div class="campo">
                  <label for="cidade">Cidade</label>
                  <input id="cidade" name="cidade" type="text" autocomplete="address-level2" required placeholder="Cidade">
                  <small class="campo__erro" data-erro="cidade"></small>
                </div>
                <div class="campo campo--curto">
                  <label for="uf">UF</label>
                  <input id="uf" name="uf" type="text" autocomplete="address-level1" required placeholder="SP" maxlength="2">
                  <small class="campo__erro" data-erro="uf"></small>
                </div>
                <div class="campo campo--largo">
                  <label for="referencia">Ponto de referência <span class="opcional">(opcional)</span></label>
                  <input id="referencia" name="referencia" type="text" placeholder="Próximo a…">
                </div>
              </div>

              <fieldset class="opcoes-frete" data-opcoes-frete>
                <legend>Escolha a entrega</legend>
                <p class="opcoes-frete__vazio" data-frete-vazio>${icone("caminhao")} Informe o CEP para ver as opções de entrega.</p>
                <div data-frete-lista></div>
              </fieldset>

              <div class="painel-acoes">
                <button class="btn btn--texto" type="button" data-voltar="2">${icone("setaEsq")} Voltar</button>
                <button class="btn btn--principal" type="button" data-proximo="2">Continuar para pagamento ${icone("seta")}</button>
              </div>
            </section>

            <section class="etapa-painel" data-etapa="3" aria-labelledby="etapa-3" hidden>
              <div class="painel-cabeca"><span class="painel-numero">3</span><div><h2 id="etapa-3">Como você quer pagar?</h2><p>Pagamento processado em ambiente seguro.</p></div></div>

              <div class="metodos" role="radiogroup" aria-label="Forma de pagamento">
                <label class="metodo ativo">
                  <input type="radio" name="pagamento" value="pix" checked>
                  <span class="metodo__icone">${icone("pix")}</span>
                  <span class="metodo__texto"><strong>Pix</strong><small>5% de desconto · aprovação na hora</small></span>
                  <span class="metodo__tag">Melhor preço</span>
                </label>
                <label class="metodo">
                  <input type="radio" name="pagamento" value="cartao">
                  <span class="metodo__icone">${icone("cartao")}</span>
                  <span class="metodo__texto"><strong>Cartão de crédito</strong><small>Até 12x sem juros</small></span>
                </label>
                <label class="metodo">
                  <input type="radio" name="pagamento" value="boleto">
                  <span class="metodo__icone">${icone("boleto")}</span>
                  <span class="metodo__texto"><strong>Boleto bancário</strong><small>Vence em 2 dias úteis</small></span>
                </label>
              </div>

              <div class="pagamento-painel" data-pagamento-painel="pix">
                <div class="aviso-pix">
                  ${icone("pix")}
                  <div>
                    <strong>Você economiza <span data-pix-economia>R$ 0,00</span></strong>
                    <p>Ao finalizar, geramos um código Pix copia e cola. O pedido é confirmado assim que o pagamento é identificado — em geral, em segundos.</p>
                  </div>
                </div>
              </div>

              <div class="pagamento-painel" data-pagamento-painel="cartao" hidden>
                <div class="campos">
                  <div class="campo campo--largo">
                    <label for="cartao-numero">Número do cartão</label>
                    <input id="cartao-numero" name="cartao-numero" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="19">
                    <small class="campo__erro" data-erro="cartao-numero"></small>
                  </div>
                  <div class="campo campo--largo">
                    <label for="cartao-nome">Nome impresso no cartão</label>
                    <input id="cartao-nome" name="cartao-nome" type="text" autocomplete="cc-name" placeholder="Como está no cartão">
                    <small class="campo__erro" data-erro="cartao-nome"></small>
                  </div>
                  <div class="campo">
                    <label for="cartao-validade">Validade</label>
                    <input id="cartao-validade" name="cartao-validade" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" maxlength="5">
                    <small class="campo__erro" data-erro="cartao-validade"></small>
                  </div>
                  <div class="campo">
                    <label for="cartao-cvv">CVV</label>
                    <input id="cartao-cvv" name="cartao-cvv" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4">
                    <small class="campo__erro" data-erro="cartao-cvv"></small>
                  </div>
                  <div class="campo campo--largo">
                    <label for="cartao-parcelas">Parcelamento</label>
                    <select id="cartao-parcelas" name="cartao-parcelas" data-parcelas-select></select>
                  </div>
                </div>
                <p class="pagamento__nota">${icone("cadeado")} Ambiente demonstrativo: nenhum dado de cartão é enviado ou armazenado. Em produção, integre o checkout transparente do seu gateway (Mercado Pago, PagSeguro, Stripe etc.).</p>
              </div>

              <div class="pagamento-painel" data-pagamento-painel="boleto" hidden>
                <div class="aviso-boleto">
                  ${icone("boletoDocumento")}
                  <div>
                    <strong>Boleto bancário</strong>
                    <p>O boleto é gerado após a confirmação do pedido e vence em 2 dias úteis. A compensação pode levar até 2 dias úteis após o pagamento.</p>
                  </div>
                </div>
              </div>

              <label class="check check--termos check--final">
                <input type="checkbox" name="aceite" required>
                <span>Li e aceito os <a href="/trocas-e-devolucoes/" target="_blank">termos de troca e devolução</a> e a <a href="/privacidade/" target="_blank">política de privacidade</a>.</span>
              </label>
              <small class="campo__erro" data-erro="aceite"></small>

              <div class="painel-acoes painel-acoes--final">
                <button class="btn btn--texto" type="button" data-voltar="3">${icone("setaEsq")} Voltar</button>
                <button class="btn btn--principal btn--grande" type="submit" data-finalizar>Finalizar pedido ${icone("cadeado")}</button>
              </div>
              <p class="checkout__seguranca">${icone("seguranca")} Seus dados são transmitidos com criptografia. Compra protegida pela Casa Viva.</p>
            </section>
          </form>
        </div>

        <aside class="resumo resumo--checkout" aria-labelledby="resumo-checkout">
          <h2 id="resumo-checkout">Seu pedido</h2>
          <div class="resumo__itens" data-checkout-itens></div>
          <form class="cupom" data-cupom-form>
            <label for="cupom-checkout">Cupom de desconto</label>
            <div class="cupom__linha">
              <input id="cupom-checkout" name="cupom" type="text" placeholder="Código do cupom" autocomplete="off" maxlength="24">
              <button class="btn btn--contorno" type="submit">Aplicar</button>
            </div>
            <p class="cupom__msg" data-cupom-msg aria-live="polite"></p>
          </form>
          <div class="resumo__linhas">
            <div><span>Subtotal</span><span data-checkout-subtotal>${brl(0)}</span></div>
            <div data-checkout-desconto-linha hidden><span>Desconto</span><span class="texto-desconto" data-checkout-desconto>− ${brl(0)}</span></div>
            <div><span>Frete</span><span data-checkout-frete>A calcular</span></div>
            <div class="resumo__total"><span>Total</span><strong data-checkout-total>${brl(0)}</strong></div>
            <div class="resumo__parcelas" data-checkout-parcelas>${loja.parcelasSemJuros}x sem juros no cartão</div>
          </div>
          <div class="resumo__pix" data-checkout-pix>
            ${icone("pix")}
            <div><strong data-checkout-pix-valor>${brl(0)}</strong><span>no Pix, com 5% de desconto</span></div>
          </div>
          <ul class="resumo__beneficios">
            <li>${icone("check")} Frete grátis acima de ${brl(loja.freteGratisAcimaDe)}</li>
            <li>${icone("check")} Nota fiscal em todos os pedidos</li>
            <li>${icone("check")} Atendimento por WhatsApp</li>
          </ul>
          <a class="link-seta resumo__voltar" href="/carrinho/">${icone("setaEsq")} Editar carrinho</a>
          ${selosCompra}
        </aside>
      </div>
    </div>
  </section>`;

  return layout({
    titulo: "Finalizar compra",
    descricao: "Finalize seu pedido na Casa Viva com Pix, cartão em até 12x ou boleto.",
    corpo,
    caminho: "/checkout/",
    semNewsletter: true,
    noindex: true,
    classe: "pagina-checkout",
  });
}

// ---------------------------------------------------------------- CONFIRMAÇÃO

export function paginaConfirmacao() {
  const corpo = `
  <section class="pagina-compra confirmacao">
    <div class="wrap">
      <div class="confirmacao__carregando" data-confirmacao-carregando>
        ${icone("relogio")}
        <p>Carregando os detalhes do pedido…</p>
      </div>

      <div class="confirmacao__conteudo" data-confirmacao-conteudo hidden>
        <div class="confirmacao__topo">
          <span class="confirmacao__icone">${icone("check")}</span>
          <p class="eyebrow">Pedido confirmado</p>
          <h1>Obrigado, <span data-pedido-primeiro-nome>cliente</span>!</h1>
          <p class="confirmacao__lead">Recebemos o seu pedido <strong data-pedido-numero>#0000</strong>. Enviamos os detalhes para <span data-pedido-email>seu e-mail</span>.</p>
        </div>

        <div class="confirmacao__grade">
          <div class="confirmacao__principal">
            <section class="painel-confirmacao" data-pix-bloco hidden>
              <div class="painel-confirmacao__cabeca">
                <span class="painel-confirmacao__icone">${icone("pix")}</span>
                <div><h2>Pague com Pix</h2><p>Escaneie o QR Code ou use o código copia e cola. O pedido é confirmado automaticamente.</p></div>
              </div>
              <div class="pix-caixa">
                <div class="pix-qr" aria-label="QR Code Pix demonstrativo">
                  <div class="pix-qr__padrao" aria-hidden="true"></div>
                  <span class="pix-qr__selo">${icone("pix")}</span>
                </div>
                <div class="pix-caixa__texto">
                  <p class="pix-caixa__valor"><span>Valor com desconto</span><strong data-pix-valor>R$ 0,00</strong></p>
                  <p class="pix-caixa__aviso">${icone("relogio")} O código expira em 30 minutos.</p>
                  <label class="sr-only" for="pix-codigo">Código Pix copia e cola</label>
                  <textarea id="pix-codigo" class="pix-codigo" rows="3" readonly data-pix-codigo></textarea>
                  <button class="btn btn--principal btn--bloco" type="button" data-copiar-pix>${icone("check")} Copiar código Pix</button>
                  <p class="pix-caixa__nota">Demonstração: o QR Code é ilustrativo. O código copia e cola é um payload Pix EMV real, com CRC16 calculado.</p>
                </div>
              </div>
            </section>

            <section class="painel-confirmacao" data-cartao-bloco hidden>
              <div class="painel-confirmacao__cabeca">
                <span class="painel-confirmacao__icone">${icone("cartao")}</span>
                <div><h2>Pagamento aprovado</h2><p>O cartão foi aprovado (simulação) e o pedido já entrou na fila de separação.</p></div>
              </div>
            </section>

            <section class="painel-confirmacao" data-boleto-bloco hidden>
              <div class="painel-confirmacao__cabeca">
                <span class="painel-confirmacao__icone">${icone("boletoDocumento")}</span>
                <div><h2>Boleto gerado</h2><p>Pague até a data de vencimento. A compensação pode levar até 2 dias úteis.</p></div>
              </div>
              <div class="boleto-caixa">
                <div class="boleto-codigo" data-boleto-linha aria-hidden="true"></div>
                <p>Linha digitável</p>
                <code data-boleto-codigo>00000.00000 00000.000000 00000.000000 0 00000000000000</code>
                <button class="btn btn--contorno" type="button" data-copiar-boleto>Copiar linha digitável</button>
                <p class="pix-caixa__nota">Boleto demonstrativo, sem valor fiscal.</p>
              </div>
            </section>

            <section class="painel-confirmacao">
              <div class="painel-confirmacao__cabeca">
                <span class="painel-confirmacao__icone">${icone("caminhao")}</span>
                <div><h2>Entrega</h2><p data-pedido-prazo>Estimativa: 3 a 6 dias úteis</p></div>
              </div>
              <div class="entrega-dados">
                <p><strong data-pedido-nome>—</strong><br><span data-pedido-endereco>—</span></p>
                <p data-pedido-frete>—</p>
              </div>
            </section>

            <section class="painel-confirmacao">
              <div class="painel-confirmacao__cabeca">
                <span class="painel-confirmacao__icone">${icone("sacola")}</span>
                <div><h2>Itens do pedido</h2></div>
              </div>
              <div class="confirmacao__itens" data-pedido-itens></div>
              <div class="resumo__linhas resumo__linhas--confirmacao">
                <div><span>Subtotal</span><span data-pedido-subtotal>—</span></div>
                <div data-pedido-desconto-linha hidden><span>Desconto</span><span class="texto-desconto" data-pedido-desconto>—</span></div>
                <div><span>Frete</span><span data-pedido-frete-valor>—</span></div>
                <div class="resumo__total"><span>Total pago</span><strong data-pedido-total>—</strong></div>
              </div>
            </section>
          </div>

          <aside class="confirmacao__lateral">
            <div class="cartao-lateral">
              <h2>Acompanhe seu pedido</h2>
              <p>Você pode consultar o status a qualquer momento com o número do pedido e seu e-mail.</p>
              <a class="btn btn--principal btn--bloco" href="/rastreamento/">Rastrear pedido ${icone("seta")}</a>
              <a class="btn btn--fantasma btn--bloco" href="/conta/">Ir para minha conta</a>
              <hr>
              <p class="cartao-lateral__ajuda">${icone("whatsapp")} Precisa de ajuda? <a href="https://wa.me/${loja.whatsapp}" target="_blank" rel="noopener">Fale no WhatsApp</a></p>
              <p class="cartao-lateral__nota">${icone("email")} Cópia da confirmação enviada por e-mail (simulação).</p>
            </div>
            <div class="cartao-lateral cartao-lateral--leve">
              <h2>Enquanto isso…</h2>
              <p>Que tal já pensar no próximo canto da casa?</p>
              <a class="link-seta" href="/produtos/">Ver novidades ${icone("seta")}</a>
            </div>
          </aside>
        </div>
      </div>

      <div class="vazio" data-confirmacao-vazio hidden>
        ${icone("sacola")}
        <h2>Não encontramos esse pedido</h2>
        <p>O link pode ter expirado ou o pedido foi feito em outro navegador. Consulte em Minha conta ou fale com a gente.</p>
        <div class="vazio__acoes">
          <a class="btn btn--principal" href="/produtos/">Ver produtos</a>
          <a class="btn btn--fantasma" href="/contato/">Falar com a gente</a>
        </div>
      </div>
    </div>
  </section>`;

  return layout({
    titulo: "Pedido confirmado",
    descricao: "Seu pedido na Casa Viva foi confirmado.",
    corpo,
    caminho: "/pedido-confirmado/",
    semNewsletter: true,
    noindex: true,
    classe: "pagina-confirmacao",
  });
}

// ---------------------------------------------------------------- CONTA

export function paginaConta() {
  const corpo = `
  <section class="pagina-compra pagina-conta">
    <div class="wrap">
      ${trilha([{ rotulo: "Início", href: "/" }, { rotulo: "Minha conta" }])}

      <div class="conta-deslogada" data-conta-deslogada>
        <div class="conta-deslogada__intro">
          <p class="eyebrow">Sua casa, organizada</p>
          <h1>Minha conta</h1>
          <p>Acompanhe pedidos, salve endereços e guarde os seus favoritos. Tudo em um lugar só.</p>
          <ul class="lista-check">
            <li>${icone("check")} Histórico e rastreio de pedidos</li>
            <li>${icone("check")} Endereços salvos para comprar mais rápido</li>
            <li>${icone("check")} Favoritos sincronizados neste navegador</li>
            <li>${icone("check")} Ofertas antes de todo mundo</li>
          </ul>
          <div class="conta-deslogada__img">
            <img src="/assets/img/amb-casa-2.jpg" alt="Quarto aconchegante em tons neutros com abajur aceso" width="1600" height="1067" loading="lazy">
          </div>
        </div>

        <div class="conta-formas">
          <div class="abas" role="tablist" aria-label="Entrar ou criar conta">
            <button class="aba ativa" type="button" role="tab" aria-selected="true" data-aba="entrar">Entrar</button>
            <button class="aba" type="button" role="tab" aria-selected="false" data-aba="criar">Criar conta</button>
          </div>

          <form class="conta-form" data-form-entrar data-painel-aba="entrar" novalidate>
            <h2>Bem-vindo de volta</h2>
            <p class="conta-form__sub">Entre com o e-mail usado na sua compra.</p>
            <div class="campo"><label for="login-email">E-mail</label><input id="login-email" name="email" type="email" autocomplete="email" required placeholder="voce@email.com"></div>
            <div class="campo"><label for="login-senha">Senha</label><input id="login-senha" name="senha" type="password" autocomplete="current-password" required placeholder="Sua senha"></div>
            <p class="campo__erro" data-erro-login role="alert"></p>
            <button class="btn btn--principal btn--bloco" type="submit">Entrar ${icone("seta")}</button>
            <p class="conta-form__dica">Ambiente demonstrativo: use qualquer e-mail válido e uma senha com 4 ou mais caracteres. Os dados ficam apenas no seu navegador.</p>
          </form>

          <form class="conta-form" data-form-criar data-painel-aba="criar" hidden novalidate>
            <h2>Criar conta</h2>
            <p class="conta-form__sub">Leva menos de um minuto e ajuda a acompanhar seus pedidos.</p>
            <div class="campo"><label for="criar-nome">Nome completo</label><input id="criar-nome" name="nome" type="text" autocomplete="name" required placeholder="Seu nome"></div>
            <div class="campo"><label for="criar-email">E-mail</label><input id="criar-email" name="email" type="email" autocomplete="email" required placeholder="voce@email.com"></div>
            <div class="campo"><label for="criar-telefone">Celular</label><input id="criar-telefone" name="telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-0000"></div>
            <div class="campo"><label for="criar-senha">Crie uma senha</label><input id="criar-senha" name="senha" type="password" autocomplete="new-password" required minlength="4" placeholder="Mínimo 4 caracteres"></div>
            <label class="check check--termos"><input type="checkbox" name="aceite" required><span>Aceito a <a href="/privacidade/">política de privacidade</a> e os termos de uso.</span></label>
            <p class="campo__erro" data-erro-criar role="alert"></p>
            <button class="btn btn--principal btn--bloco" type="submit">Criar minha conta ${icone("seta")}</button>
          </form>
        </div>
      </div>

      <div class="conta-logada" data-conta-logada hidden>
        <header class="conta-logada__cabeca">
          <div><p class="eyebrow">Minha conta</p><h1>Olá, <span data-conta-nome>cliente</span></h1><p data-conta-email class="conta-logada__email"></p></div>
          <button class="btn btn--fantasma" type="button" data-sair>${icone("setaEsq")} Sair da conta</button>
        </header>

        <div class="conta-logada__grade">
          <nav class="conta-menu" aria-label="Seções da conta">
            <button class="ativo" type="button" data-painel="pedidos">${icone("pacote")} Meus pedidos</button>
            <button type="button" data-painel="dados">${icone("usuario")} Meus dados</button>
            <button type="button" data-painel="enderecos">${icone("local")} Endereços</button>
            <a href="/favoritos/">${icone("coracao")} Favoritos</a>
            <a href="/rastreamento/">${icone("caminhao")} Rastrear pedido</a>
          </nav>

          <div class="conta-paineis">
            <section class="conta-painel ativo" data-conta-painel="pedidos">
              <div class="conta-painel__topo"><h2>Meus pedidos</h2><a class="link-seta" href="/produtos/">Comprar novamente ${icone("seta")}</a></div>
              <div data-pedidos-lista></div>
              <div class="vazio vazio--conta" data-pedidos-vazio hidden>
                ${icone("pacote")}
                <h3>Você ainda não tem pedidos</h3>
                <p>Quando fizer sua primeira compra, ela aparece aqui com status e rastreio.</p>
                <a class="btn btn--principal" href="/produtos/">Explorar a loja</a>
              </div>
            </section>

            <section class="conta-painel" data-conta-painel="dados" hidden>
              <div class="conta-painel__topo"><h2>Meus dados</h2></div>
              <form class="conta-form conta-form--dados" data-form-dados>
                <div class="campo"><label for="dados-nome">Nome</label><input id="dados-nome" name="nome" type="text" required></div>
                <div class="campo"><label for="dados-email">E-mail</label><input id="dados-email" name="email" type="email" required></div>
                <div class="campo"><label for="dados-telefone">Celular</label><input id="dados-telefone" name="telefone" type="tel"></div>
                <div class="campo"><label for="dados-nascimento">Data de nascimento <span class="opcional">(opcional)</span></label><input id="dados-nascimento" name="nascimento" type="date"></div>
                <div class="campo campo--largo"><label class="check"><input type="checkbox" name="newsletter"><span>Quero receber a carta semanal da Casa Viva</span></label></div>
                <button class="btn btn--principal" type="submit">Salvar alterações</button>
              </form>
            </section>

            <section class="conta-painel" data-conta-painel="enderecos" hidden>
              <div class="conta-painel__topo"><h2>Endereços</h2><button class="btn btn--fantasma" type="button" data-novo-endereco>${icone("mais")} Novo endereço</button></div>
              <div class="enderecos-lista" data-enderecos-lista></div>
              <form class="conta-form conta-form--endereco" data-form-endereco hidden>
                <div class="campo"><label for="end-cep">CEP</label><input id="end-cep" name="cep" type="text" inputmode="numeric" placeholder="00000-000" maxlength="9"></div>
                <div class="campo campo--largo"><label for="end-logradouro">Endereço</label><input id="end-logradouro" name="logradouro" type="text"></div>
                <div class="campo"><label for="end-numero">Número</label><input id="end-numero" name="numero" type="text"></div>
                <div class="campo"><label for="end-complemento">Complemento</label><input id="end-complemento" name="complemento" type="text"></div>
                <div class="campo"><label for="end-bairro">Bairro</label><input id="end-bairro" name="bairro" type="text"></div>
                <div class="campo"><label for="end-cidade">Cidade</label><input id="end-cidade" name="cidade" type="text"></div>
                <div class="campo campo--curto"><label for="end-uf">UF</label><input id="end-uf" name="uf" type="text" maxlength="2"></div>
                <div class="campo campo--largo"><label class="check"><input type="checkbox" name="principal"><span>Usar como endereço principal</span></label></div>
                <div class="conta-form__acoes"><button class="btn btn--principal" type="submit">Salvar endereço</button><button class="btn btn--texto" type="button" data-cancelar-endereco>Cancelar</button></div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  return layout({
    titulo: "Minha conta",
    descricao: "Acesse sua conta Casa Viva para acompanhar pedidos, endereços e favoritos.",
    corpo,
    caminho: "/conta/",
    semNewsletter: true,
    noindex: true,
    classe: "pagina-conta",
  });
}

// ---------------------------------------------------------------- FAVORITOS

export function paginaFavoritos() {
  const populares = ["sofa-dublin-retratil", "mesa-centro-tulum", "luminaria-arco", "air-fryer-5l"];
  const corpo = `
  <section class="pagina-compra pagina-favoritos">
    <div class="wrap">
      ${trilha([{ rotulo: "Início", href: "/" }, { rotulo: "Favoritos" }])}
      <header class="compra-cabeca compra-cabeca--favoritos">
        <div><p class="eyebrow">Sua seleção</p><h1>Meus favoritos</h1><p class="compra-cabeca__sub" data-favoritos-resumo>As peças que você salvou para pensar com calma.</p></div>
        <a class="btn btn--fantasma" href="/produtos/">Continuar explorando ${icone("seta")}</a>
      </header>

      <div class="grade-produtos grade-produtos--4" data-favoritos-grade></div>

      <div class="vazio" data-favoritos-vazio hidden>
        ${icone("coracao")}
        <h2>Nenhum favorito ainda</h2>
        <p>Toque no coração de qualquer produto para guardar aqui. É uma boa forma de comparar antes de decidir.</p>
        <div class="vazio__acoes">
          <a class="btn btn--principal" href="/sofas/">Ver sofás</a>
          <a class="btn btn--fantasma" href="/produtos/">Ver catálogo</a>
        </div>
      </div>

      <div class="favoritos__sugestoes" data-favoritos-sugestoes>
        <p class="eyebrow">Para começar</p>
        <h2>Peças que costumam encantar</h2>
        <div class="grade-produtos grade-produtos--4">
          ${populares.map((s) => porSlug.get(s)).filter(Boolean).map((p) => cardProduto(p)).join("")}
        </div>
      </div>
    </div>
  </section>`;

  return layout({
    titulo: "Meus favoritos",
    descricao: "Veja os produtos que você salvou na Casa Viva.",
    corpo,
    caminho: "/favoritos/",
    semNewsletter: true,
    noindex: true,
    classe: "pagina-favoritos",
  });
}

export const cuponsDisponiveis = cupons;
export { estrelas };
