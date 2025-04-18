
export function Footer() {
  return (
    <footer className="flex flex-col md:flex-row justify-between items-center py-5 px-6 md:px-12 lg:px-24 gap-4 md:gap-0 mt-auto">
      <div className="metadata order-1 md:order-none">
        © CastCompanion by Robert Niemeyer
      </div>
      
      <div className="metadata flex items-center order-3 md:order-none">
        <span className="mr-2">V 0.1</span>
        <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs">BETA</span>
      </div>
      
      <div className="flex gap-4 metadata order-2 md:order-none">
        <a href="#" className="hover:text-primary">Impressum</a>
        <a href="#" className="hover:text-primary">Systemstatus</a>
      </div>
    </footer>
  );
}
