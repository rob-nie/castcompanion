
import { QuickPhraseItem } from "./QuickPhraseItem";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface QuickPhrase {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  order: number | null;
  user_id?: string;
}

interface QuickPhraseListProps {
  phrases: QuickPhrase[];
  editId: string | null;
  editContent: string;
  isDragging: boolean;
  onEditContentChange: (content: string) => void;
  onStartEditing: (id: string, content: string) => void;
  onSaveEdit: () => void;
  onCancelEditing: () => void;
  onDelete: (id: string) => void;
  onDragStart: () => void;
  onDragEnd: (result: any) => void;
}

export const QuickPhraseList = ({
  phrases,
  editId,
  editContent,
  isDragging,
  onEditContentChange,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  onDelete,
  onDragStart,
  onDragEnd,
}: QuickPhraseListProps) => {
  if (phrases.length === 0) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <Droppable droppableId="quick-phrases">
        {(provided) => (
          <div
            className="space-y-2"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {phrases.map((phrase, index) => (
              <Draggable
                key={phrase.id}
                draggableId={phrase.id}
                index={index}
                isDragDisabled={!!editId}
              >
                {(provided, snapshot) => (
                  <QuickPhraseItem
                    id={phrase.id}
                    content={phrase.content}
                    editId={editId}
                    editContent={editContent}
                    isDragging={isDragging}
                    provided={provided}
                    snapshot={snapshot}
                    onStartEditing={onStartEditing}
                    onSaveEdit={onSaveEdit}
                    onCancelEditing={onCancelEditing}
                    onDelete={onDelete}
                    onEditContentChange={onEditContentChange}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
