import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "pt" | "en" | "es";

const STORAGE_KEY = "meiro_landing_lang";

interface Dictionary {
  nav: { features: string; philosophy: string; roadmap: string; faq: string; login: string; joinBeta: string };
  hero: { title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  preview: {
    today: string;
    thisWeek: string;
    rows: { label: string; meta: string }[];
    sessionsPlanned: string;
    overallProgress: string;
  };
  features: {
    label: string;
    title: string;
    items: { title: string; description: string }[];
  };
  why: { label: string; title: string; tools: string[]; unified: string };
  philosophy: {
    label: string;
    title: string;
    text: string;
    roadmapLabel: string;
    milestones: { label: string; status: string }[];
  };
  beta: { title: string; description: string; placeholder: string; button: string; success: string; error: string };
  faq: { label: string; title: string; items: { q: string; a: string }[] };
  footer: { privacy: string; terms: string; contact: string; rights: string };
}

const dictionaries: Record<Lang, Dictionary> = {
  en: {
    nav: { features: "Features", philosophy: "Philosophy", roadmap: "Roadmap", faq: "FAQ", login: "Login", joinBeta: "Join Beta" },
    hero: {
      title: "Clarity for Academic Growth.",
      subtitle: "Organize your subjects, tasks, notes, flashcards and academic life in one beautiful workspace.",
      ctaPrimary: "Join the Beta",
      ctaSecondary: "Learn More",
    },
    preview: {
      today: "Today",
      thisWeek: "This week",
      rows: [
        { label: "Linear Algebra: Problem Set 4", meta: "Due tomorrow" },
        { label: "Organic Chemistry: Ch. 7 notes", meta: "In progress" },
        { label: "Cell Biology flashcards", meta: "32 cards · 80% mastered" },
      ],
      sessionsPlanned: "sessions planned",
      overallProgress: "Overall progress",
    },
    features: {
      label: "Features",
      title: "Everything academic life needs, in one place.",
      items: [
        { title: "Subjects", description: "Organize every course and topic in a clear, structured map." },
        { title: "Tasks", description: "Track assignments and deadlines without losing the big picture." },
        { title: "Calendar", description: "See your academic life laid out in one focused timeline." },
        { title: "Flashcards", description: "Review and retain what matters with spaced repetition." },
        { title: "AI Assistant", description: "Get help summarizing, explaining and planning your studies." },
        { title: "Notes", description: "Capture ideas and lectures in one connected workspace." },
        { title: "Progress Tracking", description: "Understand how you're evolving, subject by subject." },
      ],
    },
    why: {
      label: "Why Meiro",
      title: "Stop juggling five apps to manage one academic life.",
      tools: ["Notion", "Calendar", "To-do apps", "Flashcards", "Notes"],
      unified: "One unified workspace: Meiro",
    },
    philosophy: {
      label: "Philosophy",
      title: "Studying shouldn't feel chaotic.",
      text:
        "Meiro was created on a simple belief: clarity comes before productivity. Before more features, more reminders or more pressure, students need one calm place to think, plan and grow, built to evolve with them, one step at a time.",
      roadmapLabel: "Roadmap",
      milestones: [
        { label: "Private Beta", status: "Now" },
        { label: "Public Launch", status: "Next" },
        { label: "Mobile App", status: "Planned" },
        { label: "AI Assistant v2", status: "Planned" },
      ],
    },
    beta: {
      title: "Beta Closed",
      description:
        "Meiro is currently available to a limited number of users. Join the waitlist and receive an invitation when new spots become available.",
      placeholder: "you@university.edu",
      button: "Join the Waitlist",
      success: "You're on the list, we'll be in touch.",
      error: "Something went wrong. Please try again.",
    },
    faq: {
      label: "FAQ",
      title: "Questions, answered.",
      items: [
        {
          q: "Is Meiro free?",
          a: "Meiro will offer a free tier for core features. Beta participants get early, full access while we shape the final pricing.",
        },
        {
          q: "When will the beta open?",
          a: "We're inviting users in small batches to keep the experience smooth. Join the waitlist and we'll reach out as new spots open up.",
        },
        {
          q: "Can I use it on mobile?",
          a: "Yes. Meiro works as a responsive web app today, with a dedicated mobile app planned on the roadmap.",
        },
        {
          q: "Who is Meiro for?",
          a: "Students who want one calm, organized place for subjects, tasks, notes, flashcards and progress, instead of juggling several disconnected apps.",
        },
      ],
    },
    footer: { privacy: "Privacy", terms: "Terms", contact: "Contact", rights: "All rights reserved." },
  },
  pt: {
    nav: { features: "Funcionalidades", philosophy: "Filosofia", roadmap: "Roteiro", faq: "Perguntas", login: "Entrar", joinBeta: "Entrar no Beta" },
    hero: {
      title: "Clareza para o seu crescimento acadêmico.",
      subtitle: "Organize suas matérias, tarefas, anotações, flashcards e vida acadêmica em um único espaço bonito e simples.",
      ctaPrimary: "Entrar no Beta",
      ctaSecondary: "Saber mais",
    },
    preview: {
      today: "Hoje",
      thisWeek: "Esta semana",
      rows: [
        { label: "Álgebra Linear: Lista 4", meta: "Entrega amanhã" },
        { label: "Química Orgânica: Cap. 7", meta: "Em andamento" },
        { label: "Flashcards de Biologia Celular", meta: "32 cartões · 80% dominado" },
      ],
      sessionsPlanned: "sessões planejadas",
      overallProgress: "Progresso geral",
    },
    features: {
      label: "Funcionalidades",
      title: "Tudo que a vida acadêmica precisa, em um só lugar.",
      items: [
        { title: "Matérias", description: "Organize cada disciplina e tópico em um mapa claro e estruturado." },
        { title: "Tarefas", description: "Acompanhe trabalhos e prazos sem perder a visão geral." },
        { title: "Calendário", description: "Veja sua vida acadêmica organizada em uma linha do tempo." },
        { title: "Flashcards", description: "Revise e retenha o que importa com repetição espaçada." },
        { title: "Assistente de IA", description: "Receba ajuda para resumir, explicar e planejar seus estudos." },
        { title: "Anotações", description: "Capture ideias e aulas em um espaço conectado." },
        { title: "Acompanhamento de Progresso", description: "Entenda sua evolução, matéria por matéria." },
      ],
    },
    why: {
      label: "Por que Meiro",
      title: "Pare de usar cinco apps para organizar uma única vida acadêmica.",
      tools: ["Notion", "Calendário", "Apps de tarefas", "Flashcards", "Anotações"],
      unified: "Um único espaço unificado: Meiro",
    },
    philosophy: {
      label: "Filosofia",
      title: "Estudar não devia ser caótico.",
      text:
        "O Meiro nasceu de uma crença simples: clareza vem antes da produtividade. Antes de mais funcionalidades, mais lembretes ou mais pressão, estudantes precisam de um lugar calmo para pensar, planejar e evoluir, construído para crescer com eles, um passo por vez.",
      roadmapLabel: "Roteiro",
      milestones: [
        { label: "Beta Privado", status: "Agora" },
        { label: "Lançamento Público", status: "Próximo" },
        { label: "App Mobile", status: "Planejado" },
        { label: "Assistente de IA v2", status: "Planejado" },
      ],
    },
    beta: {
      title: "Entre para o Beta",
      description:
        "O Meiro está disponível atualmente para um número limitado de usuários. Entre na lista de espera e receba um convite quando novas vagas abrirem.",
      placeholder: "seuemail@universidade.com",
      button: "Entrar na lista de espera",
      success: "Você está na lista, vamos te avisar em breve.",
      error: "Algo deu errado. Tente novamente.",
    },
    faq: {
      label: "Perguntas",
      title: "Perguntas frequentes.",
      items: [
        {
          q: "O Meiro é gratuito?",
          a: "O Meiro terá um plano gratuito com funcionalidades essenciais. Participantes do beta têm acesso antecipado e completo enquanto definimos os preços finais.",
        },
        {
          q: "Quando o beta vai abrir?",
          a: "Estamos liberando o acesso em pequenos lotes para manter a experiência fluida. Entre na lista de espera e avisaremos quando novas vagas abrirem.",
        },
        {
          q: "Posso usar no celular?",
          a: "Sim. O Meiro já funciona como um app web responsivo, com um app mobile dedicado planejado no roteiro.",
        },
        {
          q: "Para quem é o Meiro?",
          a: "Para estudantes que querem um lugar calmo e organizado para matérias, tarefas, anotações, flashcards e progresso, em vez de usar vários apps desconectados.",
        },
      ],
    },
    footer: { privacy: "Privacidade", terms: "Termos", contact: "Contato", rights: "Todos os direitos reservados." },
  },
  es: {
    nav: { features: "Funciones", philosophy: "Filosofía", roadmap: "Hoja de ruta", faq: "Preguntas", login: "Iniciar sesión", joinBeta: "Unirme al Beta" },
    hero: {
      title: "Claridad para tu crecimiento académico.",
      subtitle: "Organiza tus materias, tareas, notas, flashcards y vida académica en un solo espacio elegante.",
      ctaPrimary: "Unirme al Beta",
      ctaSecondary: "Saber más",
    },
    preview: {
      today: "Hoy",
      thisWeek: "Esta semana",
      rows: [
        { label: "Álgebra Lineal: Práctica 4", meta: "Vence mañana" },
        { label: "Química Orgánica: Cap. 7", meta: "En progreso" },
        { label: "Flashcards de Biología Celular", meta: "32 tarjetas · 80% dominado" },
      ],
      sessionsPlanned: "sesiones planeadas",
      overallProgress: "Progreso general",
    },
    features: {
      label: "Funciones",
      title: "Todo lo que la vida académica necesita, en un solo lugar.",
      items: [
        { title: "Materias", description: "Organiza cada curso y tema en un mapa claro y estructurado." },
        { title: "Tareas", description: "Sigue tus trabajos y plazos sin perder la visión general." },
        { title: "Calendario", description: "Visualiza tu vida académica en una sola línea de tiempo." },
        { title: "Flashcards", description: "Repasa y retén lo importante con repetición espaciada." },
        { title: "Asistente IA", description: "Recibe ayuda para resumir, explicar y planear tus estudios." },
        { title: "Notas", description: "Captura ideas y clases en un espacio conectado." },
        { title: "Seguimiento de Progreso", description: "Entiende tu evolución, materia por materia." },
      ],
    },
    why: {
      label: "Por qué Meiro",
      title: "Deja de usar cinco apps para gestionar una sola vida académica.",
      tools: ["Notion", "Calendario", "Apps de tareas", "Flashcards", "Notas"],
      unified: "Un espacio unificado: Meiro",
    },
    philosophy: {
      label: "Filosofía",
      title: "Estudiar no debería sentirse caótico.",
      text:
        "Meiro nació de una creencia simple: la claridad viene antes que la productividad. Antes de más funciones, más recordatorios o más presión, los estudiantes necesitan un lugar tranquilo para pensar, planear y crecer, construido para evolucionar con ellos, paso a paso.",
      roadmapLabel: "Hoja de ruta",
      milestones: [
        { label: "Beta Privado", status: "Ahora" },
        { label: "Lanzamiento Público", status: "Próximo" },
        { label: "App Móvil", status: "Planeado" },
        { label: "Asistente IA v2", status: "Planeado" },
      ],
    },
    beta: {
      title: "Beta Cerrado",
      description:
        "Meiro está actualmente disponible para un número limitado de usuarios. Únete a la lista de espera y recibe una invitación cuando se abran nuevos cupos.",
      placeholder: "tu@universidad.com",
      button: "Unirme a la lista de espera",
      success: "Ya estás en la lista, te contactaremos pronto.",
      error: "Algo salió mal. Intenta de nuevo.",
    },
    faq: {
      label: "Preguntas",
      title: "Preguntas frecuentes.",
      items: [
        {
          q: "¿Meiro es gratis?",
          a: "Meiro ofrecerá un plan gratuito con funciones esenciales. Los participantes del beta tienen acceso anticipado y completo mientras definimos los precios finales.",
        },
        {
          q: "¿Cuándo abre el beta?",
          a: "Estamos invitando usuarios en pequeños grupos para mantener la experiencia fluida. Únete a la lista de espera y te avisaremos cuando se abran nuevos cupos.",
        },
        {
          q: "¿Puedo usarlo en el móvil?",
          a: "Sí. Meiro ya funciona como una app web responsiva, con una app móvil dedicada planeada en la hoja de ruta.",
        },
        {
          q: "¿Para quién es Meiro?",
          a: "Para estudiantes que quieren un lugar tranquilo y organizado para materias, tareas, notas, flashcards y progreso, en vez de usar varias apps desconectadas.",
        },
      ],
    },
    footer: { privacy: "Privacidad", terms: "Términos", contact: "Contacto", rights: "Todos los derechos reservados." },
  },
};

interface LandingI18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dictionary;
}

const LandingI18nContext = createContext<LandingI18nState | null>(null);

function detectInitialLang(): Lang {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "pt" || stored === "en" || stored === "es") return stored;
  const nav = window.navigator.language.toLowerCase();
  if (nav.startsWith("pt")) return "pt";
  if (nav.startsWith("es")) return "es";
  return "en";
}

export function LandingI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<LandingI18nState>(() => ({ lang, setLang, t: dictionaries[lang] }), [lang]);

  return <LandingI18nContext.Provider value={value}>{children}</LandingI18nContext.Provider>;
}

export function useLandingI18n() {
  const ctx = useContext(LandingI18nContext);
  if (!ctx) throw new Error("useLandingI18n must be used within LandingI18nProvider");
  return ctx;
}
