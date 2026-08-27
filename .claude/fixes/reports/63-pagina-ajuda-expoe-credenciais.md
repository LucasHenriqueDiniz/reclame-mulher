# Relatório — [63] `/ajuda` entregava a senha do administrador

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1

## Por que esta task saiu na frente

A fila estava em `54`. Peguei a `63` fora de ordem, de propósito: é a única task
aberta de risco **alto** que expõe credencial, e as cinco à frente dela são
divergência de rótulo, ruído de console e afins. Corrigir a etiqueta de status
enquanto a senha do administrador está publicada não seria seguir o protocolo —
seria segui-lo ao pé da letra contra o interesse de quem o escreveu.

## O que havia

`src/app/ajuda/page.tsx` listava as quatro contas do seed e imprimia a senha
padrão com botão de copiar:

```tsx
Todos os usuários de teste usam a mesma senha: <strong>senha123</strong>
...
<code>senha123</code>
<CopyButton text="senha123" />
```

Entre as contas, `admin@comunicamulher.com.br`, marcada `ADMIN`.

Três fatos que faziam disto um problema, e não uma inconveniência:

1. **Pública.** `/ajuda` estava na lista de exceções do `src/middleware.ts`.
2. **Sem trava de ambiente.** Nenhum `NODE_ENV`, nenhum `notFound()`. Ia para
   produção como estava — confirmado com `curl` no build de produção, duas
   ocorrências de `senha123` no HTML servido.
3. **Não linkada.** Nada em `src/` apontava para ela. Ninguém ia esbarrar nela
   navegando, e por isso ela ia continuar lá.

## A correção, em duas camadas

A task oferecia três caminhos e recomendava apagar a página. Não apaguei —
apagar é decisão de produto, e a parte útil dela (os links rápidos) não tem nada
de errado. Fiz as duas coisas que fecham o buraco sem destruir a ferramenta.

### Camada 1 — a senha saiu do código

Esta é a que importa. `/ajuda` era `"use client"`, e **componente de cliente vai
inteiro para o pacote do navegador** — renderizado ou não, gateado ou não. Uma
trava de ambiente sozinha esconderia a tela e continuaria servindo o texto.

O conteúdo virou `src/app/ajuda/_components/ajuda-content.tsx`, sem senha e sem
e-mail. Os e-mails saíram junto: com a senha eles são o par completo, e sozinhos
ainda dizem quem existe e como se chama a conta de administração.

No lugar da lista de logins, a página descreve **os papéis** que o seed cria e
manda procurar as credenciais no `README.md` — que não é servido pela aplicação.

### Camada 2 — a rota não existe em produção

`src/app/ajuda/page.tsx` virou componente de servidor:

```tsx
export default function AjudaPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <AjudaContent />;
}
```

No servidor, e não no cliente, pelo mesmo motivo de antes.

## Medido

Build de produção limpo, servidor de produção de pé:

| Verificação | Antes | Agora |
|---|---|---|
| `curl /ajuda` | 200, com a senha | **404** |
| `senha123` no HTML servido | 2 ocorrências | **0** |
| `senha123` em `.next/static` (pacotes do cliente) | presente | **nenhum arquivo** |
| `senha123` em `.next/server` | presente | **nenhum arquivo** |
| `curl /` (nada mais quebrou) | 200 | 200 |

Em desenvolvimento a página continua de pé e continua útil — sem credencial.

## O teste que trava isso

`e2e/segredos.spec.ts`, 11 testes × 2 viewports:

- **10 rotas públicas** conferidas uma a uma: nenhuma devolve a senha do seed no
  HTML. A senha vem de `SENHA`, o mesmo valor que os outros testes usam, então
  trocar a senha do seed não deixa o teste passar por engano.
- A página de apoio não mostra nenhum dos quatro e-mails de conta.

O que ele **não** cobre está escrito no cabeçalho do arquivo: a suíte roda
contra o servidor de desenvolvimento, então a trava de produção não é
verificável ali. O que é verificável, e importa mais, é que a senha não está no
HTML em ambiente nenhum. Com isso a trava vira segunda linha de defesa em vez de
única.

Resultado: **22 de 22 passando**.

## Uma armadilha no caminho

A primeira execução da spec nova falhou nos dois testes de `/ajuda`, com a senha
ainda aparecendo. O código estava certo: o `webServer` do Playwright tem
`reuseExistingServer`, e havia um servidor de **produção** de pé na porta 5000,
sobrando do ensaio da task `23` — servindo o build antigo.

É a mesma família da armadilha do `.next` que o `LOOP.md` documenta: processo
antigo segurando estado antigo. Parei o servidor, apaguei `.next`, e os 22
passaram.

## Critérios de aceite

- [x] Nenhuma senha em resposta HTTP de rota pública —
      `curl -s .../ajuda | grep -c senha123` devolve **0** no build de produção,
      e o mesmo vale para as outras nove rotas públicas conferidas.
- [x] A página continua existindo e não lista credencial.
- [x] Teste que trava o comportamento: `e2e/segredos.spec.ts`, 22 passando.

## O que continua sendo decisão sua

A task listava três caminhos. Escolhi o do meio — **limpar e travar** — porque é
o único reversível nos dois sentidos: se você quiser apagar a página depois, é
um `git rm`; se quiser transformá-la em ajuda de verdade para a usuária, a
estrutura já está separada entre rota e conteúdo.

A terceira opção continua valendo a pena um dia: o Manual de Uso registra que a
plataforma **não tem canal de ajuda**, e `/ajuda` é o endereço óbvio para um.
Hoje ela é ferramenta de quem desenvolve, e diz isso no subtítulo.
