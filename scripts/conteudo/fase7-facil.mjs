// Conteúdo "modo fácil" da Fase 7 (FIAP · Integration).
// passos: micro-passos de 10–15 min. recursos: "Nome | URL" (só URLs reais; buscas onde não há link fixo).
const yt = (termo) => `YouTube: ${termo} | https://www.youtube.com/results?search_query=${encodeURIComponent(termo)}`;
const alura = (termo) => `Alura: buscar "${termo}" | https://www.alura.com.br/busca?query=${encodeURIComponent(termo)}`;

export const capitulos = [
  {
    numero: 1,
    resumo:
      "A Fase 7 junta tudo o que você já viu: banco (Oracle), back-end (Java) e front-end (React). A ideia é entender o caminho de um dado: a tela pede, a API responde, o banco guarda.",
    passos: [
      "Ler o resumo da fase no portal (10 min), sem anotar nada",
      "Desenhar num papel: Tela → API → Banco, com uma seta em cada sentido",
      "Abrir o projeto Fintech do grupo e só olhar as pastas (sem mexer)",
    ],
    recursos: [
      "MDN: visão geral de cliente e servidor | https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview",
      yt("como funciona front-end back-end e banco de dados"),
    ],
  },
  {
    numero: 2,
    resumo:
      "Back-end com Spring Boot: você cria uma API REST em Java que conversa com o Oracle. Controller recebe a requisição, Service tem a regra, Repository fala com o banco.",
    passos: [
      "Gerar um projeto vazio no Spring Initializr (Web + JPA + Oracle Driver)",
      "Seguir o guia oficial 'Building a RESTful Web Service' até o primeiro GET funcionar",
      "Criar um endpoint /ping que responde 'ok' e testar no navegador",
      "Ler a parte do guia de JPA sobre @Entity e Repository (15 min)",
    ],
    recursos: [
      "Spring Initializr | https://start.spring.io/",
      "Guia oficial: REST com Spring | https://spring.io/guides/gs/rest-service/",
      "Guia oficial: dados com JPA | https://spring.io/guides/gs/accessing-data-jpa/",
      alura("Spring Boot"),
      yt("spring boot api rest oracle tutorial português"),
      "Postman (testar a API) | https://www.postman.com/downloads/",
    ],
  },
  {
    numero: 3,
    resumo:
      "Node.js roda JavaScript fora do navegador. TypeScript é JavaScript com tipos: o editor avisa o erro antes de você rodar.",
    passos: [
      "Instalar o Node LTS e rodar 'node -v' no terminal",
      "Fazer o 'TypeScript em 5 minutos' do site oficial",
      "No Playground do TS, criar uma interface Usuario e ver o erro quando falta um campo",
    ],
    recursos: [
      "Node.js: introdução oficial | https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
      "TypeScript em 5 minutos | https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html",
      "TypeScript Playground | https://www.typescriptlang.org/play",
      alura("TypeScript"),
      yt("typescript para iniciantes português"),
    ],
  },
  {
    numero: 4,
    resumo:
      "React monta a tela com componentes (funções que devolvem HTML). Vite cria e roda o projeto rapidinho.",
    passos: [
      "Criar um projeto com 'npm create vite@latest' (React + TypeScript) e rodar",
      "Trocar o texto do App.tsx e ver a tela atualizar sozinha",
      "Ler 'Seu primeiro componente' no react.dev e criar um <Cartao />",
    ],
    recursos: [
      "Vite: começando | https://vite.dev/guide/",
      "React: aprenda (oficial, tem em português) | https://react.dev/learn",
      "React: seu primeiro componente | https://react.dev/learn/your-first-component",
      alura("React"),
      yt("react vite do zero português"),
    ],
  },
  {
    numero: 5,
    resumo:
      "Props são os 'parâmetros' de um componente: o pai passa dados para o filho. React Router troca de página sem recarregar o site.",
    passos: [
      "Passar um nome por props para o <Cartao /> e mostrar na tela",
      "Ler 'Passando props' no react.dev (10 min)",
      "Instalar o React Router e criar duas rotas: / e /sobre",
    ],
    recursos: [
      "React: passando props | https://react.dev/learn/passing-props-to-a-component",
      "React Router (documentação) | https://reactrouter.com/",
      yt("react router dom tutorial português"),
    ],
  },
  {
    numero: 6,
    resumo:
      "State é a memória do componente (useState). Effect roda algo depois de desenhar a tela, como buscar dados (useEffect). Context compartilha um dado com vários componentes sem passar props em cascata.",
    passos: [
      "Fazer um contador com useState (um botão +1)",
      "Ler 'State: a memória de um componente' no react.dev",
      "Usar useEffect para mudar o título da aba quando o contador mudar",
      "Ler a página de Context e só entender o exemplo (sem codar)",
    ],
    recursos: [
      "React: state | https://react.dev/learn/state-a-components-memory",
      "React: sincronizando com effects | https://react.dev/learn/synchronizing-with-effects",
      "React: context | https://react.dev/learn/passing-data-deeply-with-context",
      yt("useState useEffect useContext explicado português"),
    ],
  },
  {
    numero: 7,
    resumo:
      "Next.js é um framework em cima do React: já vem com rotas por pastas, renderização no servidor e otimizações. Você cria páginas criando arquivos.",
    passos: [
      "Criar um app com 'npx create-next-app@latest' e rodar",
      "Criar a pasta app/sobre/page.tsx e abrir /sobre",
      "Fazer o primeiro capítulo do curso oficial Next.js Learn",
    ],
    recursos: [
      "Next.js Learn (curso oficial grátis) | https://nextjs.org/learn",
      "Next.js: documentação | https://nextjs.org/docs",
      alura("Next.js"),
      yt("next.js app router do zero português"),
    ],
  },
  {
    numero: 8,
    resumo:
      "Consumir API = o front pede dados com fetch e mostra na tela. Mock API é uma API de mentira para testar o front antes do back ficar pronto.",
    passos: [
      "Ler 'Usando Fetch' na MDN (10 min)",
      "Subir uma API falsa com json-server e um arquivo db.json",
      "Num componente, buscar a lista da API falsa e mostrar com .map()",
    ],
    recursos: [
      "MDN: usando Fetch | https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch",
      "json-server (API falsa em 1 minuto) | https://github.com/typicode/json-server",
      "Next.js: buscando dados | https://nextjs.org/docs/app/getting-started/fetching-data",
      yt("consumir api react fetch useEffect português"),
    ],
  },
  {
    numero: 9,
    resumo:
      "Estudo de caso do front-end: aplicar React/Next no projeto Fintech, ligando as telas à API do capítulo 2.",
    passos: [
      "Listar as telas do Fintech que o grupo precisa (só a lista)",
      "Escolher UMA tela e ligar a um endpoint (mesmo que mock)",
      "Mostrar para o grupo o que funcionou, mesmo que pequeno",
    ],
    recursos: [
      "React: pensando em React | https://react.dev/learn/thinking-in-react",
      yt("projeto fullstack spring boot react passo a passo"),
    ],
  },
  {
    numero: 10,
    resumo:
      "Grand Finale: entrega final do projeto Fintech em grupo (Grupo 37), até 05/11. Os passos com data estão na meta 'Atividade Grand Finale'.",
    passos: [
      "Abrir a meta do Grand Finale e marcar o primeiro passo",
      "Combinar com o grupo quem faz o quê (uma mensagem basta)",
    ],
    recursos: [],
  },
];

