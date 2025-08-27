import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Table,
  Type,
  Palette,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Eye,
  Edit3,
  Save,
  FileText,
  Plus,
  Trash2,
  Copy,
  MoreVertical,
  Strikethrough,
  Subscript,
  Superscript,
  Highlighter,
  Image,
  Link,
  Quote,
  Indent,
  Outdent,
  LineHeight,
  Spacing
} from "lucide-react";
import Layout from "@/components/Layout";
import { Question } from "@/components/QuestionCard";
import { cn } from "@/lib/utils";

interface ExamData {
  title: string;
  instructions: string;
  studentInfo: {
    name: string;
    class: string;
    date: string;
    duration: string;
  };
  questions: Question[];
}

interface EditorState {
  zoom: number;
  isPreviewMode: boolean;
  selectedText: string;
  cursorPosition: number;
  wordCount: number;
  pageCount: number;
}

const fonts = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Calibri", label: "Calibri" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" }
];

const fontSizes = [
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12", label: "12" },
  { value: "14", label: "14" },
  { value: "16", label: "16" },
  { value: "18", label: "18" },
  { value: "20", label: "20" },
  { value: "24", label: "24" }
];

const colors = [
  "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00",
  "#FF00FF", "#00FFFF", "#800000", "#008000", "#000080",
  "#808000", "#800080", "#008080", "#C0C0C0", "#808080"
];

const lineHeights = [
  { value: "1", label: "1.0" },
  { value: "1.15", label: "1.15" },
  { value: "1.5", label: "1.5" },
  { value: "2", label: "2.0" },
  { value: "2.5", label: "2.5" },
  { value: "3", label: "3.0" }
];

const highlightColors = [
  "#FFFF00", "#00FF00", "#00FFFF", "#FF00FF", "#FFA500",
  "#FFB6C1", "#98FB98", "#87CEEB", "#DDA0DD", "#F0E68C"
];

