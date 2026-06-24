import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "../ui/Badge";

const SUGESTOES = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "API",
  "Python", "Git", "GitHub", "Banco de Dados", "Modelagem", "UML", "Scrum", "Kanban",
  "UX", "UI", "IA", "Inglês",
];

export function SkillTagInput({ value, onChange }: { value: string[]; onChange: (skills: string[]) => void }) {
  const [input, setInput] = useState("");

  function add(skill: string) {
    const s = skill.trim();
    if (!s || value.includes(s)) return;
    onChange([...value, s]);
    setInput("");
  }

  function remove(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  const sugestoesFiltradas = SUGESTOES.filter((s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase()));

  return (
    <div>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Adicionar skill (ex: React, Git...)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add(input))}
        />
        <button type="button" className="btn btn-secondary" onClick={() => add(input)}>
          <Plus size={14} />
        </button>
      </div>
      {input && sugestoesFiltradas.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2">
          {sugestoesFiltradas.slice(0, 6).map((s) => (
            <button key={s} type="button" className="badge bg-surface-2 text-text-muted hover:bg-brand-light hover:text-brand" onClick={() => add(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      {value.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2">
          {value.map((s) => (
            <Badge key={s} className="bg-brand-light text-brand">
              {s}
              <button type="button" onClick={() => remove(s)}><X size={11} /></button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
