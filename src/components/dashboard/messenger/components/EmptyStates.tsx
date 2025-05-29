
interface LoadingProps {}
interface ErrorProps {
  error: Error | string;
}
interface NoMessagesProps {}

export const EmptyStates = {
  Loading: ({}: LoadingProps) => (
    <div className="flex items-center justify-center h-full">
      <p className="text-[#7A9992] dark:text-[#CCCCCC]">Nachrichten werden geladen...</p>
    </div>
  ),

  Error: ({ error }: ErrorProps) => (
    <div className="flex items-center justify-center h-full">
      <p className="text-red-500">
        Fehler: {error instanceof Error ? error.message : error}
      </p>
    </div>
  ),

  NoMessages: ({}: NoMessagesProps) => (
    <div className="flex items-center justify-center h-full">
      <p className="text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Nachrichten vorhanden.</p>
    </div>
  )
};
