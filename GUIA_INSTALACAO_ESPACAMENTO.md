# Guia de Instalação Rápida - Espaçamento Entre Linhas

## Checklist de Reimplementação

### ✅ Pré-requisitos
- [ ] TipTap instalado e funcionando
- [ ] Componentes UI (Select, SelectContent, etc.) disponíveis
- [ ] WordEditor.tsx e WordToolbar.tsx existem

### ✅ Passo 1: Modificar WordEditor.tsx

#### 1.1 Adicionar Import
```typescript
import { Extension } from '@tiptap/core'
```

#### 1.2 Adicionar Extensão LineHeight (antes da função WordEditor)
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
            tr.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight,
                })
              }
            })
          } else {
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
            tr.doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight: null,
                })
              }
            })
          } else {
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

#### 1.3 Adicionar LineHeight às Extensões do Editor
Procurar por `useEditor` e adicionar `LineHeight` na lista de extensões:
```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    FontSize, // se existir
    LineHeight, // <- ADICIONAR ESTA LINHA
    FontFamily,
    Color,
    // ... outras extensões
  ],
  // ... resto da configuração
})
```

#### 1.4 Verificar CSS (opcional - melhorar padrão)
Procurar por `.page-content` e verificar se tem:
```css
.page-content {
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  line-height: 0.8; /* <- Valor padrão */
  color: #000;
  min-height: 257mm;
}
```

### ✅ Passo 2: Modificar WordToolbar.tsx

#### 2.1 Adicionar Array de Valores (antes da função WordToolbar)
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

#### 2.2 Adicionar Controle na Toolbar
Procurar por onde estão os outros controles (Bold, Italic, etc.) e adicionar:
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

### ✅ Passo 3: Testes

#### 3.1 Teste Básico
- [ ] Abrir o editor
- [ ] Verificar se o dropdown de espaçamento aparece na toolbar
- [ ] Selecionar diferentes valores e ver se o texto muda

#### 3.2 Teste de Seleção
- [ ] Selecionar parte do texto
- [ ] Aplicar espaçamento
- [ ] Verificar se só o texto selecionado mudou

#### 3.3 Teste de Documento Completo
- [ ] Não selecionar nada
- [ ] Aplicar espaçamento
- [ ] Verificar se todo o documento mudou

#### 3.4 Teste de Exportação
- [ ] Aplicar espaçamento
- [ ] Exportar para PDF
- [ ] Verificar se o espaçamento foi mantido

### ✅ Passo 4: Verificação de Funcionamento

#### 4.1 Console do Navegador
```javascript
// Verificar se a extensão foi carregada
console.log(editor.extensionManager.extensions.map(ext => ext.name))
// Deve incluir 'lineHeight'

// Testar comando manualmente
editor.chain().focus().setLineHeight('2.0').run()

// Ver HTML gerado
console.log(editor.getHTML())
// Deve mostrar style="line-height: 2.0" nos elementos
```

#### 4.2 Verificar HTML
O HTML gerado deve ter algo como:
```html
<p style="line-height: 1.5">Texto com espaçamento</p>
```

## Solução de Problemas

### ❌ Problema: Dropdown não aparece
**Solução:**
- Verificar se os componentes UI estão importados
- Verificar se o array `lineHeights` foi adicionado
- Verificar se não há erros no console

### ❌ Problema: Espaçamento não aplica
**Solução:**
- Verificar se `LineHeight` está na lista de extensões
- Verificar se não há erros de sintaxe na extensão
- Verificar se o editor está sendo usado corretamente

### ❌ Problema: Valor não persiste
**Solução:**
- Verificar se `parseHTML` e `renderHTML` estão corretos
- Verificar se o conteúdo está sendo salvo corretamente

### ❌ Problema: Conflito com CSS
**Solução:**
- Estilos inline têm prioridade sobre CSS externo
- Verificar se não há `!important` conflitante
- Usar ferramentas de desenvolvedor para inspecionar estilos

## Arquivos de Backup

Antes de fazer as modificações, faça backup dos arquivos:
```bash
cp client/components/editor/WordEditor.tsx client/components/editor/WordEditor.tsx.backup
cp client/components/editor/WordToolbar.tsx client/components/editor/WordToolbar.tsx.backup
```

## Comandos Úteis

### Verificar Dependências
```bash
npm list @tiptap/react @tiptap/core
```

### Reinstalar TipTap (se necessário)
```bash
npm install @tiptap/react @tiptap/core @tiptap/starter-kit
```

### Limpar Cache (se houver problemas)
```bash
npm run build
# ou
rm -rf node_modules package-lock.json && npm install
```

## Localização dos Arquivos

```
wordwise-app/
├── client/
│   └── components/
│       └── editor/
│           ├── WordEditor.tsx     <- Modificar aqui
│           └── WordToolbar.tsx    <- Modificar aqui
├── RECURSO_ESPACAMENTO_LINHAS.md  <- Documentação completa
├── EXEMPLOS_ESPACAMENTO_LINHAS.md <- Exemplos de código
└── GUIA_INSTALACAO_ESPACAMENTO.md <- Este arquivo
```

## Tempo Estimado
- **Implementação**: 15-30 minutos
- **Testes**: 10-15 minutos
- **Total**: 25-45 minutos

## Suporte

Se houver problemas:
1. Verificar console do navegador para erros
2. Comparar com os arquivos de exemplo
3. Testar comandos manualmente no console
4. Verificar se todas as dependências estão instaladas

---

**✅ Checklist Final:**
- [ ] Extensão LineHeight adicionada
- [ ] Extensão incluída na lista do editor
- [ ] Array lineHeights adicionado
- [ ] Controle Select adicionado na toolbar
- [ ] Testes básicos realizados
- [ ] Exportação testada
- [ ] Documentação revisada

**🎉 Pronto! O recurso de espaçamento entre linhas está funcionando!**