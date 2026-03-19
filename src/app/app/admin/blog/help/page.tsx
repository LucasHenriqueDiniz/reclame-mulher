import Link from "next/link";
import { ArrowLeft, Code2, FileText, Heading, Image as ImageIcon, Link2, List, Quote, Sparkles, Table2 } from "lucide-react";

type SyntaxItem = {
  label: string;
  syntax: string;
  example: string;
  note: string;
};

const syntaxSections: Array<{
  title: string;
  icon: typeof Heading;
  items: SyntaxItem[];
}> = [
  {
    title: "Titulos e estrutura",
    icon: Heading,
    items: [
      {
        label: "Titulo principal",
        syntax: "# Titulo do artigo",
        example: "Exemplo: # Como registrar uma reclamacao de forma clara",
        note: "Use uma vez no topo do artigo para o assunto principal.",
      },
      {
        label: "Subtitulo",
        syntax: "## Contexto",
        example: "Exemplo: ## O que mudou depois da obra",
        note: "Serve para dividir o texto em blocos grandes.",
      },
      {
        label: "Terceiro nivel",
        syntax: "### Detalhe importante",
        example: "Exemplo: ### Impactos na mobilidade do bairro",
        note: "Bom para tópicos menores dentro de uma seção.",
      },
      {
        label: "Linha divisoria",
        syntax: "---",
        example: "Exemplo: use entre uma seção e outra quando quiser uma pausa visual.",
        note: "Cria uma separação horizontal no conteúdo.",
      },
    ],
  },
  {
    title: "Texto e destaque",
    icon: Sparkles,
    items: [
      {
        label: "Negrito",
        syntax: "**trecho importante**",
        example: "Exemplo: Este prazo e **obrigatorio por lei**.",
        note: "Use para destacar termos realmente relevantes.",
      },
      {
        label: "Italico",
        syntax: "*ênfase leve*",
        example: "Exemplo: A medida foi *parcialmente cumprida*.",
        note: "Funciona melhor para ênfase sutil.",
      },
      {
        label: "Codigo inline",
        syntax: "`/api/blog/posts`",
        example: "Exemplo: Consulte a rota `/api/blog/posts` para listar os artigos.",
        note: "Ideal para rotas, termos técnicos e nomes de campos.",
      },
      {
        label: "Paragrafos",
        syntax: "Linha em branco entre blocos",
        example: "Exemplo: escreva um parágrafo, deixe uma linha vazia, e só então comece o próximo.",
        note: "Sem linha em branco, o Markdown tende a juntar tudo no mesmo bloco.",
      },
    ],
  },
  {
    title: "Listas e citacoes",
    icon: List,
    items: [
      {
        label: "Lista com marcadores",
        syntax: "- item",
        example: "Exemplo:\n- Falta de agua\n- Poeira excessiva\n- Barulho constante",
        note: "Use uma linha por item.",
      },
      {
        label: "Lista numerada",
        syntax: "1. item",
        example: "Exemplo:\n1. Identifique o problema\n2. Registre evidencias\n3. Envie a reclamacao",
        note: "Boa para passo a passo.",
      },
      {
        label: "Citacao",
        syntax: "> trecho destacado",
        example: "Exemplo: > A comunidade nao foi informada com antecedencia.",
        note: "Ótimo para falas, trechos legais ou observações importantes.",
      },
    ],
  },
  {
    title: "Links, imagens e midia",
    icon: Link2,
    items: [
      {
        label: "Link",
        syntax: "[texto](https://exemplo.com)",
        example: "Exemplo: [Saiba mais](https://www.gov.br/)",
        note: "Sempre use URL completa.",
      },
      {
        label: "Imagem externa",
        syntax: "![descricao](https://site.com/imagem.jpg)",
        example: "Exemplo: ![Mapa da area afetada](https://exemplo.com/mapa.jpg)",
        note: "Descreva a imagem no texto alternativo.",
      },
      {
        label: "Imagem enviada no CMS",
        syntax: "![descricao](https://utfs.io/...)",
        example: "Exemplo: use o botão de upload do editor e ele insere esse formato automaticamente.",
        note: "É o jeito mais seguro para imagens do próprio blog.",
      },
      {
        label: "Embeds",
        syntax: "Nao ha suporte nativo",
        example: "Exemplos de embed: vídeo do YouTube, post do Instagram, mapa incorporado, iframe de documento.",
        note: "Hoje o blog nao incorpora esses blocos automaticamente; se precisar, use um link comum.",
      },
    ],
  },
  {
    title: "Tabelas",
    icon: Table2,
    items: [
      {
        label: "Tabela Markdown",
        syntax: "| Coluna | Coluna |\n| --- | --- |\n| Valor | Valor |",
        example:
          "Exemplo:\n| Impacto | Nivel |\n| --- | --- |\n| Poeira | Alto |\n| Ruido | Medio |\n| Acesso a agua | Critico |",
        note: "Agora o blog suporta tabelas no preview e no post publicado.",
      },
    ],
  },
];

