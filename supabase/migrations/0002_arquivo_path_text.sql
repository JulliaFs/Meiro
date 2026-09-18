-- O app guarda nessas colunas o CAMINHO do arquivo no Storage
-- ("<user_id>/<uuid>-nome.pdf"), não um uuid. Com o tipo uuid todo insert com
-- arquivo falhava: "Salvar material" na Biblioteca, upload em aulas/capítulos e
-- certificado com PDF anexado.
-- Rode uma vez no SQL Editor do projeto. Idempotente e sem perda de dados
-- (uuid -> text é uma conversão direta).

alter table materiais alter column arquivo_id type text using arquivo_id::text;
alter table certificados alter column arquivo_id type text using arquivo_id::text;
