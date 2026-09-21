import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Student,
  setSession,
} from "@/lib/clinic-store";

import { toast } from "sonner";

type LoginFormProps = {
  onLogin: (student: Student) => void;
};

export function LoginForm({
  onLogin,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const submit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            senha: password,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.erro ||
            "Email ou senha inválidos.",
        );
      }

      const data = await response.json();

      const studentData: Student = {
        id: String(data.id),

        name:
          data.nome &&
          !String(data.nome).includes("@")
            ? data.nome
            : email.split("@")[0],

        email:
          data.email || email,

        /*
         * Valor temporário.
         *
         * Quando o backend de planos
         * e pacotes estiver pronto,
         * sessionsRemaining virá
         * diretamente da API.
         */
        sessionsRemaining:
          data.sessionsRemaining ?? 8,

        /*
         * Mantido temporariamente
         * porque o tipo Student atual
         * ainda possui password.
         *
         * A senha real nunca é salva
         * aqui após o login.
         */
        password: "",
      };

      setSession(studentData);
      onLogin(studentData);

      toast.success(
        "Login realizado com sucesso!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao conectar com o servidor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={submit}
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