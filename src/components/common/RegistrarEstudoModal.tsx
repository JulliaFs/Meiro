import { useState } from "react";
import { Modal } from "../ui/Modal";
import { useAreas } from "../../hooks/useLiveData";
import { useEnvio } from "../../hooks/useEnvio";
import { sessaoService } from "../../services";
import { notificarSucesso } from "../../store/useToastStore";
import { useUiStore } from "../../store/useUiStore";
import { todayIso } from "../../lib/utils";

function RegistrarEstudoForm({ onClose }: { onClose: () => void }) {
  const areas = useAreas();
  const [data, setData] = useState(todayIso());
  const [horas, setHoras] = useState(1);
  const [minutos, setMinutos] = useState(0);
  const [areaId, setAreaId] = useState("");
  const { enviando, executar } = useEnvio();
  const total = horas * 60 + minutos;

  function salvar() {
    if (total <= 0 || !data) return;
    executar(
      async () => {
        await sessaoService.create({ data, minutos: total, areaId: areaId || undefined });
        notificarSucesso("Sessão de estudo registrada.");
      },
      onClose
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-xs text-text-muted block">
        Dia
        <input type="date" className="input mt-1" value={data} max={todayIso()} onChange={(e) => setData(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-text-muted">
          Horas
          <input type="number" min={0} max={24} className="input mt-1" value={horas} onChange={(e) => setHoras(Math.max(0, +e.target.value))} />
        </label>
        <label className="text-xs text-text-muted">
          Minutos
          <input type="number" min={0} max={59} step={5} className="input mt-1" value={minutos} onChange={(e) => setMinutos(Math.max(0, +e.target.value))} />
        </label>
      </div>
      <label className="text-xs text-text-muted block">
        Área (opcional)
        <select className="input mt-1" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
          <option value="">Sem área</option>
          {areas?.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
      </label>
      <button className="btn btn-primary w-full justify-center" onClick={salvar} disabled={enviando || total <= 0 || !data}>
        Registrar
      </button>
    </div>
  );
}

/** Registro de horas estudadas — alimenta o KPI semanal, o gráfico e a sequência de dias. */
export function RegistrarEstudoModal() {
  const open = useUiStore((s) => s.estudoOpen);
  const setOpen = useUiStore((s) => s.setEstudoOpen);

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Registrar estudo">
      <RegistrarEstudoForm onClose={() => setOpen(false)} />
    </Modal>
  );
}
