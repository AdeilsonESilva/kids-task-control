import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
          <p className="text-muted-foreground">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
