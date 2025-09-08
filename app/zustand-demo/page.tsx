import { DatabaseDashboard } from "@/components/database-dashboard";

export default function ZustandDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Zustand + React Query + Supabase
        </h1>
        <p className="text-muted-foreground">
          Demonstração completa: Estado global (Zustand) + Cache inteligente
          (React Query) + Banco de dados (Supabase)
        </p>
      </div>

      <DatabaseDashboard />
    </div>
  );
}
