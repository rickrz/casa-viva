// Conteúdo editorial e institucional da Casa Viva.
// Separado do catálogo para facilitar a edição de textos sem mexer em preços.

export const vantagens = [
  {
    icone: "caminhao",
    titulo: "Frete grátis acima de R$ 2.990",
    texto: "Entrega agendada e embalagem reforçada para móveis e eletrodomésticos.",
  },
  {
    icone: "cartao",
    titulo: "Até 12x sem juros",
    texto: "No cartão de crédito, com parcelas fixas e sem surpresa na fatura.",
  },
  {
    icone: "troca",
    titulo: "30 dias para trocar",
    texto: "Não era o que você imaginava? A gente busca e troca sem burocracia.",
  },
  {
    icone: "atendimento",
    titulo: "Gente de verdade no WhatsApp",
    texto: "Time de atendimento de segunda a sábado, das 9h às 18h.",
  },
];

export const selos = [
  { icone: "cadeado", titulo: "Compra 100% segura", texto: "Dados protegidos e pagamento criptografado." },
  { icone: "medalha", titulo: "Loja verificada", texto: "CNPJ ativo e reputação 4,9 em mais de 2.400 avaliações." },
  { icone: "troca", titulo: "Troca facilitada", texto: "Primeira troca por conta da Casa Viva em até 30 dias." },
];

export const numeros = [
  { valor: "+18 mil", rotulo: "casas atendidas desde 2014" },
  { valor: "4,9/5", rotulo: "média das avaliações de clientes" },
  { valor: "98%", rotulo: "dos pedidos entregues no prazo" },
  { valor: "5 anos", rotulo: "de garantia na estrutura dos sofás" },
];

export const sobre = {
  titulo: "Uma casa viva se faz de escolhas boas",
  chamada:
    "A Casa Viva nasceu em 2014, numa sala pequena em São Paulo, com uma ideia simples: móveis e objetos que as pessoas realmente usam no dia a dia, com preço honesto e atendimento próximo.",
  historia: [
    "Começamos vendendo sofás de um ateliê parceiro no interior de Minas. O boca a boca cresceu, a sala ficou pequena e a loja ganhou um galpão. Hoje somos um time de 34 pessoas entre curadoria, atendimento, logística e montagem.",
    "A cada coleção, a pergunta é a mesma: isso deixa a casa mais confortável? Se a resposta não for um sim imediato, a peça não entra no catálogo. É por isso que temos menos produtos do que uma grande loja — e conhecemos cada um deles pelo nome.",
  ],
  valores: [
    {
      titulo: "Conforto de verdade",
      texto:
        "Testamos assento, tecido e mecanismo antes de vender. Sofá bom é aquele que continua confortável depois de dois anos de uso.",
    },
    {
      titulo: "Preço que faz sentido",
      texto:
        "Negociamos direto com fábricas e enxugamos o intermediário. Economia não vem de material ruim, vem de escolha consciente.",
    },
    {
      titulo: "Casa para todos",
      texto:
        "Do primeiro apartamento à casa da família inteira. Temos opções para caber no orçamento sem abrir mão de qualidade.",
    },
    {
      titulo: "Menos desperdício",
      texto:
        "Embalagens recicláveis, retalhos de tecido doados e transporte com rotas otimizadas. Ainda estamos aprendendo, mas vamos juntos.",
    },
  ],
  bastidores:
    "Nossa curadoria visita fábricas em Santa Catarina, Minas Gerais e São Paulo. A logística própria atende a Grande São Paulo; para o resto do Brasil, trabalhamos com transportadoras selecionadas e acompanhamos cada etapa até a sua porta.",
};

