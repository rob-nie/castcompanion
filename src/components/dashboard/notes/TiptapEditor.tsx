
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useState, useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { injectEditorStyles } from './editorStyles';
import { handleAddLink } from './editorUtils';

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
    
    // Inject editor styles and get cleanup function
    const cleanup = injectEditorStyles();
    
    // Clean up styles on unmount
    return () => {
      cleanup();
    };
  }, []);

  // Handle link adding using the utility function
  const addLink = () => handleAddLink(editor);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="border rounded-md border-[#7A9992] dark:border-[#CCCCCC] overflow-hidden">
      <EditorToolbar editor={editor} addLink={addLink} />
      
      <div className="h-[calc(100%-40px)] overflow-auto">
        <EditorContent editor={editor} className="h-full min-h-[300px]" />
      </div>
    </div>
  );
};
