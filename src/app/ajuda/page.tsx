import { notFound } from "next/navigation";

import { AjudaContent } from "./_components/ajuda-content";

/**
 * `/ajuda` é ferramenta de desenvolvimento, e só existe em desenvolvimento.
 *
 * Este componente de servidor é a trava. Ele precisa ficar **fora** do
 * componente de cliente: uma checagem feita no navegador esconderia a tela sem
 * impedir que o conteúdo fosse servido, que é o pior dos dois mundos.
 *
 * A trava é a segunda linha de defesa. A primeira é o próprio
 * `_components/ajuda-content.tsx` não conter credencial nenhuma — porque tudo
 * que estiver escrito lá vai para o pacote do navegador, tenha esta rota
 * respondido ou não.
 *
 * Ver `.claude/fixes/tasks/63-pagina-ajuda-expoe-credenciais.md`.
 */
export default function AjudaPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <AjudaContent />;
}