export const faq = [
  {
    categoria: "Pedidos",
    perguntas: [
      {
        q: "Como acompanho o meu pedido?",
        a: "Assim que o pedido é faturado, você recebe um e-mail com o código de rastreio. Também é possível acompanhar em Minha conta > Pedidos ou na página de Rastreamento, usando o número do pedido e o e-mail cadastrado. Atualizações importantes chegam por WhatsApp.",
      },
      {
        q: "Posso alterar ou cancelar um pedido?",
        a: "Sim, enquanto o pedido não sair para entrega. Fale com a gente pelo WhatsApp (11) 99999-0000 com o número do pedido em mãos. Se a nota fiscal já tiver sido emitida e o item estiver em transporte, o cancelamento é tratado como devolução.",
      },
      {
        q: "Preciso criar uma conta para comprar?",
        a: "Não. Você pode finalizar a compra informando apenas os dados de entrega. Ter uma conta ajuda a acompanhar pedidos, salvar endereços e favoritos — e leva menos de um minuto para criar.",
      },
      {
        q: "O pedido veio incompleto. O que faço?",
        a: "Confira a nota fiscal: algumas peças são enviadas em volumes separados e podem chegar em dias diferentes. Se ainda faltar algo, chame no WhatsApp em até 7 dias corridos com fotos da embalagem e da etiqueta de transporte.",
      },
    ],
  },
  {
    categoria: "Entrega",
    perguntas: [
      {
        q: "Qual o prazo de entrega?",
        a: "O prazo aparece no carrinho depois que você informa o CEP. Em geral, de 2 a 5 dias úteis na Grande São Paulo e de 4 a 12 dias úteis nas demais regiões. Móveis grandes têm entrega agendada por telefone.",
      },
      {
        q: "Vocês montam os móveis?",
        a: "Sofás e poltronas chegam prontos ou com os pés para rosquear, sem ferramentas. Mesas e estantes têm montagem simples. Para a região metropolitana de SP, oferecemos montagem opcional no checkout; para outras regiões, indicamos um parceiro local.",
      },
      {
        q: "A entrega é feita no apartamento?",
        a: "Sim, a entrega é no endereço informado, incluindo apartamento, desde que o elevador comporte o volume. Se não couber, a transportadora entra em contato para combinar a melhor forma. Em prédios sem elevador, a subida está inclusa em até 2 lances de escada.",
      },
      {
        q: "Posso retirar na loja?",
        a: "Pode. A retirada é gratuita no nosso centro de distribuição em São Paulo (Av. das Nações, 1200 — Vila Nova), de segunda a sexta, das 9h às 17h. Você recebe um e-mail quando o pedido estiver separado.",
      },
      {
        q: "E se ninguém estiver em casa?",
        a: "A transportadora tenta a entrega até três vezes, em dias úteis. Depois disso, o pedido retorna ao centro de distribuição e entramos em contato para reagendar — pode haver taxa de nova tentativa.",
      },
    ],
  },
  {
    categoria: "Pagamento",
    perguntas: [
      {
        q: "Quais formas de pagamento vocês aceitam?",
        a: "Pix (com 5% de desconto), cartão de crédito em até 12x sem juros, boleto bancário e cartão de débito na retirada. O Pix é aprovado na hora; o boleto leva até 2 dias úteis para compensar.",
      },
      {
        q: "O desconto do Pix vale para qualquer produto?",
        a: "Sim, o desconto de 5% é aplicado sobre o valor dos produtos em pedidos pagos por Pix, exceto quando já existe uma promoção exclusiva sinalizada na página do produto. Cupons e desconto Pix podem ser acumulados, respeitando o valor mínimo de cada cupom.",
      },
      {
        q: "Posso parcelar o frete?",
        a: "Sim. O valor do frete entra no total e pode ser parcelado junto com os produtos, sem juros, em até 12x. O valor mínimo da parcela é de R$ 20.",
      },
      {
        q: "Meu cartão foi recusado. O que pode ser?",
        a: "Confira limite disponível, dados do titular e se o cartão está liberado para compras online. Algumas operadoras bloqueiam a primeira compra por segurança. Se persistir, tente outro cartão ou pague por Pix.",
      },
    ],
  },
  {
    categoria: "Produtos",
    perguntas: [
      {
        q: "As fotos correspondem ao produto?",
        a: "As fotos são de ambientes reais e buscam mostrar cor, textura e proporção. Tons podem variar conforme a tela e a iluminação do ambiente. Tecidos naturais, madeira e cerâmica têm variações de veio e tom que tornam cada peça única.",
      },
      {
        q: "Como sei se o sofá cabe na minha sala?",
        a: "Cada página traz largura, profundidade e altura. Uma dica: deixe pelo menos 60 cm livres para circulação em frente ao sofá e meça a porta de entrada e o elevador antes de comprar. Se tiver dúvida, mande as medidas no WhatsApp que a gente ajuda.",
      },
      {
        q: "Os tecidos podem ser trocados?",
        a: "Os sofás e poltronas têm opções de tecido e cor na própria página do produto. Não fazemos customização de medidas ou de tecido fora das opções do catálogo.",
      },
      {
        q: "Qual a garantia dos produtos?",
        a: "A garantia varia por item e está na ficha técnica. Em geral: 5 anos para estrutura de sofás, 3 anos para mecanismos, 1 ano para eletrodomésticos e tecidos, e 90 dias para peças decorativas. A garantia legal de 30 dias do CDC é sempre respeitada.",
      },
    ],
  },
  {
    categoria: "Trocas e devoluções",
    perguntas: [
      {
        q: "Posso devolver um produto que não gostei?",
        a: "Sim. Você tem até 7 dias corridos a partir do recebimento para desistir da compra (direito de arrependimento) e até 30 dias para troca por outro item. O produto deve estar sem uso e na embalagem original. A primeira coleta é por nossa conta.",
      },
      {
        q: "Como solicitar uma troca ou devolução?",
        a: "Preencha o formulário na página Trocas e devoluções ou fale no WhatsApp. Em até 2 dias úteis enviamos a etiqueta ou agendamos a coleta. O reembolso é feito na mesma forma de pagamento em até 10 dias úteis após a conferência.",
      },
      {
        q: "Produto com defeito: como proceder?",
        a: "Envie fotos ou um vídeo curto mostrando o problema pelo WhatsApp. Se o defeito for de fabricação, providenciamos o reparo, a troca ou o reembolso, conforme o CDC. Não tente consertar por conta própria: isso pode invalidar a garantia.",
      },
    ],
  },
];

