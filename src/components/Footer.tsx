
import { useIsMobile } from "@/hooks/use-mobile";

export function Footer() {
  const isMobile = useIsMobile();
  
  return (
    <footer className="w-full px-6 xl:px-24 py-5 bg-background">
      <div className="mx-auto max-w-[1288px] flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        {/* On mobile, only show the links in the middle */}
        {!isMobile && (
          <div className="metadata text-[10px] order-1 md:order-none">
            © CastCompanion by Robert Niemeyer
          </div>
        )}
        
        {/* Centered links - shown on both mobile and desktop */}
        <div className="flex gap-4 metadata text-[10px] order-2 md:order-none">
          <a href="#" className="hover:text-primary">Impressum</a>
          <a href="#" className="hover:text-primary">Systemstatus</a>
        </div>
        
        {/* On mobile, hide the version/beta indicator */}
        {!isMobile && (
          <div className="metadata text-[10px] flex items-center order-3 md:order-none">
            <span className="mr-2">V 0.1</span>
            <span className="border border-current rounded-full px-2 py-0.5 text-[10px] bg-transparent">BETA</span>
          </div>
        )}
      </div>
    </footer>
  );
}
