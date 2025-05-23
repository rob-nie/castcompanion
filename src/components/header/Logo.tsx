
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

export function Logo() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (user) {
      navigate("/projects");
    } else {
      navigate("/");
    }
  };

  return (
    <div 
      className="font-inter font-bold text-xl md:text-2xl cursor-pointer text-[#0A1915] dark:text-white"
      onClick={handleLogoClick}
    >
      <span className="font-bold">Cast</span>
      <span className="font-extralight">Companion</span>
    </div>
  );
}
