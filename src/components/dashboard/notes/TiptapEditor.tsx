
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  autofocus?: boolean;
}

export const TiptapEditor = ({ content, onChange, autofocus = false }: TiptapEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true, // Make links clickable
        HTMLAttributes: {
          class: 'text-[#14A090] underline',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-full px-4 py-2 editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    autofocus: autofocus ? 'end' : false,
  });

  useEffect(() => {
    setIsMounted(true);
    
    // Add css to document head to ensure proper styling
    const style = document.createElement('style');
    style.innerHTML = `
      .editor-content {
        color: var(--foreground);
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 400;
        line-height: 1.2;
      }
      
      .editor-content h1 {
        font-family: 'Inter', sans-serif;
        font-size: 24px;
        font-weight: 700;
        line-height: 1.2;
        margin-top: 24px;
        margin-bottom: 10px;
        color: var(--foreground);
      }
      
      .editor-content h2 {
        font-family: 'Inter', sans-serif;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
        margin-top: 20px;
        margin-bottom: 10px;
        color: var(--foreground);
      }
      
      .editor-content h3 {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
        margin-top: 14px;
        margin-bottom: 10px;
        color: var(--foreground);
      }
      
      .editor-content p {
        margin-top: 0;
        margin-bottom: 10px;
        line-height: 1.2;
      }
      
      .editor-content ul {
        list-style-type: disc;
        padding-left: 1.5rem;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .editor-content ol {
        list-style-type: decimal;
        padding-left: 1.5rem;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .editor-content li {
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;
      }
      
      .dark .editor-content * {
        color: #FFFFFF !important;
      }
      
      .editor-content * {
        color: #0A1915 !important;
      }
      
      .editor-content a {
        color: #14A090 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle link adding
  const addLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    // cancelled
    if (url === null) return;
    
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="border rounded-md border-[#7A9992] dark:border-[#CCCCCC] overflow-hidden">
      <div className="flex bg-background p-2 border-b border-[#7A9992] dark:border-[#CCCCCC]">
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`h-8 w-8 ${editor?.isActive('bold') ? 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#14A090]' : 'text-[#7A9992] dark:text-[#CCCCCC]'}`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`h-8 w-8 ${editor?.isActive('italic') ? 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#14A090]' : 'text-[#7A9992] dark:text-[#CCCCCC]'}`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`h-8 w-8 ${editor?.isActive('underline') ? 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#14A090]' : 'text-[#7A9992] dark:text-[#CCCCCC]'}`}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          <span className="mx-1 text-[#7A9992] dark:text-[#CCCCCC]">|</span>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-8 w-8 ${editor?.isActive('heading', { level: 1 }) ? 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#14A090]' : 'text-[#7A9992] dark:text-[#CCCCCC]'}`}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-8 w-8 ${editor?.isActive('heading', { level: 2 }) ? 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#14A090]' : 'text-[#7A9992] dark:text-[#CCCCCC]'}`}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-8 w-8 ${editor?.isActive('heading', { level: 3 }) ? 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#14A090]' : 'text-[#7A9992] dark:text-[#CCCCCC]'}`}
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <span className="mx-1 text-[#7A9992] dark:text-[#CCCCCC]">|</span>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 ${editor?.isActive('bulletList') ? 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#14A090]' : 'text-[#7A9992] dark:text-[#CCCCCC]'}`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 ${editor?.isActive('orderedList') ? 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#14A090]' : 'text-[#7A9992] dark:text-[#CCCCCC]'}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <span className="mx-1 text-[#7A9992] dark:text-[#CCCCCC]">|</span>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={addLink}
            className={`h-8 w-8 ${editor?.isActive('link') ? 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#14A090]' : 'text-[#7A9992] dark:text-[#CCCCCC]'}`}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="h-[calc(100%-40px)] overflow-auto">
        <EditorContent editor={editor} className="h-full min-h-[300px]" />
      </div>
    </div>
  );
};
