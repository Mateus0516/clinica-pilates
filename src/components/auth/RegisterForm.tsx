import { useState } from "react";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Student,
  setSession,
} from "@/lib/clinic-store";

import { toast } from "sonner";

type RegisterFormProps = {
  onLogin: (student: Student) => void;
};

export function RegisterForm({
  onLogin,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] = useState(false);

  const submit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (name.trim().length < 3) {
      toast.error(
        "Informe seu nome completo.",
      );

      return;
    }

    if (!birthDate) {
      toast.error(
        "Informe sua data de nascimento.",
      );

      return;
    }

    if (phone.trim().length < 10) {
      toast.error(
        "Informe um telefone válido.",
      );

      return;
    }

    if (password.length < 6) {
      toast.error(
        "A senha precisa ter pelo menos 6 caracteres.",
      );

      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        "As senhas não coincidem.",
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            nome: name.trim(),
            email: email.trim(),
            senha: password,
            telefone: phone.trim(),
            dataNascimento: birthDate,
          }),
        },
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        throw new Error(
          errorData.erro ||
            "Não foi possível criar a conta.",
        );
      }

      const data =
        await response.json();

      const studentData: Student = {
        id: String(data.id),

        name:
          data.nome ||
          name.trim(),

        email:
          data.email ||
          email.trim(),

        /*
         * Valor temporário enquanto
         * planos e pacotes ainda não
         * estão integrados ao backend.
         *
         * Depois esse valor virá
         * diretamente da API.
         */
        sessionsRemaining:
          data.sessionsRemaining ?? 8,

        /*
         * A senha real não é armazenada
         * no frontend após o cadastro.
         */
        password: "",
      };

      setSession(
        studentData,
      );

      onLogin(
        studentData,
      );

      toast.success(
        "Conta criada com sucesso!",
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
      {/* NOME */}
      <div className="space-y-2">
        <Label htmlFor="register-name">
          Nome completo
        </Label>

        <Input
          id="register-name"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value,
            )
          }
          placeholder="Seu nome completo"
          autoComplete="name"
          maxLength={80}
          required
        />
      </div>

      {/* DATA DE NASCIMENTO */}
      <div className="space-y-2">
        <Label htmlFor="register-birth-date">
          Data de nascimento
        </Label>

        <Input
          id="register-birth-date"
          type="date"
          value={birthDate}
          onChange={(event) =>
            setBirthDate(
              event.target.value,
            )
          }
          required
        />
      </div>

      {/* TELEFONE */}
      <div className="space-y-2">
        <Label htmlFor="register-phone">
          Telefone
        </Label>

        <Input
          id="register-phone"
          type="tel"
          value={phone}
          onChange={(event) =>
            setPhone(
              event.target.value,
            )
          }
          placeholder="(61) 99999-9999"
          autoComplete="tel"
          maxLength={20}
          required
        />
      </div>

      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="register-email">
          Email
        </Label>

        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value,
            )
          }
          placeholder="voce@email.com"
          autoComplete="email"
          maxLength={120}
          required
        />
      </div>

      {/* SENHA */}
      <div className="space-y-2">
        <Label htmlFor="register-password">
          Senha
        </Label>

        <div className="relative">
          <Input
            id="register-password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value,
              )
            }
            placeholder="Mínimo de 6 caracteres"
            autoComplete="new-password"
            minLength={6}
            maxLength={64}
            className="pr-11"
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) =>
                  !current,
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            aria-label={
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

        <p className="text-xs text-muted-foreground">
          Use pelo menos 6 caracteres.
        </p>
      </div>

      {/* CONFIRMAR SENHA */}
      <div className="space-y-2">
        <Label htmlFor="register-confirm-password">
          Confirmar senha
        </Label>

        <div className="relative">
          <Input
            id="register-confirm-password"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value,
              )
            }
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            minLength={6}
            maxLength={64}
            className="pr-11"
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (current) =>
                  !current,
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            aria-label={
              showConfirmPassword
                ? "Ocultar confirmação de senha"
                : "Mostrar confirmação de senha"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* BOTÃO */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading
          ? "Criando conta..."
          : "Criar conta"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Seu plano ou pacote será associado à sua conta.
      </p>
    </form>
  );
}