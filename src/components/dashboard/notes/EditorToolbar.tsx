
import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, Save 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScreenWidth } from '@/hooks/useScreenWidth';

interface EditorToolbarProps {
  editor: Editor | null;
  addLink: () => void;
  isSaving?: boolean; 
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  editor, 
  addLink, 
  isSaving = false, 
  hasUnsavedChanges = false, 
  onSave 
}) => {
  const screenWidth = useScreenWidth();
  const isTwoRows = screenWidth < 930;
  
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap bg-background p-2 border-b border-[#7A9992] dark:border-[#CCCCCC]">
      {/* First row - always visible */}
      <div className="flex items-center space-x-1 mb-1 sm:mb-0">
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
        
        {!isTwoRows && <span className="mx-1 text-[#7A9992] dark:text-[#CCCCCC]">|</span>}
      </div>

      {/* Second row - always starts with List button */}
      <div className={`flex items-center space-x-1 ${isTwoRows ? 'w-full' : 'ml-2'}`}>
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

        {onSave && (
          <>
            <span className="mx-1 text-[#7A9992] dark:text-[#CCCCCC]">|</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="h-8 w-8 text-[#7A9992] dark:text-[#CCCCCC]"
            >
              <Save className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
