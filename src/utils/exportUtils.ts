
import { LiveNote } from "@/hooks/useLiveNotes";
import { formatTime } from "@/components/dashboard/watch/utils";

export const exportLiveNotesAsCSV = (notes: LiveNote[]): void => {
  if (notes.length === 0) {
    return;
  }

  // Format the notes data as CSV
  let csvContent = 'Timestamp,Time,Note\n';
  
  notes.forEach(note => {
    const formattedTime = formatTime(note.time_marker);
    // Escape quotes in the content to prevent CSV issues
    // Using replace with global flag instead of replaceAll for better compatibility
    const escapedContent = note.content.replace(/"/g, '""');
    csvContent += `"${new Date(note.created_at).toLocaleString()}","${formattedTime}","${escapedContent}"\n`;
  });

  // Create a download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `live-notes-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