export default function CriarProva3() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  
  const [examData, setExamData] = useState<ExamData>({
    title: "Nova Prova",
    instructions: "Leia atentamente as questões e responda de acordo com o solicitado.",
    studentInfo: {
      name: "Nome: _________________________________",
      class: "Turma: ____________",
      date: "Data: ___/___/______",
      duration: "Duração: 60 minutos"
    },
    questions: [
      {
        id: "1",
        type: "multipleChoice",
        question: "Qual é a capital do Brasil?",
        options: ["São Paulo", "Rio de Janeiro", "Brasília", "Belo Horizonte"],
        correctAnswer: 2,
        points: 1
      },
      {
        id: "2",
        type: "trueFalse",
        question: "O Brasil é o maior país da América do Sul.",
        correctAnswer: "true",
        points: 1
      }
    ]
  });

  const [editorState, setEditorState] = useState<EditorState>({
    zoom: 100,
    isPreviewMode: false,
    selectedText: "",
    cursorPosition: 0,
    wordCount: 0,
    pageCount: 1
  });

  const [toolbarState, setToolbarState] = useState({
    selectedFont: "Times New Roman",
    selectedFontSize: "12",
    selectedTextColor: "#000000",
    selectedHighlightColor: "#FFFF00",
    selectedLineHeight: "1.5",
    showColorPicker: false,
    showHighlightPicker: false
  });

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    questionIndex?: number;
  }>({ visible: false, x: 0, y: 0 });

  // Drag and drop state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    draggedIndex: number | null;
    dragOverIndex: number | null;
  }>({ isDragging: false, draggedIndex: null, dragOverIndex: null });

  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // Auto-save functionality
  useEffect(() => {
    const savedData = localStorage.getItem('examData-draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setExamData(parsed);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem('examData-draft', JSON.stringify(examData));
      setLastSaved(new Date());
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(saveTimer);
  }, [examData]);

  // Update word count, cursor position and page count
  const updateWordCount = () => {
    const editorElement = document.querySelector('[contenteditable="true"]');
    if (editorElement) {
      const text = editorElement.textContent || '';
      const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      
      // Calculate approximate page count based on content height
      const contentHeight = editorElement.scrollHeight;
      const pageHeight = 1123; // A4 height in pixels (29.7cm at 96dpi)
      const pageCount = Math.max(1, Math.ceil(contentHeight / pageHeight));
      
      setEditorState(prev => ({ ...prev, wordCount, pageCount }));
    }
  };

  const updateCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      const editorElement = document.querySelector('[contenteditable="true"]');
      if (editorElement) {
        preCaretRange.selectNodeContents(editorElement);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const textBeforeCaret = preCaretRange.toString();
        const lines = textBeforeCaret.split('\n');
        const lineNumber = lines.length;
        setEditorState(prev => ({ ...prev, cursorPosition: lineNumber }));
      }
    }
  };

  // Formatting functions
  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateWordCount();
  };

  const insertTable = () => {
    const rows = prompt('Número de linhas:', '3');
    const cols = prompt('Número de colunas:', '3');
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">Célula</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody></table>';
      document.execCommand('insertHTML', false, tableHTML);
    }
  };

  const insertImage = () => {
    const url = prompt('URL da imagem:');
    if (url) {
      document.execCommand('insertImage', false, url);
    }
  };

  const insertLink = () => {
    const url = prompt('URL do link:');
    const text = prompt('Texto do link:');
    if (url && text) {
      document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${text}</a>`);
    }
  };

  // Toolbar Component
  const Toolbar = () => (
    <Card className="border-0 shadow-sm mb-4">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Formatting Controls */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormatting('bold')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Negrito (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormatting('italic')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Itálico (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormatting('underline')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Sublinhado (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.execCommand('strikeThrough')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Riscado"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </div>

          {/* Font and Size */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Select
              value={toolbarState.selectedFont}
              onValueChange={(value) => {
                setToolbarState(prev => ({ ...prev, selectedFont: value }));
                applyFormatting('fontName', value);
              }}
            >
              <SelectTrigger className="h-8 w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map(font => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={toolbarState.selectedFontSize}
              onValueChange={(value) => {
                setToolbarState(prev => ({ ...prev, selectedFontSize: value }));
                applyFormatting('fontSize', value);
              }}
            >
              <SelectTrigger className="h-8 w-16 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map(size => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Color and Highlight */}
          <div className="flex items-center gap-1 border-r pr-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToolbarState(prev => ({ ...prev, showColorPicker: !prev.showColorPicker }))}
                className="h-8 w-8 p-0 hover:bg-blue-100"
                title="Cor do Texto"
              >
                <div className="relative">
                  <Type className="h-4 w-4" />
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 rounded"
                    style={{ backgroundColor: toolbarState.selectedTextColor }}
                  />
                </div>
              </Button>
              {toolbarState.showColorPicker && (
                <div className="absolute top-10 left-0 bg-white border shadow-lg rounded-md p-2 z-50">
                  <div className="grid grid-cols-5 gap-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setToolbarState(prev => ({ ...prev, selectedTextColor: color, showColorPicker: false }));
                          applyFormatting('foreColor', color);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToolbarState(prev => ({ ...prev, showHighlightPicker: !prev.showHighlightPicker }))}
                className="h-8 w-8 p-0 hover:bg-blue-100"
                title="Destacar Texto"
              >
                <div className="relative">
                  <Highlighter className="h-4 w-4" />
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 rounded"
                    style={{ backgroundColor: toolbarState.selectedHighlightColor }}
                  />
                </div>
              </Button>
              {toolbarState.showHighlightPicker && (
                <div className="absolute top-10 left-0 bg-white border shadow-lg rounded-md p-2 z-50">
                  <div className="grid grid-cols-5 gap-1">
                    {highlightColors.map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setToolbarState(prev => ({ ...prev, selectedHighlightColor: color, showHighlightPicker: false }));
                          applyFormatting('backColor', color);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.execCommand('justifyLeft')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Alinhar à Esquerda"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.execCommand('justifyCenter')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Centralizar"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.execCommand('justifyRight')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Alinhar à Direita"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.execCommand('justifyFull')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Justificar"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists and Indentation */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.execCommand('insertUnorderedList')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Lista com Marcadores"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.execCommand('insertOrderedList')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Lista Numerada"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.execCommand('indent')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Aumentar Recuo"
            >
              <Indent className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.execCommand('outdent')}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Diminuir Recuo"
            >
              <Outdent className="h-4 w-4" />
            </Button>
          </div>

          {/* Line Height and Spacing */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Select
              value={toolbarState.selectedLineHeight}
              onValueChange={(value) => {
                setToolbarState(prev => ({ ...prev, selectedLineHeight: value }));
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const span = document.createElement('span');
                  span.style.lineHeight = value;
                  try {
                    range.surroundContents(span);
                  } catch (e) {
                    span.appendChild(range.extractContents());
                    range.insertNode(span);
                  }
                }
              }}
            >
              <SelectTrigger className="h-8 w-20 text-sm">
                <SelectValue placeholder="1.5" />
              </SelectTrigger>
              <SelectContent>
                {lineHeights.map(height => (
                  <SelectItem key={height.value} value={height.value}>
                    {height.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Insert Elements */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const table = '<table border="1" style="border-collapse: collapse; width: 100%;"><tr><td style="padding: 8px;">Célula 1</td><td style="padding: 8px;">Célula 2</td></tr><tr><td style="padding: 8px;">Célula 3</td><td style="padding: 8px;">Célula 4</td></tr></table>';
                document.execCommand('insertHTML', false, table);
              }}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Inserir Tabela"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = prompt('Digite a URL da imagem:');
                if (url) {
                  document.execCommand('insertImage', false, url);
                }
              }}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Inserir Imagem"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = prompt('Digite a URL do link:');
                if (url) {
                  document.execCommand('createLink', false, url);
                }
              }}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Inserir Link"
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                document.execCommand('undo');
                updateWordCount();
              }}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                document.execCommand('redo');
                updateWordCount();
              }}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Refazer (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditorState(prev => ({ ...prev, zoom: Math.max(50, prev.zoom - 10) }))}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Diminuir Zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Select 
              value={editorState.zoom.toString()} 
              onValueChange={(value) => setEditorState(prev => ({ ...prev, zoom: parseInt(value) }))}
            >
              <SelectTrigger className="h-8 w-20 text-sm">
                <SelectValue>{editorState.zoom}%</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50%</SelectItem>
                <SelectItem value="75">75%</SelectItem>
                <SelectItem value="100">100%</SelectItem>
                <SelectItem value="125">125%</SelectItem>
                <SelectItem value="150">150%</SelectItem>
                <SelectItem value="200">200%</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditorState(prev => ({ ...prev, zoom: Math.min(200, prev.zoom + 10) }))}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="Aumentar Zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Mode */}
          <div className="flex items-center gap-1">
            <Button
              variant={editorState.isPreviewMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setEditorState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))}
              className="h-8 px-3 hover:bg-blue-100"
              title={editorState.isPreviewMode ? "Modo Edição" : "Modo Visualização"}
            >
              <Eye className="h-4 w-4 mr-1" />
              {editorState.isPreviewMode ? "Editar" : "Visualizar"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.print()}
              className="h-8 px-3 hover:bg-blue-100"
              title="Imprimir"
            >
              <FileText className="h-4 w-4 mr-1" />
              Imprimir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );



  // Auto-save functionality and keyboard shortcuts
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        localStorage.setItem('exam-draft', JSON.stringify({
          content,
          examData,
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSave);
  }, [examData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            applyFormatting('bold');
            break;
          case 'i':
            e.preventDefault();
            applyFormatting('italic');
            break;
          case 'u':
            e.preventDefault();
            applyFormatting('underline');
            break;
          case 'z':
            if (!e.shiftKey) {
              e.preventDefault();
              document.execCommand('undo');
              updateWordCount();
            }
            break;
          case 'y':
            e.preventDefault();
            document.execCommand('redo');
            updateWordCount();
            break;
          case '=':
            e.preventDefault();
            setEditorState(prev => ({ ...prev, zoom: Math.min(200, prev.zoom + 10) }));
            break;
          case '-':
            e.preventDefault();
            setEditorState(prev => ({ ...prev, zoom: Math.max(50, prev.zoom - 10) }));
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close color pickers when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setToolbarState(prev => ({ 
          ...prev, 
          showColorPicker: false, 
          showHighlightPicker: false 
        }));
      }
      setContextMenu({ visible: false, x: 0, y: 0 });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Editor Component
  const Editor = () => (
    <Card className="border shadow-sm">
      <CardContent className="p-0">
        <div 
          className="min-h-[800px] bg-white overflow-auto"
          style={{ transform: `scale(${editorState.zoom / 100})`, transformOrigin: 'top left' }}
        >
          {/* Enhanced Ruler */}
          <div className="h-8 bg-gray-50 border-b flex items-center px-4 sticky top-0 z-10">
            <div className="flex-1 relative h-full">
              {/* Centimeter marks */}
              {Array.from({ length: 21 }, (_, i) => (
                <div key={i} className="absolute flex flex-col items-center" style={{ left: `${i * 37.8}px` }}>
                  <div className={`border-l ${i % 5 === 0 ? 'border-gray-600 h-4' : 'border-gray-400 h-2'}`} />
                  {i % 5 === 0 && (
                    <span className="text-xs text-gray-600 mt-1">{i}</span>
                  )}
                </div>
              ))}
              {/* Tab stops */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-30" />
            </div>
          </div>

          {/* Document Content with realistic page layout */}
          <div className="bg-gray-100 p-4">
            <div 
              ref={editorRef}
              contentEditable={!editorState.isPreviewMode}
              className={cn(
                "bg-white shadow-lg mx-auto",
                "w-[21cm] min-h-[29.7cm]", // A4 size
                "p-[2.5cm]", // Realistic margins
                "outline-none font-serif text-base leading-relaxed",
                "prose prose-lg max-w-none",
                "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:text-center",
                "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-4",
                "[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-justify",
                "[&_table]:border-collapse [&_table]:w-full [&_table]:mb-4",
                "[&_td]:border [&_td]:border-gray-300 [&_td]:p-2",
                "[&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-50",
                "[&_ol]:mb-4 [&_ol]:pl-6",
                "[&_ul]:mb-4 [&_ul]:pl-6",
                "[&_li]:mb-2",
                editorState.isPreviewMode && "cursor-default"
              )}
              onContextMenu={handleContextMenu}
              onInput={() => {
                updateWordCount();
                updateCursorPosition();
              }}
              onKeyUp={() => {
                updateWordCount();
                updateCursorPosition();
              }}
              onClick={updateCursorPosition}
              onFocus={updateCursorPosition}
              suppressContentEditableWarning={true}
              style={{
                fontFamily: toolbarState.selectedFont,
                fontSize: `${toolbarState.selectedFontSize}px`,
                lineHeight: toolbarState.selectedLineHeight
              }}
            >
            {/* Enhanced Editable Header */}
             <div className="mb-8">
               <div className="text-center mb-6">
                 <h1 
                   contentEditable={!editorState.isPreviewMode}
                   className="text-3xl font-bold mb-3 uppercase tracking-wide outline-none focus:bg-blue-50 px-2 py-1 rounded"
                   onBlur={(e) => setExamData(prev => ({ ...prev, title: e.target.textContent || '' }))}
                   suppressContentEditableWarning={true}
                 >
                   {examData.title}
                 </h1>
                 <div className="w-32 h-0.5 bg-gray-800 mx-auto mb-4"></div>
                 <p 
                   contentEditable={!editorState.isPreviewMode}
                   className="text-gray-700 mb-6 italic text-lg outline-none focus:bg-blue-50 px-2 py-1 rounded"
                   onBlur={(e) => setExamData(prev => ({ ...prev, instructions: e.target.textContent || '' }))}
                   suppressContentEditableWarning={true}
                 >
                   {examData.instructions}
                 </p>
               </div>
               
               <div className="flex justify-between items-start mb-6 text-sm border-b border-gray-300 pb-4">
                 <div className="space-y-1">
                   <p>
                     <strong>Nome:</strong> 
                     <span 
                       contentEditable={!editorState.isPreviewMode}
                       className="ml-2 outline-none focus:bg-blue-50 px-1 rounded"
                       onBlur={(e) => setExamData(prev => ({ 
                         ...prev, 
                         studentInfo: { ...prev.studentInfo, name: e.target.textContent || '' }
                       }))}
                       suppressContentEditableWarning={true}
                     >
                       {examData.studentInfo.name}
                     </span>
                   </p>
                   <p>
                     <strong>Turma:</strong> 
                     <span 
                       contentEditable={!editorState.isPreviewMode}
                       className="ml-2 outline-none focus:bg-blue-50 px-1 rounded"
                       onBlur={(e) => setExamData(prev => ({ 
                         ...prev, 
                         studentInfo: { ...prev.studentInfo, class: e.target.textContent || '' }
                       }))}
                       suppressContentEditableWarning={true}
                     >
                       {examData.studentInfo.class}
                     </span>
                   </p>
                 </div>
                 <div className="space-y-1 text-right">
                   <p>
                     <strong>Data:</strong> 
                     <span 
                       contentEditable={!editorState.isPreviewMode}
                       className="ml-2 outline-none focus:bg-blue-50 px-1 rounded"
                       onBlur={(e) => setExamData(prev => ({ 
                         ...prev, 
                         studentInfo: { ...prev.studentInfo, date: e.target.textContent || '' }
                       }))}
                       suppressContentEditableWarning={true}
                     >
                       {examData.studentInfo.date}
                     </span>
                   </p>
                   <p>
                     <strong>Duração:</strong> 
                     <span 
                       contentEditable={!editorState.isPreviewMode}
                       className="ml-2 outline-none focus:bg-blue-50 px-1 rounded"
                       onBlur={(e) => setExamData(prev => ({ 
                         ...prev, 
                         studentInfo: { ...prev.studentInfo, duration: e.target.textContent || '' }
                       }))}
                       suppressContentEditableWarning={true}
                     >
                       {examData.studentInfo.duration}
                     </span>
                   </p>
                 </div>
               </div>
             </div>

            {/* Enhanced Questions with automatic numbering */}
            <div className="space-y-8">
              {examData.questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className={`question-block break-inside-avoid cursor-move transition-all duration-200 ${
                    dragState.draggedIndex === index ? 'opacity-50 scale-95' : ''
                  } ${
                    dragState.dragOverIndex === index ? 'border-2 border-blue-400 bg-blue-50' : ''
                  }`}
                  draggable={!editorState.isPreviewMode}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {question.type === 'multipleChoice' && (
                     <div className="mb-6 group hover:bg-gray-50 p-3 rounded-lg transition-colors relative">
                       {!editorState.isPreviewMode && (
                         <div className="absolute -left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-1 h-8 bg-gray-300 rounded cursor-move" title="Arrastar para reordenar"></div>
                         </div>
                       )}
                       <div className="flex items-start gap-3 mb-4">
                         <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                           {index + 1}
                         </span>
                         <p 
                           contentEditable={!editorState.isPreviewMode}
                           className="font-semibold text-gray-900 leading-relaxed outline-none focus:bg-blue-50 px-2 py-1 rounded flex-1"
                           onBlur={(e) => {
                             const newQuestions = [...examData.questions];
                             newQuestions[index] = { ...newQuestions[index], question: e.target.textContent || '' };
                             setExamData(prev => ({ ...prev, questions: newQuestions }));
                           }}
                           suppressContentEditableWarning={true}
                         >
                           {question.question}
                         </p>
                         {!editorState.isPreviewMode && (
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-6 w-6 p-0"
                               onClick={() => {
                                 const newQuestions = [...examData.questions];
                                 newQuestions[index] = { 
                                   ...newQuestions[index], 
                                   options: [...(newQuestions[index].options || []), 'Nova opção']
                                 };
                                 setExamData(prev => ({ ...prev, questions: newQuestions }));
                               }}
                               title="Adicionar opção"
                             >
                               <Plus className="h-3 w-3" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-6 w-6 p-0 text-red-600"
                               onClick={() => {
                                 const newQuestions = examData.questions.filter((_, i) => i !== index);
                                 setExamData(prev => ({ ...prev, questions: newQuestions }));
                               }}
                               title="Remover questão"
                             >
                               <Trash2 className="h-3 w-3" />
                             </Button>
                           </div>
                         )}
                       </div>
                       <div className="ml-11 space-y-3">
                         {question.options?.map((option, optIndex) => (
                           <div key={optIndex} className="flex items-start gap-3 group/option">
                             <span className="flex-shrink-0 w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                               {String.fromCharCode(97 + optIndex)}
                             </span>
                             <p 
                               contentEditable={!editorState.isPreviewMode}
                               className="leading-relaxed flex-1 outline-none focus:bg-blue-50 px-2 py-1 rounded"
                               onBlur={(e) => {
                                 const newQuestions = [...examData.questions];
                                 const newOptions = [...(newQuestions[index].options || [])];
                                 newOptions[optIndex] = e.target.textContent || '';
                                 newQuestions[index] = { ...newQuestions[index], options: newOptions };
                                 setExamData(prev => ({ ...prev, questions: newQuestions }));
                               }}
                               suppressContentEditableWarning={true}
                             >
                               {option}
                             </p>
                             {!editorState.isPreviewMode && (
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-5 w-5 p-0 opacity-0 group-hover/option:opacity-100 transition-opacity text-red-600"
                                 onClick={() => {
                                   const newQuestions = [...examData.questions];
                                   const newOptions = (newQuestions[index].options || []).filter((_, i) => i !== optIndex);
                                   newQuestions[index] = { ...newQuestions[index], options: newOptions };
                                   setExamData(prev => ({ ...prev, questions: newQuestions }));
                                 }}
                                 title="Remover opção"
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             )}
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                  
                  {question.type === 'trueFalse' && (
                     <div className="mb-6 group hover:bg-gray-50 p-3 rounded-lg transition-colors relative">
                       {!editorState.isPreviewMode && (
                         <div className="absolute -left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-1 h-8 bg-gray-300 rounded cursor-move" title="Arrastar para reordenar"></div>
                         </div>
                       )}
                       <div className="flex items-start gap-3 mb-4">
                         <span className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-800">
                           {index + 1}
                         </span>
                         <p 
                           contentEditable={!editorState.isPreviewMode}
                           className="font-semibold text-gray-900 leading-relaxed outline-none focus:bg-blue-50 px-2 py-1 rounded flex-1"
                           onBlur={(e) => {
                             const newQuestions = [...examData.questions];
                             newQuestions[index] = { ...newQuestions[index], question: e.target.textContent || '' };
                             setExamData(prev => ({ ...prev, questions: newQuestions }));
                           }}
                           suppressContentEditableWarning={true}
                         >
                           {question.question}
                         </p>
                         {!editorState.isPreviewMode && (
                           <Button
                             variant="ghost"
                             size="sm"
                             className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                             onClick={() => {
                               const newQuestions = examData.questions.filter((_, i) => i !== index);
                               setExamData(prev => ({ ...prev, questions: newQuestions }));
                             }}
                             title="Remover questão"
                           >
                             <Trash2 className="h-3 w-3" />
                           </Button>
                         )}
                       </div>
                       <div className="ml-11 space-y-3">
                         <div className="flex items-center gap-3">
                           <div className="w-5 h-5 border-2 border-gray-400 rounded hover:border-green-500 transition-colors cursor-pointer"></div>
                           <span className="font-medium">Verdadeiro</span>
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="w-5 h-5 border-2 border-gray-400 rounded hover:border-red-500 transition-colors cursor-pointer"></div>
                           <span className="font-medium">Falso</span>
                         </div>
                       </div>
                     </div>
                   )}
                  
                  {question.type === 'fillBlanks' && (
                     <div className="mb-6 group hover:bg-gray-50 p-3 rounded-lg transition-colors relative">
                       {!editorState.isPreviewMode && (
                         <div className="absolute -left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-1 h-8 bg-gray-300 rounded cursor-move" title="Arrastar para reordenar"></div>
                         </div>
                       )}
                       <div className="flex items-start gap-3 mb-4">
                         <span className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-sm font-bold text-yellow-800">
                           {index + 1}
                         </span>
                         <p 
                           contentEditable={!editorState.isPreviewMode}
                           className="font-semibold text-gray-900 leading-relaxed outline-none focus:bg-blue-50 px-2 py-1 rounded flex-1"
                           onBlur={(e) => {
                             const newQuestions = [...examData.questions];
                             newQuestions[index] = { ...newQuestions[index], question: e.target.textContent || '' };
                             setExamData(prev => ({ ...prev, questions: newQuestions }));
                           }}
                           suppressContentEditableWarning={true}
                         >
                           {question.question}
                         </p>
                         {!editorState.isPreviewMode && (
                           <Button
                             variant="ghost"
                             size="sm"
                             className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                             onClick={() => {
                               const newQuestions = examData.questions.filter((_, i) => i !== index);
                               setExamData(prev => ({ ...prev, questions: newQuestions }));
                             }}
                             title="Remover questão"
                           >
                             <Trash2 className="h-3 w-3" />
                           </Button>
                         )}
                       </div>
                       <div className="ml-11 space-y-3">
                         <div className="border-b-2 border-gray-400 border-dotted h-8 w-full max-w-md hover:border-blue-500 transition-colors"></div>
                         <div className="text-xs text-gray-500 italic">Espaço para resposta</div>
                       </div>
                     </div>
                   )}
                  
                  {question.type === 'openQuestions' && (
                     <div className="mb-6 group hover:bg-gray-50 p-3 rounded-lg transition-colors relative">
                       {!editorState.isPreviewMode && (
                         <div className="absolute -left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-1 h-8 bg-gray-300 rounded cursor-move" title="Arrastar para reordenar"></div>
                         </div>
                       )}
                       <div className="flex items-start gap-3 mb-4">
                         <span className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-800">
                           {index + 1}
                         </span>
                         <p 
                           contentEditable={!editorState.isPreviewMode}
                           className="font-semibold text-gray-900 leading-relaxed outline-none focus:bg-blue-50 px-2 py-1 rounded flex-1"
                           onBlur={(e) => {
                             const newQuestions = [...examData.questions];
                             newQuestions[index] = { ...newQuestions[index], question: e.target.textContent || '' };
                             setExamData(prev => ({ ...prev, questions: newQuestions }));
                           }}
                           suppressContentEditableWarning={true}
                         >
                           {question.question}
                         </p>
                         {!editorState.isPreviewMode && (
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-6 w-6 p-0"
                               onClick={() => {
                                 const newQuestions = [...examData.questions];
                                 const currentLines = newQuestions[index].metadata?.answerLines || 5;
                                 newQuestions[index] = { 
                                   ...newQuestions[index], 
                                   metadata: { ...newQuestions[index].metadata, answerLines: currentLines + 1 }
                                 };
                                 setExamData(prev => ({ ...prev, questions: newQuestions }));
                               }}
                               title="Adicionar linha"
                             >
                               <Plus className="h-3 w-3" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-6 w-6 p-0 text-red-600"
                               onClick={() => {
                                 const newQuestions = examData.questions.filter((_, i) => i !== index);
                                 setExamData(prev => ({ ...prev, questions: newQuestions }));
                               }}
                               title="Remover questão"
                             >
                               <Trash2 className="h-3 w-3" />
                             </Button>
                           </div>
                         )}
                       </div>
                       <div className="ml-11 space-y-4">
                         {Array.from({ length: question.metadata?.answerLines || 5 }, (_, lineIndex) => (
                           <div key={lineIndex} className="border-b border-gray-300 h-6 w-full hover:border-purple-400 transition-colors"></div>
                         ))}
                         <div className="text-xs text-gray-500 italic">
                           {question.metadata?.answerLines || 5} linhas para resposta
                         </div>
                       </div>
                     </div>
                   )}
                </div>
              ))}
            </div>
          </div>

            {/* Page break indicator */}
            <div className="page-break mt-16 mb-8 border-t-2 border-dashed border-gray-300 pt-8">
              <div className="text-center text-xs text-gray-400 mb-4">
                --- Quebra de Página ---
              </div>
            </div>
            
            {/* Page break indicator */}
            {editorState.pageCount > 1 && (
              <div className="mt-8 border-t-2 border-dashed border-gray-400 pt-4 text-center text-xs text-gray-500">
                <span className="bg-white px-2">--- Quebra de Página ---</span>
              </div>
            )}
            
            {/* Enhanced Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Página {editorState.pageCount} de {editorState.pageCount}</span>
                  <span>•</span>
                  <span>{editorState.wordCount} palavras</span>
                  <span>•</span>
                  <span>Linha: {editorState.cursorPosition}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span>Zoom: {editorState.zoom}%</span>
                  <span>Salvo automaticamente: {lastSaved.toLocaleTimeString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Question management functions
  const addNewQuestion = (type: 'multipleChoice' | 'trueFalse' | 'fillInTheBlanks' | 'openQuestion' = 'multipleChoice') => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: 'Nova questão',
      options: type === 'multipleChoice' ? ['Opção A', 'Opção B', 'Opção C', 'Opção D'] : undefined,
      correctAnswer: type === 'multipleChoice' ? 0 : type === 'trueFalse' ? true : undefined,
      points: 1
    };
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = examData.questions.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const duplicatedQuestion: Question = {
        ...questionToDuplicate,
        id: Date.now().toString(),
        question: questionToDuplicate.question + ' (Cópia)'
      };
      setExamData(prev => ({
        ...prev,
        questions: [...prev.questions, duplicatedQuestion]
      }));
    }
  };

  const removeQuestion = (questionId: string) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragState({ isDragging: true, draggedIndex: index, dragOverIndex: null });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState(prev => ({ ...prev, dragOverIndex: index }));
  };

  const handleDragLeave = () => {
    setDragState(prev => ({ ...prev, dragOverIndex: null }));
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const { draggedIndex } = dragState;
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newQuestions = [...examData.questions];
      const draggedQuestion = newQuestions[draggedIndex];
      
      // Remove the dragged question
      newQuestions.splice(draggedIndex, 1);
      
      // Insert at new position
      const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newQuestions.splice(insertIndex, 0, draggedQuestion);
      
      setExamData(prev => ({ ...prev, questions: newQuestions }));
    }
    
    setDragState({ isDragging: false, draggedIndex: null, dragOverIndex: null });
  };

  const handleDragEnd = () => {
    setDragState({ isDragging: false, draggedIndex: null, dragOverIndex: null });
  };

  // Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  // Context Menu Component
  const ContextMenu = () => (
    contextMenu.visible && (
      <div
        className="fixed bg-white border shadow-lg rounded-md py-2 z-50 min-w-48"
        style={{ left: contextMenu.x, top: contextMenu.y }}
      >
        <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b">
          Adicionar Questão
        </div>
        <button 
          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
          onClick={() => { addNewQuestion('multipleChoice'); setContextMenu({ visible: false, x: 0, y: 0 }); }}
        >
          <Plus className="h-4 w-4" />
          Múltipla Escolha
        </button>
        <button 
          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
          onClick={() => { addNewQuestion('trueFalse'); setContextMenu({ visible: false, x: 0, y: 0 }); }}
        >
          <Plus className="h-4 w-4" />
          Verdadeiro/Falso
        </button>
        <button 
          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
          onClick={() => { addNewQuestion('fillInTheBlanks'); setContextMenu({ visible: false, x: 0, y: 0 }); }}
        >
          <Plus className="h-4 w-4" />
          Preencher Lacunas
        </button>
        <button 
          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
          onClick={() => { addNewQuestion('openQuestion'); setContextMenu({ visible: false, x: 0, y: 0 }); }}
        >
          <Plus className="h-4 w-4" />
          Questão Aberta
        </button>
        
        <div className="border-t my-1"></div>
        
        <button 
          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
          onClick={() => { 
            if (examData.questions.length > 0) {
              duplicateQuestion(examData.questions[examData.questions.length - 1].id);
            }
            setContextMenu({ visible: false, x: 0, y: 0 }); 
          }}
        >
          <Copy className="h-4 w-4" />
          Duplicar Última Questão
        </button>
        
        {examData.questions.length > 0 && (
          <button 
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
            onClick={() => { 
              removeQuestion(examData.questions[examData.questions.length - 1].id);
              setContextMenu({ visible: false, x: 0, y: 0 }); 
            }}
          >
            <Trash2 className="h-4 w-4" />
            Remover Última Questão
          </button>
        )}
      </div>
    )
  );

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0 });
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor de Prova</h1>
            <p className="text-gray-600">Editor completo tipo Word para criar e editar provas</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <Toolbar />

        {/* Editor */}
        <div className="relative">
          <Editor />
          <ContextMenu />
        </div>
      </div>
    </Layout>
  );
}