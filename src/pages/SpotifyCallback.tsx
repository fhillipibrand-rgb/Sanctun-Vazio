import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const expiresIn = params.get("expires_in");

      if (accessToken) {
        localStorage.setItem("spotify_access_token", accessToken);
        localStorage.setItem("spotify_token_expiry", (Date.now() + Number(expiresIn) * 1000).toString());
        
        // Redireciona de volta para a página de Foco
        navigate("/focus");
      }
    }
  }, [navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-surface space-y-4">
      <div className="w-12 h-12 border-4 border-[#1DB954]/20 border-t-[#1DB954] rounded-full animate-spin" />
      <p className="editorial-label opacity-60">Sincronizando com Spotify...</p>
    </div>
  );
};

export default SpotifyCallback;
