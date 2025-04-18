
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="w-full px-6 md:px-12 lg:px-24 py-5">
      <div className="mx-auto max-w-[1288px] flex justify-between items-center">
        <div className="font-inter font-bold text-xl md:text-2xl">
          <span className="font-bold">Cast</span>Companion
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <a href="#" className="btn-secondary hidden sm:block">Anmelden</a>
          <a href="#" className="btn-primary">Registrieren</a>
        </div>
      </div>
    </header>
  );
}
