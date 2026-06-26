import { supabase } from "../lib/supabaseClient";
import { uid } from "./supabaseCrud";

const BUCKET = "arquivos";

export interface ArquivoRef {
  id: string;
  nome: string;
  path: string;
  mime: string;
  tamanho: number;
}

export const arquivoService = {
  async upload(file: File): Promise<ArquivoRef> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw userError ?? new Error("Usuário não autenticado");

    const id = uid();
    const path = `${userData.user.id}/${id}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) throw error;

    return { id, nome: file.name, path, mime: file.type, tamanho: file.size };
  },

  async getSignedUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
    if (error) throw error;
    return data.signedUrl;
  },

  async remove(path: string): Promise<void> {
    await supabase.storage.from(BUCKET).remove([path]);
  },

  async download(path: string, nome: string): Promise<void> {
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error) throw error;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  },
};
