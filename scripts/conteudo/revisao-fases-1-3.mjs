// Revisão das Fases 1 a 3 (resumo + flashcards).
// Fontes: Faculdade/1TDS Fase 01 (Domínio Financeiro; Engenharia de Software),
// Fiap/ÓRIA (FinFlow: user stories e INVEST; modelagem de casos de uso; modelos lógico e físico).
export const revisoes = [
  {
    fase: 1,
    titulo: "📚 Revisão Fase 1: domínio financeiro e engenharia de software",
    categoria: "Revisão Fase 1 · Finanças e Eng. de Software",
    essencial: `# Revisão Fase 1

## Domínio financeiro (a base do sistema)
- **Educação financeira** (OCDE): entender produtos, conceitos e riscos para decidir bem sobre o dinheiro. Não é só economizar.
- **Primeiro passo**: saber quanto entra (receitas) e quanto sai: despesas **fixas** (aluguel, streaming) e **variáveis** (mercado, lazer).
- **Metas** dão direção e precisam caber no orçamento.
- **Viver um degrau abaixo**: gastar menos do que ganha; cuidado com dívidas e inadimplência (juros e multas).
- **Reserva de emergência** antes de investir (ex.: Tesouro Selic, liquidez alta).
- **Renda fixa** (Tesouro, CDB, LCI/LCA) × **renda variável** (ações, FIIs, ETFs, cripto): mais retorno esperado, mais risco.
- **O desafio do ano**: um app que controla receitas, gastos, dívidas, investimentos e metas (a ÓRIA).

## Engenharia de software
- **Sistema** = componentes integrados (software, hardware, pessoas, dados) com um objetivo. O **software** é o produto central.
- **Ciclo de vida**: introdução → crescimento → maturidade → declínio.
- **Manutenções**: corretiva (bugs), adaptativa (mudança no negócio), preventiva (evitar problemas) e perfectiva (melhorar a experiência).
- **Ciclo de projeto**: entender o que fazer → desenhar → planejar → construir → validar → entregar.
- **Papéis**: engenheiro de software, arquiteto, analista de negócio, analista de sistemas, programador, engenheiro/analista/cientista de dados, DBA, segurança, suporte, gerente de projeto e de produto.`,
    flashcards: [
      ["O que é educação financeira, segundo a OCDE?", "O processo de entender produtos, conceitos e riscos financeiros para tomar decisões melhores sobre o dinheiro."],
      ["Despesa fixa × despesa variável: exemplos", "Fixa: aluguel, internet, streaming (todo mês, mesmo valor). Variável: mercado, lazer (muda a cada mês)."],
      ["Para que serve a reserva de emergência?", "Cobrir imprevistos (saúde, demissão, conserto) sem precisar se endividar e pagar juros."],
      ["Qual investimento é indicado para a reserva de emergência?", "Tesouro Selic: baixo risco e liquidez alta."],
      ["Renda fixa × renda variável", "Fixa: regras de rendimento definidas (Tesouro, CDB, LCI/LCA). Variável: retorno incerto (ações, FIIs, ETFs, cripto), mais risco."],
      ["Quais são as fases do ciclo de vida de um software?", "Introdução, crescimento, maturidade e declínio."],
      ["Os 4 tipos de manutenção de software", "Corretiva (corrige bugs), adaptativa (adapta a mudanças do negócio), preventiva (evita problemas futuros) e perfectiva (melhora a experiência)."],
      ["O que é um sistema, na engenharia de software?", "Um conjunto de componentes integrados (software, hardware, pessoas, dados) que trabalham juntos para um objetivo."],
      ["O que faz o analista de sistemas?", "Analisa requisitos e viabilidade, modela dados e comportamento, prototipa telas, valida modelos e testa o sistema integrado."],
      ["Gerente de projeto × gerente de produto", "Projeto: prazos, custos, tarefas e recursos. Produto: o que construir, para quem e o valor entregue ao longo do ciclo de vida."],
    ],
  },
  {
    fase: 2,
    titulo: "📚 Revisão Fase 2: requisitos, user stories e casos de uso",
    categoria: "Revisão Fase 2 · Requisitos e casos de uso",
    essencial: `# Revisão Fase 2: requisitos

## Requisitos ágeis (FinFlow)
- **Épico**: um objetivo grande, quebrado em histórias menores. Ex.: "Registro e categorização de gastos".
- **User story**: *Como* [quem], *quero* [o quê], *para* [por quê].
- **Critérios de aceitação**: as regras que dizem quando a história está pronta (ex.: valor entre R$ 0,01 e R$ 99.999,99).
- **INVEST**: Independente, Negociável, Valiosa, Estimável, Small (pequena), Testável.
- **Priorização**: primeiro o que é base do MVP (registrar gasto), depois o que gera valor (resumo do mês), e por último o que é conveniência (categorização automática).

## Casos de uso
- **Diagrama de contexto**: o sistema no centro e quem interage com ele (atores).
- **Diagrama de refinamento**: os casos de uso detalhados (o que cada ator faz).
- **Documento descritivo**: o passo a passo de cada caso de uso (fluxo principal, alternativos, pré e pós-condições).`,
    flashcards: [
      ["Qual o formato de uma user story?", "Como [tipo de usuário], quero [ação], para [benefício]."],
      ["O que são critérios de aceitação?", "Condições verificáveis que dizem quando uma user story está pronta e correta."],
      ["O que é um épico?", "Um objetivo grande do produto, quebrado em várias user stories menores."],
      ["O que significa INVEST?", "Independente, Negociável, Valiosa, Estimável, Small (pequena) e Testável."],
      ["No FinFlow, por que 'registrar gasto' vem em 1º na prioridade?", "É a base do MVP: sem a entrada de dados, nenhuma outra funcionalidade existe."],
      ["O que mostra o diagrama de contexto?", "O sistema como uma caixa no centro e os atores/sistemas externos que interagem com ele."],
      ["O que é um ator, em casos de uso?", "Quem interage com o sistema: uma pessoa, papel ou outro sistema."],
      ["O que vai no documento descritivo de um caso de uso?", "Nome, atores, pré-condições, fluxo principal passo a passo, fluxos alternativos e pós-condições."],
    ],
  },
  {
    fase: 3,
    titulo: "📚 Revisão Fase 3: modelagem de dados",
    categoria: "Revisão Fase 3 · Modelagem de dados",
    essencial: `# Revisão Fase 3: modelagem de dados

- **Modelo conceitual**: as ideias principais (entidades e relacionamentos), sem detalhe técnico.
- **Modelo lógico**: entidades com atributos, **chave primária (PK)**, **chave estrangeira (FK)** e cardinalidades (1:1, 1:N, N:N).
- **Modelo físico**: as tabelas como vão existir no banco (Oracle): nomes, tipos (\`VARCHAR2\`, \`NUMBER\`, \`DATE\`) e restrições.
- **Entidade** vira tabela; **atributo** vira coluna; **relacionamento 1:N** vira FK no lado N; **N:N** vira uma tabela associativa.
- Na ÓRIA: Usuário 1:N Conta, Conta 1:N Transação, Transação N:1 Categoria.

## Como saber que aprendeu
Você olha o Modelo Lógico da ÓRIA e diz onde fica cada FK e por quê.`,
    flashcards: [
      ["Conceitual × lógico × físico", "Conceitual: entidades e relações (ideia). Lógico: atributos, PK, FK e cardinalidade. Físico: tabelas reais com tipos e restrições no banco."],
      ["O que é chave primária (PK)?", "O atributo que identifica cada registro de forma única e não pode ser nulo."],
      ["O que é chave estrangeira (FK)?", "Uma coluna que aponta para a PK de outra tabela, ligando os registros e garantindo a integridade."],
      ["Num relacionamento 1:N, onde fica a FK?", "No lado N. Ex.: a tabela Transacao tem a FK da Conta."],
      ["Como se resolve um relacionamento N:N no modelo físico?", "Com uma tabela associativa, que tem as FKs das duas tabelas."],
      ["O que é cardinalidade?", "Quantos registros de uma entidade se ligam a quantos da outra (1:1, 1:N, N:N)."],
      ["Entidade, atributo e relacionamento viram o quê no banco?", "Entidade → tabela; atributo → coluna; relacionamento → chave estrangeira (ou tabela associativa)."],
      ["Tipos comuns do Oracle para texto, número e data", "VARCHAR2, NUMBER e DATE."],
    ],
  },
];
