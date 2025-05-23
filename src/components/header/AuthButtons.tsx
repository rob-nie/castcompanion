
import { useNavigate } from "react-router-dom";

export function AuthButtons({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();
  
  if (isMobile) return null;
  
  return (
    <>
      <button 
        onClick={() => navigate("/auth")} 
        className="btn-secondary hidden sm:block"
      >
        Anmelden
      </button>
      <button 
        onClick={() => navigate("/auth/register")}
        className="btn-primary"
      >
        Registrieren
      </button>
    </>
  );
}
