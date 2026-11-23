import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login } from "@/lib/auth";

import { toast } from "sonner";

type LoginFormProps = {
  onLogin: () => void;
};

export function LoginForm({
  onLogin,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    try {
      setLoading(true);
      await login(email, password);
      onLogin();
      toast.success("Login realizado com sucesso!");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={submit}
      aria-busy={loading}
    >
      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="login-email">
          Email
        </Label>

        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="voce@email.com"
          autoComplete="email"
          maxLength={120}
          required
        />
      </div>

      {/* SENHA */}
      <div className="space-y-2">
        <Label htmlFor="login-password">
          Senha
        </Label>

        <div className="relative">
          <Input
            id="login-password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="••••••••"
            autoComplete="current-password"
            maxLength={64}
            className="pr-11"
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current,
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            aria-label={
              showPassword
                ? "Ocultar senha"
                : "Mostrar senha"
            }
            title={
              showPassword
                ? "Ocultar senha"
                : "Mostrar senha"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {/* ENTRAR */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading
          ? "Entrando..."
          : "Entrar"}
      </Button>
    </form>
  );
}