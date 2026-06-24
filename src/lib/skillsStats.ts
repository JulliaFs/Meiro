import type { Aula, Capitulo, Certificado, Curso, Fase, Modulo, Habilidade } from "../types";

export interface SkillStat {
  nome: string;
  conteudosEstudados: number;
  horasEstudadas: number;
  cursosRelacionados: string[];
  fasesRelacionadas: string[];
  certificadosRelacionados: string[];
  nivelAtual: number;
  meta: number;
}

interface ComputeParams {
  capitulos: Capitulo[];
  aulas: Aula[];
  modulos: Modulo[];
  cursos: Curso[];
  fases: Fase[];
  certificados: Certificado[];
  habilidades: Habilidade[];
}

export function computeSkillStats(params: ComputeParams): SkillStat[] {
  const { capitulos, aulas, modulos, cursos, fases, certificados, habilidades } = params;
  const map = new Map<string, SkillStat>();

  function ensure(nome: string): SkillStat {
    let s = map.get(nome);
    if (!s) {
      const hab = habilidades.find((h) => h.nome.toLowerCase() === nome.toLowerCase());
      s = {
        nome,
        conteudosEstudados: 0,
        horasEstudadas: 0,
        cursosRelacionados: [],
        fasesRelacionadas: [],
        certificadosRelacionados: [],
        nivelAtual: hab?.nivelAtual ?? 0,
        meta: hab?.meta ?? 100,
      };
      map.set(nome, s);
    }
    return s;
  }

  for (const cap of capitulos) {
    if (cap.status !== "concluido") continue;
    const fase = fases.find((f) => f.id === cap.faseId);
    for (const skill of cap.skills) {
      const s = ensure(skill);
      s.conteudosEstudados += 1;
      if (fase) {
        const label = `Fase ${fase.numero} · ${fase.nome}`;
        if (!s.fasesRelacionadas.includes(label)) s.fasesRelacionadas.push(label);
      }
    }
  }

  for (const aula of aulas) {
    if (aula.status !== "concluido") continue;
    const modulo = modulos.find((m) => m.id === aula.moduloId);
    const curso = modulo ? cursos.find((c) => c.id === modulo.cursoId) : undefined;
    for (const skill of aula.skills) {
      const s = ensure(skill);
      s.conteudosEstudados += 1;
      s.horasEstudadas += (aula.duracaoMinutos ?? 0) / 60;
      if (curso && !s.cursosRelacionados.includes(curso.nome)) s.cursosRelacionados.push(curso.nome);
    }
  }

  for (const cert of certificados) {
    if (!cert.area) continue;
    const s = ensure(cert.area);
    s.horasEstudadas += cert.cargaHoraria;
    if (!s.certificadosRelacionados.includes(cert.nome)) s.certificadosRelacionados.push(cert.nome);
  }

  // garante que habilidades cadastradas manualmente também apareçam, mesmo sem conteúdo ainda
  for (const hab of habilidades) {
    ensure(hab.nome);
  }

  return Array.from(map.values()).sort((a, b) => b.conteudosEstudados - a.conteudosEstudados);
}
