import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Search, Type, Heading1, Heading2, RemoveFormatting, CheckSquare } from 'lucide-react'

// Utility para barras de menus
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const btnClass = (isActive: boolean) => 
    `p-2 rounded-lg transition-colors border ${isActive ? 'bg-primary/20 text-primary border-primary/30' : 'bg-on-surface/[0.03] text-on-surface/60 border-[var(--glass-border)] hover:bg-on-surface/10 hover:text-on-surface'}`

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-surface/50 border-b border-[var(--glass-border)] sticky top-0 z-10 rounded-t-2xl">
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title="Negrito"
      >
        <Bold size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title="Itálico"
      >
        <Italic size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
        title="Riscado"
      >
        <Strikethrough size={16} />
      </button>

      <div className="w-px h-6 bg-[var(--glass-border)] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive('heading', { level: 1 }))}
        title="Título 1"
      >
        <Heading1 size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        title="Título 2"
      >
        <Heading2 size={16} />
      </button>

      <div className="w-px h-6 bg-[var(--glass-border)] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title="Lista (Bullets)"
      >
        <List size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title="Lista Numérica"
      >
        <ListOrdered size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        title="Citação"
      >
        <Quote size={16} />
      </button>

      <div className="w-px h-6 bg-[var(--glass-border)] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={btnClass(editor.isActive('taskList'))}
        title="Checklist / Subtarefas"
      >
        <CheckSquare size={16} />
      </button>

      <div className="w-px h-6 bg-[var(--glass-border)] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className={btnClass(false)}
        title="Limpar Formatação"
      >
        <RemoveFormatting size={16} />
      </button>

    </div>
  )
}

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ content, onChange, placeholder, className = '' }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[150px] p-4 text-on-surface max-w-full custom-tiptap-content',
      },
    },
  })

  // Synchronize external prop with internal state (e.g. initial load)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
       // Only set content if it's completely different to avoid cursor jumping
       if (!editor.isFocused) {
          editor.commands.setContent(content || '');
       }
    }
  }, [content, editor])

  return (
    <div className={`border border-[var(--glass-border)] rounded-2xl bg-on-surface/[0.03] focus-within:border-primary/50 focus-within:bg-on-surface/[0.05] transition-all overflow-hidden flex flex-col ${className}`}>
      <MenuBar editor={editor} />
      <div className="flex-1 cursor-text custom-tiptap-content">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}

export default RichTextEditor
