
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
      className="flex items-center gap-2 cursor-pointer"
      onClick={handleLogoClick}
    >
      <svg 
        className="w-8 h-8 text-cast-sea-green dark:text-white" 
        viewBox="0 0 180.08 161.93"
        aria-hidden="true"
      >
        <g>
          <path 
            className="stroke-current stroke-[12px] fill-none stroke-round" 
            d="M165.96,107.82c5.84-9.6,9.12-20.45,9.12-31.95,0-39.14-38.07-70.87-85.04-70.87S5,36.73,5,75.87c0,15.22,5.75,29.31,15.55,40.85,2.13,2.52,3.15,5.79,2.84,9.08l-1.85,19.42c-.78,8.16,7.55,14.12,15.02,10.75l23.35-10.51s.11-.05.16-.07c2.59-1.23,5.49-1.59,8.29-.98,6.92,1.52,14.18,2.33,21.68,2.33,16.39,0,31.7-3.86,44.68-10.56"
          />
        </g>
        <g>
          <path 
            className="stroke-current stroke-[12px] fill-none stroke-round" 
            d="M5.54,77.37h26.04c1.93,0,3.72,1.79,4.76,4.74l4.04,11.46c2.46,6.97,8.18,6.1,9.97-1.52l12.8-54.41c2.07-8.79,9-8.2,10.6.91l13.7,77.64c1.61,9.11,8.53,9.71,10.6.91l12.8-54.41c1.79-7.62,7.51-8.49,9.97-1.52l4.04,11.46c1.04,2.96,2.84,4.74,4.76,4.74h19.88"
          />
        </g>
      </svg>
      <div className="font-inter text-xl md:text-2xl text-[#0A1915] dark:text-white">
        <span className="font-bold">Cast</span>
        <span className="font-extralight">Companion</span>
      </div>
    </div>
  );
}
