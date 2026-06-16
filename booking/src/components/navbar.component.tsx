import { useNavigate } from "react-router";
import "./navbar.css";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button
        onClick={() => {
          navigate(-1);
        }}
      >
        Back
      </button>
    </div>
  );
}
