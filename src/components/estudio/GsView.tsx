import { Card, CardHeader } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { CopiarPrompt } from "./CopiarPrompt";
import { cls } from "../../lib/utils";
import { promptGs, type KitGs, type ProgressoEstudio } from "../../lib/estudio";

function Check({ id, marcado, alternar, titulo, texto }: { id: string; marcado: boolean; alternar: () => void; titulo: string; texto?: string }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 rounded-lg border border-border px-3 py-2 cursor-pointer">
      <input id={id} type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-brand)]" checked={marcado} onChange={alternar} />
      <span className="text-sm">
        <span className={cls("font-medium", marcado && "line-through text-text-muted")}>{titulo}</span>
        {texto && <span className="block text-xs text-text-muted">{texto}</span>}
      </span>
    </label>
  );
}

export function GsView({
  kit,
  progresso,
  alternar,
  setIdeia,
}: {
  kit: KitGs;
  progresso: ProgressoEstudio;
  alternar: (chave: string) => void;
  setIdeia: (texto: string) => void;
}) {
  const slidesProntos = kit.slides.filter((_, i) => progresso.gs[`sl-${i}`]).length;
  const ideia = progresso.ideia ?? "";

  return (
    <div className="space-y-6">
      <Card className="space-y-2">
        <p className="label-mono">Global Solution · 2º semestre · 20 pts em cada disciplina</p>
        <h2 className="section-title">CitizenTech</h2>
        <p className="text-sm leading-relaxed max-w-prose">{kit.resumo}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="O que a banca avalia" />
          <div className="space-y-1.5">
            {kit.criterios.map((c) => (
              <Check key={c.id} id={`gs-rb-${c.id}`} marcado={!!progresso.gs[`rb-${c.id}`]} alternar={() => alternar(`rb-${c.id}`)} titulo={c.titulo} texto={c.texto} />
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Antes de clicar em entregar" />
          <div className="space-y-1.5">
            {kit.checklistFinal.map((c) => (
              <Check key={c.id} id={`gs-fn-${c.id}`} marcado={!!progresso.gs[`fn-${c.id}`]} alternar={() => alternar(`fn-${c.id}`)} titulo={c.texto} />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Esqueleto da apresentação" subtitle={`${slidesProntos} de ${kit.slides.length} slides prontos`} />
        <div className="mb-3"><ProgressBar value={(slidesProntos / kit.slides.length) * 100} /></div>
        <ol className="space-y-1.5">
          {kit.slides.map((s, i) => (
            <li key={i}>
              <Check id={`gs-sl-${i}`} marcado={!!progresso.gs[`sl-${i}`]} alternar={() => alternar(`sl-${i}`)} titulo={`${i + 1}. ${s.titulo}`} texto={s.texto} />
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Datasets públicos" subtitle="Os 4 insights precisam cruzar dados do sistema com pelo menos uma fonte real." />
          <div className="divide-y divide-border">
            {kit.datasets.map((d) => (
              <div key={d.nome} className="py-2 text-sm">
                <span className="font-medium">{d.nome}</span>
                <span className="block text-xs text-text-muted">{d.uso}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3">
          <CardHeader title="Como escrever um insight" subtitle="Use a mesma fórmula quatro vezes." />
          <p className="text-sm rounded-lg bg-brand-light px-3 py-2">{kit.insightFormula}</p>
          <p className="text-xs text-text-muted leading-relaxed"><b>Exemplo:</b> {kit.insightExemplo}</p>
          <p className="text-xs text-text-muted">As análises podem ser descritivas. Não precisa rodar modelo de machine learning.</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Diagrama de classes sem travar" />
          <ol className="list-decimal pl-5 space-y-1.5 text-sm">
            {kit.uml.map((u, i) => <li key={i}>{u}</li>)}
          </ol>
        </Card>
        <Card>
          <CardHeader title="Roteiro do pitch (3:00)" />
          <div className="border-l-2 border-border ml-1.5 space-y-3">
            {kit.pitch.map((p) => (
              <div key={p.tempo} className="relative pl-4">
                <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-brand bg-surface" />
                <p className="font-mono text-xs text-brand">{p.tempo}</p>
                <p className="text-sm">{p.texto}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-3">{kit.pitchDica}</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <CardHeader
          title="Feedback da sua ideia"
          subtitle="Escreva do seu jeito. O botão monta um prompt para colar no Claude, que devolve perguntas e pontos fracos sem escrever a GS por você. Ela precisa ser autoral."
        />
        <label htmlFor="gs-ideia" className="label-mono block">Sua ideia ou o texto dos slides</label>
        <textarea
          id="gs-ideia"
          className="input min-h-32"
          value={ideia}
          onChange={(e) => setIdeia(e.target.value)}
          placeholder="Ex.: moradores de um bairro de Diadema não sabem quando a rua vai alagar. Um app que junta avisos dos moradores com a previsão do INMET e manda alerta por WhatsApp…"
        />
        <div className="flex flex-wrap gap-3">
          <CopiarPrompt rotulo="Copiar prompt de feedback" gerar={() => promptGs(ideia, "avaliar")} desativado={!ideia.trim()} />
          <CopiarPrompt rotulo="Copiar prompt de revisão de texto" gerar={() => promptGs(ideia, "revisar")} desativado={!ideia.trim()} />
        </div>
      </Card>
    </div>
  );
}