const rules = [
  "O blog usa `react-markdown` com `remark-gfm`, então aceita a sintaxe Markdown básica e também tabelas.",
  "HTML cru e scripts não são tratados como recurso editorial do CMS. O fluxo é pensado para Markdown seguro e previsível.",
  "Embeds significam blocos incorporados de outros serviços, como YouTube, Instagram, mapas, tweets ou iframes. Isso ainda não tem suporte nativo.",
  "Se precisar referenciar um vídeo ou conteúdo externo, prefira um link claro com contexto.",
  "Blocos de código com crases triplas funcionam como Markdown padrão, mas ainda não têm syntax highlight especial.",
];

const writingTips = [
  "Use `##` para estruturar artigos longos; isso melhora leitura e escaneabilidade.",
  "Se for usar tabela, mantenha poucas colunas para leitura boa no celular.",
  "Para comparações simples, tabela funciona bem; para textos longos, prefira lista.",
  "Sempre revise no Preview antes de publicar, principalmente tabelas, imagens e links.",
  "Evite misturar muitos formatos na mesma seção. Clareza editorial vale mais do que enfeite.",
];

export default function AdminBlogHelpPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(30,136,229,0.16),_transparent_32%),linear-gradient(135deg,#0f172a_0%,#13233f_48%,#183b6b_100%)] p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <Link
            href="/app/admin/blog"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao CMS
          </Link>
          <div className="mb-5 inline-flex rounded-2xl bg-white/10 p-3 backdrop-blur">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Ajuda de Markdown do Blog</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            Esta página documenta o Markdown aceito pelo CMS do blog, com exemplos prontos de uso e as regras
            atuais do renderizador. O objetivo é evitar surpresa entre o que você escreve no editor e o que aparece
            publicado.
          </p>
        </div>
        <div className="absolute -right-12 -top-10 h-48 w-48 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-blue-200/10 blur-2xl" />
      </section>

      <section className="grid gap-6">
        {syntaxSections.map(({ title, icon: Icon, items }) => (
          <div key={title} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-5">
              <div className="rounded-xl bg-slate-900 p-2 text-white">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {items.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-900">{item.label}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Sintaxe</p>
                      <pre className="overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
                        <code>{item.syntax}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Exemplo</p>
                      <pre className="overflow-x-auto rounded-xl bg-white px-4 py-3 text-sm text-slate-800 ring-1 ring-slate-200">
                        <code>{item.example}</code>
                      </pre>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white">
              <Code2 className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Exemplo completo</h2>
          </div>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">
            <code>{`# Titulo do artigo

Breve introducao com **destaques** e um [link util](https://exemplo.com).

## Contexto

Explique o problema em 1 ou 2 paragrafos.

> Esta citacao chama a atencao para um ponto importante.

## Comparacao de impactos

| Impacto | Nivel | Observacao |
| --- | --- | --- |
| Poeira | Alto | Afeta casas proximas |
| Ruido | Medio | Mais forte pela manha |
| Agua | Critico | Houve interrupcoes |

## Pontos principais

- Primeiro item
- Segundo item
- Terceiro item

## Imagem

![Descricao da imagem](https://utfs.io/f/exemplo)

## Referencia tecnica

Use \`/api/blog/posts\` quando precisar citar rotas ou termos tecnicos.

---

Paragrafo final com orientacao pratica.`}</code>
          </pre>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-2 text-white">
                <Quote className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Regras importantes</h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-slate-600">
              {rules.map((rule) => (
                <li key={rule} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-2 text-white">
                <ImageIcon className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Boas praticas</h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-slate-600">
              {writingTips.map((tip) => (
                <li key={tip} className="rounded-2xl border border-slate-200 px-4 py-3">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