export const trocas = {
  titulo: "Trocas e devoluções",
  resumo:
    "Comprar pela internet deve ser tranquilo. Se a peça não ficou como você imaginava, a gente resolve — sem letras miúdas.",
  secoes: [
    {
      titulo: "Prazo para desistir da compra",
      paragrafos: [
        "Você tem até 7 dias corridos, contados a partir do recebimento, para desistir da compra sem precisar justificar o motivo. Esse é o direito de arrependimento previsto no Código de Defesa do Consumidor (art. 49).",
        "O produto deve estar sem uso, com todas as peças, acessórios, manual e embalagem original. A primeira coleta é gratuita e feita por nossa transportadora.",
      ],
    },
    {
      titulo: "Troca em até 30 dias",
      paragrafos: [
        "Além do prazo legal, oferecemos 30 dias para troca por outro produto ou por crédito na loja. A diferença de valor, para mais ou para menos, é ajustada no momento da troca.",
        "Itens de uso pessoal, como roupa de cama e banho, só podem ser trocados se estiverem lacrados. Peças sob medida e produtos de liquidação sinalizados como “sem troca” seguem essa condição.",
      ],
    },
    {
      titulo: "Produto com defeito",
      paragrafos: [
        "Se o produto apresentar defeito de fabricação, entre em contato em até 30 dias (produtos duráveis) ou 90 dias (duráveis, conforme a garantia legal) com fotos ou vídeo do problema.",
        "A Casa Viva providencia o reparo, a substituição das peças ou a troca do produto. Se o defeito não puder ser resolvido em até 30 dias, você pode escolher entre troca, restituição ou abatimento proporcional do preço.",
      ],
    },
    {
      titulo: "Como solicitar",
      paragrafos: [
        "Informe o número do pedido, o e-mail da compra e o motivo da solicitação pelo WhatsApp (11) 99999-0000 ou pelo formulário da página de contato.",
        "Em até 2 dias úteis, enviamos as instruções e a etiqueta de postagem (para itens pequenos) ou agendamos a coleta (para móveis e eletrodomésticos).",
      ],
    },
    {
      titulo: "Reembolso",
      paragrafos: [
        "Cartão de crédito: o estorno aparece em até duas faturas, conforme o prazo da operadora. Pix: devolvemos para a mesma chave em até 5 dias úteis. Boleto: solicitamos os dados bancários e transferimos em até 10 dias úteis.",
        "O frete pago na compra também é devolvido quando a desistência ocorre dentro dos 7 dias legais.",
      ],
    },
  ],
};

