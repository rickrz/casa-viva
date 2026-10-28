# Casa Viva

Loja virtual completa da **Casa Viva** — sofás, casa e eletrodomésticos — construída como site estático, sem dependências de runtime. O visual usa uma paleta de areia e papel com acento verde-petróleo, tipografia Fraunces + Inter e fotos de ambientes amplas.

> **Conforto que você sente desde o primeiro dia.**

O projeto inclui vitrine, catálogo com filtros, página de produto, carrinho, checkout em três etapas (Pix, cartão e boleto), conta do cliente, favoritos, páginas institucionais, rastreamento e um painel administrativo demonstrativo.

---

## 1. Como rodar

Pré-requisito: **Node.js 20.11 ou superior** (o projeto usa `import.meta.dirname`).

> No Windows, se o comando `node` não for reconhecido, use o caminho completo do executável, por exemplo:  
> `& "C:\Program Files\nodejs\node.exe" build.mjs`

```bash
# dentro da pasta casa-viva
node build.mjs     # gera o site em dist/
node server.mjs    # abre o preview em http://127.0.0.1:4174
```

Se preferir, use os atalhos do `package.json`:

```bash
npm run build
npm run preview
```

Para usar outra porta:

```bash
node server.mjs 8080
```

Para conferir se todos os links e imagens internas existem:

```bash
node tools/verificar-links.mjs
```

O servidor é apenas para desenvolvimento local: ele serve `dist/`, resolve URLs com barra final para `index.html` e envia `no-cache` para HTML, CSS e JS.

### Build

```bash
node build.mjs
```

O build:

- apaga e recria `dist/`;
- copia imagens e fontes;
- concatena os módulos de `src/css/` em `dist/assets/css/estilos.css`;
- copia `loja.js`, `admin.js` e gera `catalogo.js` a partir de `data/catalogo.mjs`;
- gera **59 páginas** com URLs amigáveis em pastas (`/sofas/`, `/produtos/sofa-viena-3-lugares/`);
- gera `sitemap.xml`, `robots.txt`, `manifest.webmanifest` e a página `404.html`.

> **`dist/` é gerado.** Nunca edite arquivos dentro dele: altere as fontes em `src/`, `lib/`, `data/` e rode o build novamente.
>
> Em pastas sincronizadas (OneDrive, Dropbox) o Windows pode travar um arquivo durante o build e exibir `EBUSY`. Feche o preview e rode `node build.mjs` de novo.

---

## 2. Publicação

O site é 100% estático: publique **o conteúdo da pasta `dist/`** em qualquer hospedagem.

### Netlify (mais simples)