// Grand Finale (05/11) em passos pequenos com data
export const grandFinale = [
  ["16/10", "Ler o enunciado do Grand Finale com calma (só ler)"],
  ["17/10", "Mandar uma mensagem ao Grupo 37: 'bora dividir as partes?'"],
  ["20/10", "Anotar em 3 linhas o que a sua parte precisa entregar"],
  ["23/10", "Back-end: um endpoint funcionando (mesmo simples)"],
  ["27/10", "Front-end: uma tela mostrando dados da API (ou mock)"],
  ["31/10", "Juntar as partes do grupo e testar o fluxo principal"],
  ["02/11", "Revisar o que pede o enunciado e completar o que faltar"],
  ["04/11", "Ensaiar/entregar com folga: subir arquivos e links"],
  ["05/11", "Prazo final: conferir se a entrega foi enviada ✔"],
];

// Prova Polo (30/10): passos leves, um por dia de estudo
export const provaPolo = [
  ["16/10", "Revisar 10 flashcards da Fase 6 (filtro FIAP Fase 6)"],
  ["18/10", "Ler o resumo dos caps 1 a 3 da Fase 6"],
  ["21/10", "10 questões A–D da Fase 6"],
  ["23/10", "Ler o resumo dos caps 4 a 7 da Fase 6"],
  ["25/10", "10 questões A–D da Fase 6"],
  ["27/10", "Ler o resumo dos caps 8 a 10 da Fase 6"],
  ["29/10", "Separar documento e ver o caminho até a Unidade Paulista"],
  ["30/10", "Prova Polo às 17h. Você chegou até aqui 💜"],
];
