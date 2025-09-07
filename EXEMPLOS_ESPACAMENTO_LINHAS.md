# Exemplos Práticos - Espaçamento Entre Linhas

## Código Completo para Reimplementação

### 1. Arquivo WordEditor.tsx - Seção de Imports
```typescript
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { History } from '@tiptap/extension-history'
import { Extension } from '@tiptap/core' // <- IMPORTANTE para criar extensões customizadas
```

### 2. Extensão LineHeight Completa
```typescript
// Extensão customizada para espaçamento entre linhas
const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'], // Aplica a parágrafos e títulos
        attributes: {
          lineHeight: {
            default: null, // Valor padrão nulo
            parseHTML: element => element.style.lineHeight || null, // Lê do CSS
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {} // Se não tem valor, não aplica estilo
              }
              return {
                style: `line-height: ${attributes.lineHeight}`, // Aplica como CSS inline
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      // Comando para definir espaçamento
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
      
      // Comando para remover espaçamento
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
                  lineHeight: null, // Remove o atributo
                })
              }
            })
          } else {
            // Se há seleção, remover apenas do texto selecionado
            tr.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight: null, // Remove o atributo
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

### 3. Configuração do Editor com LineHeight
```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    FontSize, // Extensão customizada de tamanho de fonte
    LineHeight, // <- ADICIONAR ESTA LINHA - Nossa extensão customizada
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

### 4. WordToolbar.tsx - Configuração dos Valores
```typescript
// Array com os valores de espaçamento disponíveis
const lineHeights = [
  { label: "0.6", value: "0.6" }, // Muito compacto
  { label: "0.8", value: "0.8" }, // Compacto (padrão)
  { label: "1.0", value: "1.0" }, // Normal
  { label: "1.2", value: "1.2" }, // Ligeiramente espaçado
  { label: "1.5", value: "1.5" }, // Espaçado
  { label: "2.0", value: "2.0" }, // Muito espaçado
]
```

### 5. Componente Select na Toolbar
```typescript
{/* Espaçamento entre linhas */}
<Select
  value={editor.getAttributes('paragraph').lineHeight || '0.8'} // Valor atual ou padrão
  onValueChange={(value) => {
    if (value === 'remove') {
      editor.chain().focus().unsetLineHeight().run() // Remove espaçamento
    } else {
      editor.chain().focus().setLineHeight(value).run() // Aplica espaçamento
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

## Exemplos de Uso

### 1. Aplicar Espaçamento Programaticamente
```typescript
// Aplicar espaçamento 1.5 a todo o documento
editor.chain().focus().setLineHeight('1.5').run()

// Remover espaçamento de todo o documento
editor.chain().focus().unsetLineHeight().run()
```

### 2. Verificar Espaçamento Atual
```typescript
// Obter o espaçamento do parágrafo atual
const currentLineHeight = editor.getAttributes('paragraph').lineHeight
console.log('Espaçamento atual:', currentLineHeight || 'padrão')
```

### 3. Aplicar Espaçamento Condicionalmente
```typescript
// Aplicar espaçamento apenas se não houver nenhum definido
if (!editor.getAttributes('paragraph').lineHeight) {
  editor.chain().focus().setLineHeight('1.2').run()
}
```

## CSS Relacionado

### 1. Estilos Base do Editor
```css
.page-content {
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  line-height: 0.8; /* Valor padrão para todo o conteúdo */
  color: #000;
  min-height: 257mm;
}

.page-content p {
  margin-bottom: 12pt; /* Espaçamento entre parágrafos */
}

.page-content h1, .page-content h2, .page-content h3 {
  margin-top: 24pt;
  margin-bottom: 12pt;
}
```

### 2. Como o CSS Inline Sobrescreve
```html
<!-- Exemplo de HTML gerado -->
<p style="line-height: 1.5">Este parágrafo tem espaçamento 1.5</p>
<p>Este parágrafo usa o padrão (0.8)</p>
<h2 style="line-height: 2.0">Este título tem espaçamento 2.0</h2>
```

## Debugging e Testes

### 1. Verificar se a Extensão está Carregada
```typescript
// No console do navegador
console.log(editor.extensionManager.extensions.map(ext => ext.name))
// Deve incluir 'lineHeight' na lista
```

### 2. Testar Comandos Manualmente
```typescript
// No console do navegador
editor.chain().focus().setLineHeight('2.0').run()
editor.chain().focus().unsetLineHeight().run()
```

### 3. Verificar HTML Gerado
```typescript
// Ver o HTML atual do editor
console.log(editor.getHTML())
// Deve mostrar style="line-height: X" nos elementos modificados
```

## Casos de Uso Comuns

### 1. Documentos Acadêmicos
- **Espaçamento 1.5**: Padrão para trabalhos acadêmicos
- **Espaçamento 2.0**: Para revisões e correções

### 2. Provas e Exercícios
- **Espaçamento 0.8**: Maximizar conteúdo em uma página
- **Espaçamento 1.2**: Melhor legibilidade

### 3. Materiais Didáticos
- **Espaçamento 1.0**: Equilíbrio entre espaço e conteúdo
- **Espaçamento 1.5**: Para textos longos

## Integração com Outras Funcionalidades

### 1. Exportação PDF
O espaçamento é preservado na exportação PDF porque:
- É aplicado como CSS inline
- O html2canvas captura o estilo renderizado
- O jsPDF mantém a formatação visual

### 2. Exportação Word
O espaçamento é convertido para formato Word:
- O parser HTML lê o style="line-height"
- É convertido para propriedades do documento Word
- Mantém compatibilidade com Microsoft Word

### 3. Templates
Os templates podem incluir espaçamento pré-definido:
```html
<p style="line-height: 1.2">Texto com espaçamento específico</p>
```

## Melhorias Futuras

### 1. Valores Personalizados
```typescript
// Permitir valores decimais personalizados
<input 
  type="number" 
  step="0.1" 
  min="0.5" 
  max="3.0"
  onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
/>
```

### 2. Presets por Tipo de Documento
```typescript
const documentPresets = {
  academic: '1.5',
  exam: '0.8',
  reading: '1.2',
  presentation: '1.0'
}
```

### 3. Aplicação por Tipo de Elemento
```typescript
// Espaçamento diferente para títulos e parágrafos
editor.chain().focus().setLineHeight('1.0', { types: ['paragraph'] }).run()
editor.chain().focus().setLineHeight('1.2', { types: ['heading'] }).run()
```

Este arquivo fornece todos os exemplos práticos necessários para reimplementar o recurso de espaçamento entre linhas de forma completa e funcional.