export const privacidade = {
  titulo: "Política de privacidade",
  resumo:
    "Esta política explica como a Casa Viva coleta, usa e protege os seus dados, em conformidade com a LGPD (Lei 13.709/2018).",
  atualizado: "Última atualização: 12 de outubro de 2026",
  secoes: [
    {
      titulo: "Quais dados coletamos",
      paragrafos: ["Coletamos apenas o necessário para atender ao seu pedido e melhorar a sua experiência:"],
      lista: [
        "Dados de identificação: nome, CPF, e-mail e telefone.",
        "Dados de entrega: endereço, CEP e referências de acesso.",
        "Dados de compra: produtos, valores, forma de pagamento e histórico de pedidos.",
        "Dados de navegação: páginas visitadas, dispositivo e cookies essenciais e de medida.",
      ],
    },
    {
      titulo: "Como usamos os dados",
      paragrafos: [
        "Usamos os dados para processar pedidos, emitir nota fiscal, calcular frete, prevenir fraudes, prestar atendimento e enviar comunicações que você autorizou.",
        "Não vendemos dados pessoais. Compartilhamos apenas o necessário com transportadoras, meios de pagamento e órgãos fiscais, sempre sob contrato e com finalidade específica.",
      ],
    },
    {
      titulo: "Cookies",
      paragrafos: [
        "Utilizamos cookies essenciais para manter o carrinho e a sessão, e cookies de medida para entender como as páginas são usadas. Você pode bloquear cookies no navegador, mas algumas funções da loja podem deixar de funcionar.",
        "Nesta versão demonstrativa, carrinho, favoritos e conta são salvos apenas no seu navegador (localStorage) e não são enviados para nenhum servidor.",
      ],
    },
    {
      titulo: "Seus direitos",
      paragrafos: [
        "Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade ou exclusão dos seus dados, além de revogar consentimentos.",
        "Envie a solicitação para privacidade@casaviva.com.br. Respondemos em até 15 dias, conforme a LGPD.",
      ],
    },
    {
      titulo: "Segurança e retenção",
      paragrafos: [
        "Adotamos criptografia em trânsito (HTTPS), controle de acesso e registro de operações. Dados fiscais são mantidos pelo prazo legal de 5 anos; os demais são excluídos quando deixam de ser necessários.",
        "Em caso de incidente que possa gerar risco relevante, comunicaremos os titulares e a ANPD nos prazos legais.",
      ],
    },
  ],
};

export const contato = {
  titulo: "Fale com a gente",
  resumo:
    "Dúvida sobre um produto, pedido em andamento ou só uma ideia para a casa? Escolha o canal que preferir — respondemos de verdade.",
  canais: [
    {
      icone: "whatsapp",
      titulo: "WhatsApp",
      valor: "(11) 99999-0000",
      detalhe: "Segunda a sábado, das 9h às 18h",
      href: "https://wa.me/5511999990000?text=Ol%C3%A1%2C%20Casa%20Viva!%20Preciso%20de%20ajuda.",
    },
    {
      icone: "email",
      titulo: "E-mail",
      valor: "oi@casaviva.com.br",
      detalhe: "Resposta em até 1 dia útil",
      href: "mailto:oi@casaviva.com.br",
    },
    {
      icone: "telefone",
      titulo: "Telefone",
      valor: "(11) 4000-0000",
      detalhe: "Segunda a sexta, das 9h às 18h",
      href: "tel:+551140000000",
    },
    {
      icone: "local",
      titulo: "Showroom",
      valor: "Av. das Nações, 1200",
      detalhe: "Vila Nova, São Paulo/SP · visite com agendamento",
      href: "https://maps.google.com/?q=Av.+das+Na%C3%A7%C3%B5es+1200+S%C3%A3o+Paulo",
    },
  ],
  assuntos: [
    "Dúvida sobre um produto",
    "Meu pedido",
    "Troca ou devolução",
    "Pagamento",
    "Parceria ou imprensa",
    "Outro assunto",
  ],
};

