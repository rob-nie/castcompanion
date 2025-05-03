export function Footer() {
  return (
    <footer className="w-full px-6 xl:px-24 py-5">
      <div className="mx-auto max-w-[1288px] flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <div className="metadata text-[10px] order-1 md:order-none">
          © CastCompanion by Robert Niemeyer
        </div>
        
        <div className="metadata text-[10px] flex items-center order-3 md:order-none">
          <span className="mr-2">V 0.1</span>
          <span className="border border-current rounded-full px-2 py-0.5 text-[10px] bg-transparent">BETA</span>
        </div>
        
        <div className="flex gap-4 metadata text-[10px] order-2 md:order-none">
          <a href="#" className="hover:text-primary">Impressum</a>
          <a href="#" className="hover:text-primary">Systemstatus</a>
        </div>
      </div>
    </footer>
  );
}