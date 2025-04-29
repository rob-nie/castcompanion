
import React from 'react';
import { useInterviewNotes } from '@/hooks/useInterviewNotes';

interface InterviewNotesTabProps {
  projectId: string;
}

export const InterviewNotesTab: React.FC<InterviewNotesTabProps> = ({ projectId }) => {
  const { interviewNotes, isLoading } = useInterviewNotes(projectId);

  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-[#7A9992] dark:text-[#CCCCCC]">Interview-Notes werden bald verfügbar sein...</p>
    </div>
  );
};