export const rastreamento = {
  titulo: "Rastrear pedido",
  resumo:
    "Informe o número do pedido e o e-mail usado na compra. Você também encontra o rastreio em Minha conta > Pedidos.",
  etapas: [
    { titulo: "Pedido recebido", texto: "Confirmamos o pagamento e reservamos os seus itens." },
    { titulo: "Em separação", texto: "A equipe do centro de distribuição confere e embala tudo com cuidado." },
    { titulo: "Faturado", texto: "A nota fiscal é emitida e o código de rastreio é enviado por e-mail." },
    { titulo: "Em transporte", texto: "O pedido segue com a transportadora até a cidade de destino." },
    { titulo: "Saiu para entrega", texto: "A transportadora entra em contato para combinar a entrega." },
    { titulo: "Entregue", texto: "Confira os volumes na hora e assine o comprovante." },
  ],
};

export const newsletter = {
  titulo: "Uma boa ideia para a casa, toda semana",
  texto:
    "Novidades, dicas de decoração e ofertas antes de todo mundo. Sem spam — só o que vale a pena abrir.",
  sucesso: "Pronto! Você vai receber a nossa próxima carta. Obrigado por acompanhar a Casa Viva.",
};

// Avaliações usadas nas páginas de produto (combinadas de forma determinística).
export const avaliacoes = [
  {
    nome: "Mariana L.",
    cidade: "São Paulo, SP",
    nota: 5,
    titulo: "Chegou antes do prazo e é ainda mais bonito",
    texto:
      "Comprei desconfiada do tamanho, mas coube perfeito na sala. A cor é exatamente a da foto e a entrega foi cuidadosa. Já indiquei para duas amigas.",
    data: "12/09/2026",
    util: 14,
  },
  {
    nome: "Rafael M.",
    cidade: "Curitiba, PR",
    nota: 5,
    titulo: "Qualidade que dá para sentir",
    texto:
      "O acabamento surpreende pelo preço. Montei sozinho em dez minutos e ficou firme, sem nenhum barulho. O atendimento pelo WhatsApp também foi rápido.",
    data: "28/08/2026",
    util: 9,
  },
  {
    nome: "Camila R.",
    cidade: "Belo Horizonte, MG",
    nota: 4,
    titulo: "Muito bom, só achei um pouco mais claro",
    texto:
      "O produto é ótimo e chegou bem embalado. O tom é um pouquinho mais claro do que na tela, mas combinou com o resto da casa. Recomendo.",
    data: "03/08/2026",
    util: 6,
  },
  {
    nome: "João P.",
    cidade: "Porto Alegre, RS",
    nota: 5,
    titulo: "Custo-benefício excelente",
    texto:
      "Pesquisei em várias lojas e aqui foi o melhor preço com frete rápido. Embalagem reforçada e produto sem nenhum defeito.",
    data: "21/07/2026",
    util: 11,
  },
  {
    nome: "Ana Clara S.",
    cidade: "Recife, PE",
    nota: 4,
    titulo: "Bonito e funcional",
    texto:
      "Uso todos os dias e continua como novo. Só o prazo de entrega foi um pouco maior do que eu esperava, mas valeu a espera.",
    data: "09/07/2026",
    util: 4,
  },
];

export const institucional = {
  titulo: "A Casa Viva",
  links: [
    { rotulo: "Sobre a Casa Viva", href: "/sobre/" },
    { rotulo: "Contato", href: "/contato/" },
    { rotulo: "Trocas e devoluções", href: "/trocas-e-devolucoes/" },
    { rotulo: "Privacidade", href: "/privacidade/" },
    { rotulo: "Perguntas frequentes", href: "/faq/" },
    { rotulo: "Rastrear pedido", href: "/rastreamento/" },
  ],
};
