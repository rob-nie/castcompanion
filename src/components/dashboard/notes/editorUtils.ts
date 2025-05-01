
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

/**
 * Handles adding or updating a link in the editor
 */
export const handleAddLink = (editor: Editor | null) => {
  if (!editor) return;
  
  const previousUrl = editor.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);
  
  // Cancelled by user
  if (url === null) return;
  
  // Empty URL (remove link)
  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  
  // Add or update link
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

/**
 * Creates the editor configuration
 */
export const getEditorConfig = (content: string, onChange: (html: string) => void, autofocus: boolean) => {
  return {
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4 text-[#0A1915] dark:text-[#FFFFFF]',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4 text-[#0A1915] dark:text-[#FFFFFF]',
          },
        },
      }),
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
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML());
    },
    autofocus: autofocus ? 'end' : false,
  };
};
