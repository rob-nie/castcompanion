
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="flex justify-between items-center py-5 px-6 md:px-12 lg:px-24">
      <div className="font-inter font-bold text-xl md:text-2xl">
        <span className="font-bold">Cast</span>Companion
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        <a href="#" className="btn-secondary hidden sm:block">Anmelden</a>
        <a href="#" className="btn-primary">Registrieren</a>
      </div>
    </header>
  );
}
