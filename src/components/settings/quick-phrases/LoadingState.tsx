
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingState = () => {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, index) => (
        <Skeleton key={index} className="h-[40px] w-full" />
      ))}
    </div>
  );
};
