import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Auth page removed — redirect to home
const Auth = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);
  return null;
};

export default Auth;

