# Sistema de Wizard de Reclamação - Design System

## Visão Geral

Este é um mini design system criado especificamente para o fluxo de criação de reclamações. Todos os componentes seguem fielmente o design do Figma, com tipografia, cores, espaçamentos e comportamentos consistentes.

## Estrutura de Pastas

```
_components/
├── wizard/              # Componentes estruturais do wizard
├── fields/              # Campos de formulário reutilizáveis
├── steps/               # Componentes de cada etapa
└── new-complaint-content.tsx  # Orquestrador principal
```

## Componentes do Wizard

### ComplaintWizardShell
**Propósito**: Container principal que define o layout e background do wizard.
**Características**:
- Background cinza claro (#F5F7FA)
- Container centralizado com largura máxima de 700px
- Espaçamento vertical consistente

### ComplaintLoginBanner
**Propósito**: Banner exibido quando o usuário não está autenticado.
**Características**:
- Gradiente azul (de #1E88E5 para #075599)
- Título em negrito com tracking ajustado
- Botão branco com texto azul
- Sombra consistente

### ComplaintCompanyHeader
**Propósito**: Exibe informações da empresa selecionada.
**Características**:
- Avatar circular de 100x100px
- Nome da empresa em azul (#1E88E5)
- Badge "VERIFICADA" quando aplicável
- Ícones de localização e projetos
- Separador horizontal inferior

### ComplaintStepProgress
**Propósito**: Barra de progresso visual do wizard.
**Características**:
- Largura fixa de 262px centralizada
- Texto "Passo X de Y" em cinza
- Barra de progresso azul (#1E88E5)
- Animação suave de transição

### ComplaintStepFooter
**Propósito**: Rodapé padronizado com ações de navegação.
**Características**:
- Indicador "Informações privadas" à esquerda
- Botões "Voltar" e ação principal à direita
- Suporte a estados de loading e disabled
- Labels customizáveis por etapa

## Componentes de Campos

### ComplaintField
**Propósito**: Wrapper que padroniza labels, hints e erros.
**Características**:
- Label em negrito com tracking de 2px
- Suporte a campo obrigatório (asterisco)
- Exibição de hints e mensagens de erro
- Espaçamento vertical consistente

### ComplaintInput
**Propósito**: Input de texto padronizado.
**Características**:
- Altura fixa de 45px
- Bordas arredondadas (9px)
- Fonte DM Sans
- Estados de foco, disabled e erro
- Placeholder em cinza

### ComplaintTextarea
**Propósito**: Área de texto multilinha padronizada.
**Características**:
- Altura mínima de 120px
- Redimensionável verticalmente
- Mesmos padrões visuais do Input
- Padding interno adequado

### ComplaintRadioGroup
**Propósito**: Grupo de radio buttons padronizado.
**Características**:
- Radio buttons de 20x20px
- Labels clicáveis
- Espaçamento vertical de 4px
- Cor azul quando selecionado

### ComplaintSelect
**Propósito**: Select dropdown padronizado.
**Características**:
- Mesma altura e estilo do Input (45px)
- Placeholder customizável
- Opções com fonte DM Sans
- Estados de foco e erro

### ComplaintSwitchRow
**Propósito**: Linha com switch e descrição.
**Características**:
- Layout flex com label à esquerda e switch à direita
- Suporte a descrição secundária
- Separador inferior entre itens
- Switch azul quando ativo

### ComplaintDropzone
**Propósito**: Área de upload de arquivos com drag & drop.
**Características**:
- Borda tracejada azul
- Ícone de upload centralizado
- Suporte a drag & drop
- Lista de arquivos selecionados
- Validação de formato e tamanho
- Alerta informativo sobre limites

## Componentes de Etapas

### StepOne
**Etapa**: Informações preliminares
**Campos**:
- Radio group: "Você abriu uma reclamação sobre esse tema em outro canal?"
- Input condicional: "Em qual canal?" (se resposta for "Sim")

### StepTwo
**Etapa**: Detalhes da reclamação
**Campos**:
- Input: Título da reclamação (obrigatório, mín. 3 caracteres)
- Textarea: Descrição detalhada (obrigatório, mín. 10 caracteres)
- Input: Localização do problema (opcional)
- Alerta informativo sobre dados sensíveis

### StepThree
**Etapa**: Anexar arquivos
**Campos**:
- Dropzone para upload de até 3 arquivos
- Formatos aceitos: PNG, JPG, PDF
- Tamanho máximo: 5MB por arquivo
- Botão "Continuar sem anexo"

### StepFour
**Etapa**: Classificação da reclamação
**Campos**:
- Select: Categoria do impacto (obrigatório)
- Select: Projeto da empresa (opcional)
- Select: Urgência (obrigatório)
- Select: Escopo (obrigatório)
- Switch: Reclamação anônima
- Switch: Reclamação pública

## Padrões de Design

### Tipografia
- **Títulos principais**: Poppins SemiBold, 32px
- **Subtítulos**: Poppins Light, 16px
- **Labels**: Poppins Bold, 14px, tracking 2px
- **Inputs**: DM Sans Medium, 14px
- **Hints**: Poppins Regular, 12px

### Cores
- **Azul principal**: #1E88E5
- **Azul hover**: #1976D2
- **Azul claro**: #4299FF
- **Texto principal**: #2A3F54
- **Texto secundário**: #607D8B
- **Texto escuro**: #232360
- **Borda**: #E5E5ED
- **Background**: #F5F7FA
- **Background alerta**: #E3F2FD

### Espaçamentos
- **Gap entre seções**: 24px (space-y-6)
- **Gap entre campos**: 16px (space-y-4)
- **Padding do card**: 24px (p-6)
- **Padding de inputs**: 18px horizontal
- **Altura de inputs**: 45px
- **Altura de botões**: auto (py-3)

### Bordas e Sombras
- **Raio de bordas**: 9px (inputs), 12px (cards)
- **Sombra do card**: 0px 4px 4px rgba(0,0,0,0.25)
- **Borda de inputs**: 1px solid #E5E5ED
- **Borda de foco**: 1px solid #1E88E5 + ring

## Uso

```tsx
import { ComplaintWizardShell } from "./wizard/complaint-wizard-shell";
import { ComplaintLoginBanner } from "./wizard/complaint-login-banner";
import { StepOne } from "./steps/step-one";

function MyWizard() {
  return (
    <ComplaintWizardShell>
      <ComplaintLoginBanner />
      <Card>
        <StepOne data={data} onChange={setData} />
      </Card>
    </ComplaintWizardShell>
  );
}
```

## Acessibilidade

Todos os componentes seguem práticas básicas de acessibilidade:
- Labels associados a inputs via htmlFor/id
- Estados de foco visíveis
- Suporte a navegação por teclado
- Mensagens de erro descritivas
- Contraste adequado de cores

## Responsividade

O design é otimizado para desktop (700px de largura), mas mantém responsividade básica:
- Container com max-width e padding lateral
- Campos com width: 100%
- Flex layouts que se adaptam
- Textos que quebram adequadamente
