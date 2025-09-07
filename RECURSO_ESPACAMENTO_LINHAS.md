# Recurso de Espaçamento Entre Linhas - WordWise

## Descrição
Este documento contém toda a implementação do recurso de espaçamento entre linhas (line-height) no editor WordWise. O recurso permite ajustar o espaçamento vertical entre linhas de texto em parágrafos e títulos.

## Arquivos Modificados

### 1. WordEditor.tsx
**Localização:** `client/components/editor/WordEditor.tsx`

#### Extensão LineHeight (Linhas 74-165)
```typescript
// Extensão customizada para espaçamento entre linhas
const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {}
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { from, to } = selection
        const { empty } = selection

        if (dispatch) {
          if (empty) {
            // Se não há seleção, aplicar a todo o documento
            tr.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight,
                })
              }
            })
          } else {
            // Se há seleção, aplicar apenas ao texto selecionado
            tr.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight,
                })
              }
            })
          }
        }

        return true
      },
      unsetLineHeight: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { from, to } = selection
        const { empty } = selection

        if (dispatch) {
          if (empty) {
            // Se não há seleção, remover de todo o documento
            tr.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight: null,
                })
              }
            })
          } else {
            // Se há seleção, remover apenas do texto selecionado
            tr.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight: null,
                })
              }
            })
          }
        }

        return true
      },
    }
  },
})
```

#### Configuração do Editor (adicionar LineHeight às extensões)
```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    FontSize,
    LineHeight, // <- ADICIONAR ESTA LINHA
    FontFamily,
    Color,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Highlight.configure({ multicolor: true }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    History,
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    onContentChange?.(html)
  },
})
```

#### Estilos CSS (Linhas 740-790)
```css
.page-content {
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  line-height: 0.8; /* <- VALOR PADRÃO */
  color: #000;
  min-height: 257mm;
}

.page-content p {
  margin-bottom: 12pt;
}

.page-content h1, .page-content h2, .page-content h3 {
  margin-top: 24pt;
  margin-bottom: 12pt;
}
```

### 2. WordToolbar.tsx
**Localização:** `client/components/editor/WordToolbar.tsx`

#### Configuração dos valores de line-height (Linhas 81-88)
```typescript
const lineHeights = [
  { label: "0.6", value: "0.6" },
  { label: "0.8", value: "0.8" },
  { label: "1.0", value: "1.0" },
  { label: "1.2", value: "1.2" },
  { label: "1.5", value: "1.5" },
  { label: "2.0", value: "2.0" },
]
```

#### Controle de Espaçamento na Toolbar (Linhas 248-268)
```typescript
{/* Espaçamento entre linhas */}
<Select
  value={editor.getAttributes('paragraph').lineHeight || '0.8'}
  onValueChange={(value) => {
    if (value === 'remove') {
      editor.chain().focus().unsetLineHeight().run()
    } else {
      editor.chain().focus().setLineHeight(value).run()
    }
  }}
>
  <SelectTrigger className="w-20 h-8">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {lineHeights.map((lineHeight) => (
      <SelectItem key={lineHeight.value} value={lineHeight.value}>
        {lineHeight.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Como Funciona

### 1. Extensão TipTap
A extensão `LineHeight` é criada usando a API do TipTap e:
- **addGlobalAttributes()**: Define o atributo `lineHeight` para elementos `paragraph` e `heading`
- **parseHTML**: Lê o valor de `line-height` do CSS inline
- **renderHTML**: Aplica o valor como estilo CSS inline
- **addCommands()**: Adiciona comandos `setLineHeight` e `unsetLineHeight`

### 2. Comandos
- **setLineHeight(value)**: Aplica o espaçamento especificado
  - Se não há seleção: aplica a todo o documento
  - Se há seleção: aplica apenas ao texto selecionado
- **unsetLineHeight()**: Remove o espaçamento customizado
  - Funciona da mesma forma que setLineHeight, mas remove o atributo

### 3. Interface do Usuário
- Select dropdown na toolbar com valores pré-definidos
- Valor padrão: 0.8 (espaçamento compacto)
- Opções: 0.6, 0.8, 1.0, 1.2, 1.5, 2.0

### 4. Persistência
- O valor é salvo como atributo HTML inline: `style="line-height: 1.2"`
- Funciona com exportação PDF e Word
- Mantém formatação ao copiar/colar

## Instalação/Reimplementação

### Passo 1: Adicionar a extensão LineHeight
1. Copie o código da extensão `LineHeight` para o arquivo `WordEditor.tsx`
2. Adicione a extensão na lista de extensões do editor

### Passo 2: Configurar a toolbar
1. Adicione o array `lineHeights` no `WordToolbar.tsx`
2. Adicione o componente Select na toolbar

### Passo 3: Ajustar estilos CSS
1. Defina o `line-height` padrão na classe `.page-content`
2. Certifique-se de que os estilos não conflitam

## Dependências
- @tiptap/react
- @tiptap/core
- @tiptap/extension-text-style
- Componentes UI: Select, SelectContent, SelectItem, SelectTrigger, SelectValue

## Notas Importantes

1. **Valor Padrão**: O sistema usa 0.8 como padrão para espaçamento compacto
2. **Compatibilidade**: Funciona com exportação PDF e Word
3. **Seleção**: Aplica a todo documento se não há seleção, ou apenas ao texto selecionado
4. **Performance**: Usa `setNodeMarkup` para eficiência
5. **CSS**: O valor é aplicado como estilo inline, sobrescrevendo CSS externo

## Testes

### Casos de Teste
1. **Aplicar espaçamento sem seleção**: Deve aplicar a todo o documento
2. **Aplicar espaçamento com seleção**: Deve aplicar apenas ao texto selecionado
3. **Remover espaçamento**: Deve remover o atributo lineHeight
4. **Exportar PDF**: Deve manter o espaçamento no PDF
5. **Exportar Word**: Deve manter o espaçamento no documento Word
6. **Copiar/Colar**: Deve preservar a formatação

## Troubleshooting

### Problema: Espaçamento não aplica
- Verificar se a extensão LineHeight está na lista de extensões
- Verificar se os comandos estão sendo chamados corretamente

### Problema: Valor não persiste
- Verificar se o parseHTML está funcionando
- Verificar se o renderHTML está retornando o estilo correto

### Problema: Conflito com CSS
- Estilos inline têm prioridade sobre CSS externo
- Verificar especificidade CSS

## Versão
- **Data de criação**: Dezembro 2024
- **Versão do TipTap**: 2.x
- **Status**: Funcional e testado