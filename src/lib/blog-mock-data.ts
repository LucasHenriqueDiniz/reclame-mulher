export interface BlogPost {
  id: number;
  slug?: string;
  title: string;
  image: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  content?: string;
}

export const BLOG_MOCK_DATA: BlogPost[] = [
  {
    id: 1,
    title: "Participação Social Feminina: Como Mulheres Transformaram Projetos de Infraestrutura",
    image: "/hero.webp",
    tags: ["ParticipacãoSocial", "CasosDeSuccesso"],
    author: { name: "Maria Silva", avatar: "/blog-avatar.webp" },
    date: "20 de Agosto, 2025",
    content: `# A Participação Feminina na Transformação de Projetos de Infraestrutura

Quando grandes projetos de infraestrutura chegam às comunidades, frequentemente são as mulheres que primeiro percebem e articulam os impactos na vida cotidiana. O envolvimento feminino no planejamento, execução e monitoramento desses projetos tem demonstrado não apenas melhorar a qualidade de vida das comunidades afetadas, mas também aumentar significativamente a eficiência e sustentabilidade das obras em si.

> **"Não há infraestrutura verdadeiramente sustentável sem a participação ativa das mulheres em todas as etapas do processo. São elas que geralmente conhecem as necessidades mais urgentes da comunidade."**  
> — *Dra. Maria Conceição Silva, especialista em desenvolvimento urbano*

---

## Transformando Projetos Através da Participação Feminina

### 1. O Caso da Hidrovia Tietê-Paraná

Quando a ampliação da Hidrovia Tietê-Paraná foi proposta em 2022, o projeto inicial ignorava completamente os impactos nas comunidades ribeirinhas. Um coletivo de mulheres pescadoras:

- Documentou meticulosamente os ciclos de pesca locais
- Mapeou áreas essenciais para a reprodução dos peixes
- Apresentou um contraplanejamento técnico  

**Resultado:**  
Redesenho do projeto com novo traçado que preservou locais críticos para reprodução de peixes e incluiu passagens específicas para embarcações de pesca artesanal.

![Mulheres em ação](https://s2-techtudo.glbimg.com/6SUNeIdFRZD5okREI8UsR-Tn5DU=/1200x/smart/filters:cover():strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2024/x/n/qaxzP0QOO8yHM55B7dfQ/doodle-google-mulheres.png)

---

### 2. Ferrovia Norte-Sul: Integrando Segurança de Gênero

O trecho central da Ferrovia Norte-Sul inicialmente não considerava questões de segurança para mulheres. Lideranças femininas conduziram:

- Auditorias de segurança com perspectiva de gênero
- Mapeamento de pontos críticos em terminais
- Consultas comunitárias com usuárias de transporte  

**Melhorias implementadas:**  
✅ Melhor iluminação nos entornos das estações  
✅ Sistemas de monitoramento com botões de pânico  
✅ Rotas seguras integradas ao transporte local  
✅ Equipes mistas de segurança  

---

## Lições Aprendidas

### ✅ Estratégias Eficazes
- Apresentar propostas tecnicamente fundamentadas  
- Formar alianças com especialistas técnicos  
- Documentar sistematicamente diálogos e compromissos  
- Comunicar acordos para toda a comunidade  

### ❌ Armadilhas a Evitar
- Fragmentação entre grupos de mulheres  
- Aceitar reuniões sem pautas claras  
- Permitir seleção de participantes por empresas  
- Focar apenas em compensações financeiras  

---

## Conclusão  

A participação efetiva de mulheres em projetos de infraestrutura é **fator determinante para sustentabilidade e qualidade**. Os casos demonstram que a perspectiva feminina traz soluções frequentemente ignoradas em abordagens tecnocráticas.

> **"O diálogo inicial é apenas o começo. O verdadeiro impacto vem do monitoramento constante e da persistência em fazer cumprir compromissos."**`
  },
  {
    id: 2,
    title: "Direitos das Mulheres em Áreas de Reassentamento",
    image: "/blog-image.webp",
    tags: ["DireitosLegais", "Reassentamento"],
    author: { name: "Ana Santos", avatar: "/blog-avatar.webp" },
    date: "15 de Agosto, 2025",
    content: `# Direitos das Mulheres em Áreas de Reassentamento

O reassentamento forçado devido a grandes obras de infraestrutura afeta desproporcionalmente as mulheres...`
  },
  {
    id: 3,
    title: "Como Documentar Impactos Ambientais",
    image: "/blog-image-2.webp",
    tags: ["MeioAmbiente", "Documentação"],
    author: { name: "Carla Oliveira", avatar: "/blog-avatar.webp" },
    date: "10 de Agosto, 2025",
    content: `# Como Documentar Impactos Ambientais

A documentação adequada de impactos ambientais é fundamental...`
  },
  {
    id: 4,
    title: "Violência de Gênero Durante Grandes Obras",
    image: "/blog-image-3.webp",
    tags: ["Segurança", "ViolênciaDeGênero"],
    author: { name: "Juliana Costa", avatar: "/blog-avatar.webp" },
    date: "5 de Agosto, 2025",
    content: `# Violência de Gênero Durante Grandes Obras

Durante a construção de grandes projetos de infraestrutura...`
  },
  {
    id: 5,
    title: "Oportunidades Econômicas para Mulheres",
    image: "/blog-image.webp",
    tags: ["Empreendedorismo", "OportunidadesEconômicas"],
    author: { name: "Patricia Lima", avatar: "/blog-avatar.webp" },
    date: "1 de Agosto, 2025",
    content: `# Oportunidades Econômicas para Mulheres

Grandes obras podem criar oportunidades econômicas...`
  },
  {
    id: 6,
    title: "Saúde Mental Feminina em Contextos de Deslocamento",
    image: "/blog-image-2.webp",
    tags: ["SaúdeMental", "Deslocamento"],
    author: { name: "Fernanda Souza", avatar: "/blog-avatar.webp" },
    date: "28 de Julho, 2025",
    content: `# Saúde Mental Feminina em Contextos de Deslocamento

O deslocamento forçado tem impactos profundos na saúde mental...`
  },
  {
    id: 7,
    title: "Participação Social Feminina em Projetos",
    image: "/blog-image-3.webp",
    tags: ["ParticipacãoSocial", "CasosDeSuccesso"],
    author: { name: "Beatriz Alves", avatar: "/blog-avatar.webp" },
    date: "25 de Julho, 2025",
    content: `# Participação Social Feminina em Projetos

Casos de sucesso mostram como a participação feminina...`
  },
  {
    id: 8,
    title: "Políticas Públicas para Mulheres Impactadas",
    image: "/blog-image.webp",
    tags: ["PolíticasPúblicas", "Legislação"],
    author: { name: "Roberta Mendes", avatar: "/blog-avatar.webp" },
    date: "20 de Julho, 2025",
    content: `# Políticas Públicas para Mulheres Impactadas

As políticas públicas devem considerar as necessidades específicas...`
  },
  {
    id: 9,
    title: "Acesso à Água em Áreas de Reassentamento",
    image: "/blog-image-2.webp",
    tags: ["DireitosEssenciais", "RecursosHídricos"],
    author: { name: "Camila Rocha", avatar: "/blog-avatar.webp" },
    date: "15 de Julho, 2025",
    content: `# Acesso à Água em Áreas de Reassentamento

O acesso à água potável é um direito fundamental...`
  },
  {
    id: 10,
    title: "Mobilização Comunitária e Empoderamento Feminino",
    image: "/blog-image-3.webp",
    tags: ["ParticipacãoSocial", "Mobilização"],
    author: { name: "Daniela Ferreira", avatar: "/blog-avatar.webp" },
    date: "10 de Julho, 2025",
    content: `# Mobilização Comunitária e Empoderamento Feminino

A mobilização comunitária liderada por mulheres...`
  },
  {
    id: 11,
    title: "Impactos Socioambientais em Comunidades Tradicionais",
    image: "/blog-image.webp",
    tags: ["MeioAmbiente", "ComunidadesTradiconais"],
    author: { name: "Luciana Martins", avatar: "/blog-avatar.webp" },
    date: "5 de Julho, 2025",
    content: `# Impactos Socioambientais em Comunidades Tradicionais

Comunidades tradicionais enfrentam desafios únicos...`
  },
  {
    id: 12,
    title: "Educação e Capacitação para Mulheres em Áreas Afetadas",
    image: "/blog-image-2.webp",
    tags: ["Educação", "Capacitação"],
    author: { name: "Renata Silva", avatar: "/blog-avatar.webp" },
    date: "1 de Julho, 2025",
    content: `# Educação e Capacitação para Mulheres em Áreas Afetadas

Programas de educação e capacitação são essenciais...`
  }
];

export const getBlogPostById = (id: string | number): BlogPost | null => {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  return BLOG_MOCK_DATA.find(post => post.id === numId) || null;
};

export const getAllBlogPosts = (): BlogPost[] => {
  return BLOG_MOCK_DATA;
};