1. Rode `node build.mjs`.
2. Acesse [app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta `dist`.
3. Pronto. Para atualizar, repita o processo (ou conecte um repositório com publish directory `dist` e build command `node build.mjs`).

Via CLI, se preferir:

```bash
npx netlify-cli deploy --dir dist --prod
```

### Vercel

```bash
npx vercel dist --prod
```

Ou importe o repositório e defina **Output Directory** como `dist` (sem framework). O projeto não precisa de build step na Vercel se você versionar o `dist`; caso contrário, use `node build.mjs` como Build Command.

### GitHub Pages

1. Rode o build.
2. Publique o conteúdo de `dist/` na branch `gh-pages` (ou configure uma Action que rode `node build.mjs` e envie `dist/`).
3. Em **Settings → Pages**, selecione a branch `gh-pages`.

O site usa caminhos absolutos a partir da raiz (`/assets/...`, `/produtos/...`). Por isso funciona em domínio próprio ou em um site de usuário/organização (`usuario.github.io`). Para publicar em **project page** (`usuario.github.io/repositorio/`), será necessário ajustar os caminhos e o `SITE` — o mais simples é usar um domínio próprio.

### Antes de publicar

- Troque `SITE` em `lib/ui.mjs` pelo domínio real (afeta canonical, Open Graph e sitemap).
- Revise os dados da loja em `data/catalogo.mjs` (WhatsApp, e-mail, CNPJ, endereço, redes).
- Substitua as fotos de demonstração pelas fotos reais da loja (veja a seção 6).
- Configure o redirecionamento de `404` para `/404.html` no host, se ele não fizer isso automaticamente.

---

## 3. Personalização rápida

| O que mudar | Onde |
| --- | --- |
| Nome, slogan, contatos, frete grátis, parcelas, desconto Pix | `data/catalogo.mjs` → `loja` |
| Categorias, subcategorias e produtos | `data/catalogo.mjs` → `categorias`, `produtos` |
| Cupons | `data/catalogo.mjs` → `cupons` |
| Tabela de frete por faixa de CEP | `data/catalogo.mjs` → `fretes` |
| Depoimentos, vantagens, FAQ, textos institucionais | `data/conteudo.mjs` |
| Cabeçalho, rodapé, newsletter, SEO e componentes | `lib/ui.mjs` |
| Home, listagens, produto e busca | `lib/paginas-loja.mjs` |
| Carrinho, checkout, confirmação, conta e favoritos | `lib/paginas-compra.mjs` |
| Páginas institucionais e 404 | `lib/paginas-institucional.mjs` |
| Painel administrativo | `lib/paginas-admin.mjs` |
| Cores, tipografia e espaçamentos | `src/css/00-base.css` |
| Comportamento da loja (carrinho, filtros, checkout...) | `src/loja.js` |
| Comportamento do painel | `src/admin.js` |

Os preços são sempre em **centavos**: `329000` = R$ 3.290,00.

### Exemplo: adicionar um produto

Em `data/catalogo.mjs`, copie um objeto de `produtos` e ajuste os campos:

```js
{
  slug: "mesa-nova",              // vira /produtos/mesa-nova/
  nome: "Mesa Nova",
  categoria: "casa",
  sub: "cama-mesa-banho",        // precisa existir em categorias
  marca: "Casa Viva",
  preco: 129900,
  precoAntigo: 159900,            // opcional
  imagem: "mesa-nova",            // src/img/mesa-nova.jpg + mesa-nova-800.jpg
  // ...demais campos do produto
}
```

Depois rode `node build.mjs`. O catálogo do navegador (`dist/assets/js/catalogo.js`) é regenerado automaticamente.

---

## 4. Painel administrativo

Acesse **`/admin/`** e use a senha de demonstração:

```
casaviva
```

O painel permite:

- ver vendas, ticket médio, pedidos e produtos com estoque baixo/esgotado;
- editar **preço e estoque** de qualquer produto (as mudanças aparecem na hora na vitrine);
- acompanhar pedidos e alterar o status (pago, separação, enviado, transporte, entregue, cancelado);
- criar um pedido de teste;
- consultar os cupons ativos;
- restaurar o catálogo, apagar pedidos ou apagar todos os dados locais.

> **Importante:** autenticação, pedidos, clientes e alterações do painel são **demonstrativos e ficam no `localStorage` do navegador**. Não há servidor nem banco de dados. Para produção, substitua essa camada por autenticação real e uma API. A senha fica em `src/admin.js` na constante `SENHA_DEMO`.

### Dados salvos no navegador

| Chave | Conteúdo |
| --- | --- |
| `cv:carrinho` | itens do carrinho |
| `cv:favoritos` | produtos favoritos |
| `cv:conta` | perfil e sessão do cliente |
| `cv:pedidos` | pedidos realizados |
| `cv:cupom` | cupom aplicado |
| `cv:frete` | frete escolhido |
| `cv:avaliacoes` | avaliações enviadas |
| `cv:newsletter` | inscrição na newsletter |
| `cv:admin:produtos` | preços/estoques editados no painel |
| `cv:admin:logado` | sessão do painel |

Para começar do zero em uma demonstração, use **Configurações → Apagar tudo** no painel ou limpe o armazenamento do site no navegador.

### Login de cliente (demonstração)

A conta do cliente aceita qualquer e-mail válido e uma senha com 4 ou mais caracteres. O cadastro, os endereços e o histórico de pedidos ficam no navegador.

### Cupons de demonstração

| Cupom | Regra |
| --- | --- |
| `BEMVINDO` | 5% na primeira compra (máx. R$ 200) |
| `CASA10` | 10% acima de R$ 1.500 (máx. R$ 300) |
| `SONHO100` | R$ 100 acima de R$ 2.000 |
| `FRETEGRATIS` | frete grátis acima de R$ 1.500 |

---

## 5. Pagamentos, frete e integrações

Esta versão é uma **vitrine funcional de demonstração**. O checkout calcula totais, gera um payload Pix válido (EMV + CRC16), simula boleto e valida cartão com Luhn — mas **não processa cobranças reais**.

Pontos de integração:

- **Pix / cartão / boleto:** `src/loja.js` → `montarPedido()`, `gerarPix()`, `gerarBoleto()` e o envio final em `iniciarCheckout()`. Troque a confirmação local por uma chamada ao seu gateway (Mercado Pago, Pagar.me, Stripe, Asaas etc.).
- **Frete:** `data/catalogo.mjs` → `fretes` define as faixas por CEP. Hoje o cálculo é regional, com autocompletar de endereço via **ViaCEP**. Para cotações reais, substitua `opcoesDeFrete()` em `src/loja.js` por uma chamada aos **Correios** ou a um agregador como **Melhor Envio**.
- **Pedidos:** `montarPedido()` grava o pedido em `localStorage` e gera o número `#CV...`. Em produção, envie esse objeto para sua API e use o `id` retornado.
- **Newsletter e contato:** os formulários apenas confirmam localmente; conecte a um CRM, e-mail marketing ou endpoint próprio em `iniciarNewsletter()` e `iniciarContato()`.

Nunca coloque chaves secretas de gateway no JavaScript do navegador. A cobrança deve ser criada no servidor.

---

## 6. Fotos e créditos

As imagens são **placeholders** obtidos de bancos gratuitos (Burst, Wikimedia e Picjumbo) e estão em `src/img/`, com uma versão `-800.jpg` para telas menores.

- Créditos completos: página **`/creditos/`** e arquivo `src/img/creditos.json`.
- Antes de publicar uma loja real, substitua todas as fotos por imagens próprias dos produtos e ambientes.
- Mantenha os mesmos nomes de arquivo e proporções para não quebrar o layout. Para cada foto `nome.jpg`, gere também `nome-800.jpg` (800 px de largura).
- O build copia automaticamente os dois arquivos para `dist/assets/img/`.

---

## 7. Estrutura do projeto

```
casa-viva/
├─ build.mjs                # gerador estático (sem dependências)
├─ server.mjs               # preview local
├─ package.json             # atalhos de build, preview e verificação
├─ tools/                   # download de fotos/fontes e verificador de links
├─ data/
│  ├─ catalogo.mjs          # loja, categorias, produtos, cupons, fretes
│  └─ conteudo.mjs          # textos, FAQ, depoimentos, selos
├─ lib/
│  ├─ ui.mjs                # layout, cabeçalho, rodapé, SEO, componentes
│  ├─ paginas-loja.mjs      # home, listagens, produto, busca
│  ├─ paginas-compra.mjs    # carrinho, checkout, confirmação, conta
│  ├─ paginas-institucional.mjs
│  └─ paginas-admin.mjs
├─ src/
│  ├─ css/                  # 9 módulos concatenados em estilos.css
│  ├─ fontes/               # Fraunces + Inter (woff2) e fontes.css
│  ├─ img/                  # fotos, variantes -800 e creditos.json
│  ├─ loja.js               # toda a lógica da vitrine
│  ├─ admin.js              # toda a lógica do painel
│  └─ favicon.svg
└─ dist/                    # gerado — é o que você publica
```

### CSS

Os módulos são concatenados em ordem alfabética:

`00-base` → `01-cabecalho` → `02-home` → `03-listagem` → `04-produto` → `05-compra` → `06-institucional` → `07-admin` → `08-responsivo`.

O CSS e o JS recebem automaticamente um `?v=<build>` para invalidar cache. Não é preciso renomear arquivos.

---

## 8. SEO, performance e acessibilidade

- Títulos e descrições únicos por página, canonical, Open Graph/Twitter e JSON-LD (produto, breadcrumb, organização e item list).
- URLs limpas em pastas, `sitemap.xml` e `robots.txt` (com áreas privadas bloqueadas).
- Imagens com `width`/`height`, `srcset` responsivo e carregamento tardio fora da primeira dobra.
- Fontes self-hosted com preload dos dois subsets latinos.
- Layout mobile-first, menu lateral, filtros off-canvas, barra fixa de compra no produto e checkout responsivo.
- Lighthouse nas principais páginas: **Acessibilidade 100, Boas práticas 100, SEO 100**.
- `prefers-reduced-motion` respeitado nas animações de interface.

Ao trocar textos ou produtos, rode o build e confira o resultado em `/sitemap.xml` e no painel do Lighthouse do navegador.

---

## 9. Compatibilidade

Navegadores modernos (Chrome, Edge, Firefox e Safari atuais), em desktop e celular. O site não usa frameworks nem build de terceiros; apenas HTML, CSS e JavaScript puro, com APIs nativas como `localStorage`, `fetch`, `dialog`/lightbox em HTML e CSS moderno.

---

## 10. Checklist antes de ir ao ar

- [ ] Rodar `node build.mjs` sem erros.
- [ ] Atualizar `SITE` em `lib/ui.mjs`.
- [ ] Revisar dados da loja, CNPJ, endereço, WhatsApp e redes.
- [ ] Trocar fotos e créditos.
- [ ] Revisar preços, estoque, parcelas, cupons e frete.
- [ ] Conectar pagamento e frete reais.
- [ ] Trocar a senha/autenticação do painel por uma solução de servidor.
- [ ] Configurar domínio, HTTPS e página 404 no host.
- [ ] Testar uma compra completa em celular e desktop.
