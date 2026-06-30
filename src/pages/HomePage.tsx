import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";

function HomePage() {
  const auth = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    auth?.logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-3 grid grid-cols-3 items-center">
        <span className="font-semibold text-base">Engeman</span>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 text-center select-none">
          AcheImovel
        </h1>
        <div className="flex items-center gap-3 justify-end">
          <span className="text-sm text-muted-foreground">
            {auth?.user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Olá, {auth?.user?.username || auth?.user?.email}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo ao painel principal.
          </p>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
