export type CategoriaCor = "faculdade" | "cursos" | "skills" | "certificados" | "revisoes" | "metas";

export const CATEGORIA_COLORS: Record<CategoriaCor, { fg: string; bg: string }> = {
  faculdade: { fg: "var(--color-cat-faculdade)", bg: "var(--color-cat-faculdade-bg)" },
  cursos: { fg: "var(--color-cat-cursos)", bg: "var(--color-cat-cursos-bg)" },
  skills: { fg: "var(--color-cat-skills)", bg: "var(--color-cat-skills-bg)" },
  certificados: { fg: "var(--color-cat-certificados)", bg: "var(--color-cat-certificados-bg)" },
  revisoes: { fg: "var(--color-cat-revisoes)", bg: "var(--color-cat-revisoes-bg)" },
  metas: { fg: "var(--color-cat-metas)", bg: "var(--color-cat-metas-bg)" },
};

export function categoriaStyle(cat: CategoriaCor) {
  const c = CATEGORIA_COLORS[cat];
  return { color: c.fg, backgroundColor: c.bg };
}
