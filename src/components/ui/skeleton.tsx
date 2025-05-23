
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#DAE5E2] dark:bg-[#5E6664]", className)}
      {...props}
    />
  )
}

export { Skeleton }
