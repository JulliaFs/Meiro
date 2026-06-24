import { db } from "../db/database";

/**
 * O sistema inicia vazio. A única coisa que garantimos aqui é que exista
 * um registro de configurações técnicas padrão — nenhum dado de exemplo
 * (cursos, fases, capítulos, certificados, anotações) é criado.
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  const config = await db.configuracoes.get("default");
  if (!config) {
    await db.configuracoes.put({ id: "default", tema: "system", nome: "Estudante" });
  }
}
