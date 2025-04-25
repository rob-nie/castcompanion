
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
}

export const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2">Anmeldung</h1>
        <h2 className="text-xl">Melde dich an, um auf deine Projekte zuzugreifen</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2 text-left">
            <label htmlFor="email" className="block text-sm font-medium">E-Mail</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
            />
          </div>
          
          <div className="space-y-2 text-left">
            <label htmlFor="password" className="block text-sm font-medium">Passwort</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? "Laden..." : "Anmelden"}
        </button>

        <div className="text-center text-sm">
          <span className="text-secondary">Noch kein Konto? </span>
          <Link to="/auth/register" className="text-primary hover:underline">
            Registrieren
          </Link>
        </div>
      </form>
    </div>
  );
};
