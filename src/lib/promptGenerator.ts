/**
 * Gerador de prompts para o "Professor Particular IA".
 * Não chama nenhuma API de IA — apenas monta um prompt estruturado que o
 * usuário copia e cola no ChatGPT, Claude ou Gemini de sua preferência.
 */
export function gerarPromptAulaCompleta(titulo: string, contexto?: string): string {
  return `Você é um professor particular especialista no assunto "${titulo}".${
    contexto ? ` Contexto adicional: ${contexto}` : ""
  }

Com base no material que vou colar/enviar a seguir sobre "${titulo}", por favor gere:

1. **Aula completa** explicando o conteúdo do zero, como se eu nunca tivesse visto antes, com exemplos práticos.
2. **Resumo** objetivo dos pontos mais importantes (bullet points).
3. **Exercícios** de fixação (mínimo 5), do mais fácil ao mais difícil, com gabarito comentado.
4. **Flashcards** no formato "Pergunta -> Resposta" (mínimo 10) para revisão espaçada.
5. **Questões de prova** estilo banca/concurso ou prova universitária (mínimo 5), com alternativas e resposta correta.
6. **Plano de revisão** sugerido (dia 1, dia 3, dia 7, dia 15, dia 30) para fixar esse conteúdo na memória de longo prazo.
7. **Mapa mental** em formato de tópicos hierárquicos (texto) conectando os principais conceitos.

Estruture a resposta com títulos claros para cada uma das 7 seções acima.`;
}

export function gerarPromptResumo(titulo: string): string {
  return `Resuma o conteúdo sobre "${titulo}" em tópicos claros e objetivos, destacando os conceitos-chave, definições importantes e relações entre os temas. Use bullet points e negrite os termos mais importantes.`;
}

export function gerarPromptExercicios(titulo: string): string {
  return `Crie 10 exercícios práticos sobre "${titulo}", organizados por nível de dificuldade (fácil, médio, difícil), com gabarito comentado explicando o raciocínio de cada resposta.`;
}

export function gerarPromptFlashcards(titulo: string): string {
  return `Crie 15 flashcards no formato "Pergunta -> Resposta" sobre "${titulo}", cobrindo os principais conceitos, definições e aplicações práticas, ideais para revisão espaçada.`;
}

export function gerarPromptMapaMental(titulo: string): string {
  return `Crie um mapa mental em formato de tópicos e subtópicos (texto hierárquico, usando indentação) sobre "${titulo}", conectando os principais conceitos e suas relações.`;
}
