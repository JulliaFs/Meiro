import { useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { pt } from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { arquivoService } from "../../services/arquivoService";
import { ehBlocos, PREFIXO_ARQUIVO } from "../../lib/anotacaoConteudo";
import { useUiStore } from "../../store/useUiStore";

/**
 * Editor de blocos estilo Notion (menu "/", toggles, checklist, código, imagens).
 * Imagens vão para o bucket privado "arquivos" (pasta do usuário); na nota fica só o
 * caminho, e a URL assinada é gerada ao abrir.
 */
export default function EditorBlocos({ conteudo, onChange }: { conteudo: string; onChange: (json: string) => void }) {
  const theme = useUiStore((s) => s.theme);
  const iniciouComBlocos = ehBlocos(conteudo);
  // conversão inicial de markdown não conta como edição: só salva quando o
  // documento ficar diferente do que foi aberto
  const base = useRef<string | null>(null);
  const convertendo = useRef(false);

  const editor = useCreateBlockNote({
    dictionary: pt,
    initialContent: iniciouComBlocos ? JSON.parse(conteudo) : undefined,
    uploadFile: async (file) => {
      const ref = await arquivoService.upload(file);
      return PREFIXO_ARQUIVO + ref.path;
    },
    resolveFileUrl: async (url) =>
      url.startsWith(PREFIXO_ARQUIVO) ? arquivoService.getSignedUrl(url.slice(PREFIXO_ARQUIVO.length)) : url,
  });

  useEffect(() => {
    if (iniciouComBlocos || !conteudo.trim()) return;
    const blocos = editor.tryParseMarkdownToBlocks(conteudo);
    convertendo.current = true;
    editor.replaceBlocks(editor.document, blocos);
    base.current = JSON.stringify(editor.document);
    convertendo.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <BlockNoteView
      editor={editor}
      theme={theme === "dark" ? "dark" : "light"}
      className="editor-meiro flex-1 overflow-y-auto"
      onChange={() => {
        if (convertendo.current) return;
        const json = JSON.stringify(editor.document);
        if (json === base.current) return;
        base.current = null;
        onChange(json);
      }}
    />
  );
}
