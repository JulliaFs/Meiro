// Trilhas de reforço "para refazer direito" das Fases 4, 5 e 6.
// Fontes: Fiap/ÓRIA (ROADMAP.md, DOCUMENTACAO.md), Fiap/OriaAppOO (classes Java) e Fiap/Fase 6.
const yt = (termo) => `YouTube: ${termo} | https://www.youtube.com/results?search_query=${encodeURIComponent(termo)}`;
const alura = (termo) => `Alura: buscar "${termo}" | https://www.alura.com.br/busca?query=${encodeURIComponent(termo)}`;

export const trilhas = [
  {
    fase: 4,
    tema: "Reforço: Telas (HTML, CSS e Tailwind)",
    essencial: `# Reforço Fase 4: as telas (view)

Sem pressa. Aqui o objetivo é só conseguir montar UMA tela da ÓRIA do zero e entender o que cada parte faz.

## O essencial
- **HTML** dá a estrutura: títulos, parágrafos, listas, botões, formulários.
- **CSS** dá a aparência. Os dois jeitos de organizar a tela são **Flexbox** (em linha ou coluna) e **Grid** (em grade).
- **Tailwind** é CSS escrito em classes prontas no próprio HTML: \`flex gap-4 p-6 rounded-xl\`.
- **Responsivo**: a mesma tela funciona no celular e no computador (\`md:\`, \`lg:\` no Tailwind).

## Como saber que aprendeu
Você recria o card de saldo do painel da ÓRIA olhando só o desenho, e ele fica bom no celular.

## Na ÓRIA
As telas estão no Atividade_cap7.pdf: perfil, painel, simulador, plano de ação e chat. Comece pelo painel.`,
    passos: [
      "Jogar 10 min de Flexbox Froggy",
      "Ler 'Estilizando com classes utilitárias' do Tailwind (só ler)",
      "Montar um card com título e um número grande (saldo)",
      "Deixar o card bonito no celular (testar com a tela estreita)",
      "Montar a lista das últimas transações abaixo do card",
      "Juntar card e lista na tela do painel da ÓRIA",
    ],
    recursos: [
      "MDN: HTML | https://developer.mozilla.org/pt-BR/docs/Web/HTML",
      "MDN: CSS | https://developer.mozilla.org/pt-BR/docs/Web/CSS",
      "Tailwind: classes utilitárias | https://tailwindcss.com/docs/styling-with-utility-classes",
      "Flexbox Froggy (jogo) | https://flexboxfroggy.com/#pt-br",
      "CSS Grid Garden (jogo) | https://cssgridgarden.com/#pt-br",
      "web.dev: aprenda CSS | https://web.dev/learn/css",
      alura("HTML e CSS"),
      yt("tailwind css do zero português"),
    ],
    flashcards: [
      ["Para que serve o HTML?", "Dar a estrutura e o significado do conteúdo da página: títulos, textos, listas, links, formulários."],
      ["Para que serve o CSS?", "Definir a aparência: cores, tamanhos, espaçamentos e o layout dos elementos."],
      ["Flexbox ou Grid: qual organiza em uma direção só?", "Flexbox (linha OU coluna). O Grid organiza em linhas E colunas ao mesmo tempo."],
      ["O que é Tailwind CSS?", "Um framework de classes utilitárias: você estiliza direto no HTML com classes prontas (ex.: p-4, flex, text-lg)."],
      ["O que faz o prefixo md: no Tailwind?", "Aplica a classe só a partir da largura média de tela (responsivo). Ex.: md:flex-row."],
      ["O que é design responsivo?", "A mesma página se adapta a telas diferentes (celular, tablet, computador)."],
      ["Qual a diferença entre margin e padding?", "Padding é o espaço de dentro (entre conteúdo e borda); margin é o espaço de fora (entre o elemento e os vizinhos)."],
      ["Para que serve a tag <form>?", "Agrupar campos de entrada (inputs) e enviar os dados preenchidos."],
    ],
  },
  {
    fase: 5,
    tema: "Reforço: Java orientado a objetos",
    essencial: `# Reforço Fase 5: Java orientado a objetos

Você já tem as classes da ÓRIA no OriaAppOO (Usuario, Conta, Transacao, Receita, Despesa, Investimento…). A ideia é entender o PORQUÊ delas.

## O essencial
- **Classe e objeto**: a classe é a fôrma, o objeto é o bolo. \`new Conta()\` cria um objeto.
- **Construtor**: o método que roda ao criar o objeto e preenche os dados iniciais.
- **Encapsulamento**: atributos \`private\`; o mundo só mexe por métodos (getters/setters ou métodos com regra, como \`depositar\`).
- **Herança**: \`Receita\` e \`Despesa\` herdam de \`Transacao\` (extends) e aproveitam o que ela já tem.
- **Polimorfismo**: o mesmo método se comporta diferente em cada filha (@Override).
- **Coleções**: \`List<Transacao>\` / \`ArrayList\` para guardar várias transações.
- **Diagrama de classes (UML)**: três caixas (nome, atributos, métodos), \`+\` público, \`-\` privado, e as linhas de herança e associação.

## Como saber que aprendeu
Você explica sem olhar o código por que o saldo é \`private\` e o que aconteceria se fosse \`public\`.

## Na ÓRIA
Abra Transacao.java, Receita.java e Despesa.java lado a lado: é herança na prática.`,
    passos: [
      "Abrir Transacao.java e Receita.java e achar a palavra extends",
      "Explicar em voz alta (ou escrever 2 linhas): o que é classe e o que é objeto",
      "Achar um atributo private numa classe e o método que mexe nele",
      "Criar uma Conta no Main e chamar um método dela",
      "Desenhar no draw.io a caixa da classe Conta (nome, atributos, métodos)",
      "Ligar Transacao → Receita/Despesa com a seta de herança",
    ],
    recursos: [
      "dev.java: aprenda Java (oficial) | https://dev.java/learn/",
      "Tutorial oficial: conceitos de OO | https://docs.oracle.com/javase/tutorial/java/concepts/index.html",
      "draw.io (diagramas) | https://app.diagrams.net/",
      "UML: diagrama de classes | https://www.uml-diagrams.org/class-diagrams-overview.html",
      alura("Java orientação a objetos"),
      yt("java orientação a objetos para iniciantes português"),
      yt("diagrama de classes UML explicado"),
    ],
    flashcards: [
      ["Qual a diferença entre classe e objeto?", "Classe é o molde (a fôrma); objeto é uma instância criada a partir dela (o bolo), com valores próprios."],
      ["O que é um construtor?", "Método especial, com o mesmo nome da classe, que roda no new e inicializa o objeto."],
      ["O que é encapsulamento?", "Esconder os atributos (private) e só permitir acesso por métodos, protegendo as regras do objeto."],
      ["O que significa extends?", "Herança: a classe filha herda atributos e métodos da classe mãe. Ex.: Receita extends Transacao."],
      ["O que é polimorfismo?", "O mesmo método se comporta de forma diferente em cada classe filha (sobrescrita com @Override)."],
      ["Para que serve o ArrayList?", "Guardar uma lista de objetos de tamanho variável. Ex.: List<Transacao> transacoes = new ArrayList<>();"],
      ["No diagrama de classes, o que significam + e -?", "+ é público; - é privado."],
      ["Quais as três partes da caixa de uma classe no UML?", "Nome da classe, atributos e métodos."],
      ["Por que deixar o saldo da Conta como private?", "Para ninguém alterar o saldo direto; só por métodos com regra (depositar/sacar), evitando valores inválidos."],
    ],
  },
  {
    fase: 6,
    tema: "Reforço: Oracle SQL e JDBC",
    essencial: `# Reforço Fase 6: banco de dados (Oracle, SQL e JDBC)

A Fase 6 já tem 345 flashcards e questões no Meiro (filtro "FIAP Fase 6" em Revisões). Esta trilha é o caminho curto para o essencial.

## O essencial
- **CREATE TABLE** cria a tabela; **chave primária (PK)** identifica cada linha; **chave estrangeira (FK)** liga uma tabela a outra.
- **CRUD**: \`INSERT\` (criar), \`SELECT\` (ler), \`UPDATE\` (alterar), \`DELETE\` (apagar). \`COMMIT\` confirma, \`ROLLBACK\` desfaz.
- **WHERE** filtra; **ORDER BY** ordena.
- **JOIN** junta duas tabelas pela FK ("transações com o nome da categoria").
- **GROUP BY + SUM/COUNT** somam por grupo ("quanto gastei por categoria").
- **JDBC**: o Java abre uma conexão, usa \`PreparedStatement\` com \`?\` e lê o \`ResultSet\`. O **DAO** é a classe que guarda esse código.

## Como saber que aprendeu
Você escreve sem ajuda a consulta "total gasto por categoria no mês, do maior para o menor".`,
    passos: [
      "Abrir o Oracle FreeSQL e rodar um SELECT qualquer",
      "Fazer as lições 1 e 2 do SQLBolt (SELECT e WHERE)",
      "Revisar 10 flashcards de 'FIAP Fase 6 · Cap 6' (JOINs)",
      "Escrever um JOIN entre duas tabelas da ÓRIA (no papel vale)",
      "Escrever um GROUP BY com SUM (gastos por categoria)",
      "Ler o resumo do cap 10 (JDBC e DAO) no Meiro",
    ],
    recursos: [
      "Oracle FreeSQL, antigo Live SQL (rodar SQL no navegador) | https://freesql.com/",
      "SQLBolt (lições interativas) | https://sqlbolt.com/",
      "W3Schools: SQL | https://www.w3schools.com/sql/",
      "Tutorial oficial: JDBC | https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html",
      alura("Oracle SQL"),
      yt("sql join group by explicado português"),
      yt("jdbc java oracle dao tutorial português"),
    ],
    flashcards: [],
  },
];
