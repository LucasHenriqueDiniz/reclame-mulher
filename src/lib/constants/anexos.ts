/**
 * O limite de anexo do relato, num lugar só.
 *
 * Antes da task `62` havia dois números para a mesma coisa: a tela aceitava 3
 * arquivos de 5 MB e a rota do UploadThing aceitava 4 MB. Um arquivo de 4,5 MB
 * passava na validação da tela, entrava na lista com cara de aceito, e só era
 * recusado quando o envio chegava ao UploadThing — depois de a usuária ter
 * preenchido o resto do formulário.
 *
 * O teto real é o do UploadThing, então o tamanho vem dele. A quantidade vem da
 * tela, que sempre ofereceu três — e é o que o Manual de Uso promete.
 *
 * Quem mexer aqui muda os dois lados de uma vez. `src/lib/__tests__/anexos.test.ts`
 * falha se algum dos dois voltar a escrever o número na mão.
 */

/** Formato que o UploadThing espera na configuração da rota. */
export const ANEXO_TAMANHO_MAXIMO = "4MB" as const;

export const ANEXO_MAX_MB = Number(ANEXO_TAMANHO_MAXIMO.replace("MB", ""));
export const ANEXO_MAX_BYTES = ANEXO_MAX_MB * 1024 * 1024;
export const ANEXO_MAX_ARQUIVOS = 3;

export const ANEXO_TIPOS = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "application/pdf",
] as const;

/** Para o `accept` do `<input type="file">`. */
export const ANEXO_EXTENSOES = ".png,.jpg,.jpeg,.pdf";

export interface AnexoCandidato {
  size: number;
  type?: string | null;
}

/**
 * Devolve a mensagem de recusa, ou `null` quando o arquivo serve.
 *
 * A mensagem diz **qual é o limite**, não só que falhou: quem está anexando
 * precisa saber o que fazer com o arquivo recusado.
 */
export function validarAnexo(arquivo: AnexoCandidato): string | null {
  if (arquivo.size > ANEXO_MAX_BYTES) {
    return `Arquivo muito grande. O máximo é ${ANEXO_MAX_MB} MB por arquivo.`;
  }

  const tipo = arquivo.type?.toLowerCase();
  if (!tipo || !(ANEXO_TIPOS as readonly string[]).includes(tipo)) {
    return "Formato não permitido. Use PNG, JPG, JPEG ou PDF.";
  }

  return null;
}

/** Mensagem para quando a pessoa escolhe mais arquivos do que cabem. */
export const MENSAGEM_LIMITE_DE_ARQUIVOS = `Você pode anexar até ${ANEXO_MAX_ARQUIVOS} arquivos.`;
