
import { useState, type FormEvent } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  type Student,
  setSession,
} from "@/lib/clinic-store";

import { toast } from "sonner";

type RegisterFormProps = {
  onLogin: (student: Student) => void;
};

type RegisterResponse = {
  id?: number | string;
  nome?: string;
  email?: string;
  sessionsRemaining?: number;
  erro?: string;
  message?: string;
};

const API_URL = "http://localhost:8080";

function getTodayISO(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.replace(/\D/g, "");

    if (normalizedName.length < 3) {
      toast.error("Informe seu nome completo.");
      return;
    }

    if (!birthDate) {
      toast.error("Informe sua data de nascimento.");
      return;
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(birthDate)) {
      toast.error("Data de nascimento inválida.");
      return;
    }

    const [year, month, day] = birthDate
      .split("-")
      .map(Number);

    const parsedDate = new Date(
      year,
      month - 1,
      day
    );

    const validDate =
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day;

    if (
      !validDate ||
      birthDate < "1900-01-01" ||
      birthDate > getTodayISO()
    ) {
      toast.error("Informe uma data de nascimento válida.");
      return;
    }

    if (normalizedPhone.length < 10 ||
        normalizedPhone.length > 11) {
      toast.error("Informe um telefone válido.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: normalizedName,
            email: normalizedEmail,
            senha: password,
            telefone: normalizedPhone,
            dataNascimento: birthDate,
          }),
        }
      );

      const responseText = await response.text();

      let data: RegisterResponse = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          // O backend pode retornar texto em caso de erro.
        }
      }

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            "Este e-mail já está cadastrado."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "Acesso bloqueado pelo servidor. Verifique o CORS."
          );
        }

        throw new Error(
          data.erro ||
          data.message ||
          `Não foi possível criar a conta. Erro ${response.status}.`
        );
      }

      if (data.id == null) {
        toast.success(
          "Conta criada! Faça login para continuar."
        );

        return;
      }

      const studentData: Student = {
        id: String(data.id),
        name: data.nome || normalizedName,
        email: data.email || normalizedEmail,

        // Valor temporário até integrar os planos.
        sessionsRemaining:
          data.sessionsRemaining ?? 8,

        // Nunca armazenar a senha real.
        password: "",
      };

      setSession(studentData);
      toast.success("Conta criada com sucesso!");
      onLogin(studentData);

    } catch (error) {
      console.error("Erro ao cadastrar:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao conectar com o servidor."
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
      {/* NOME COMPLETO */}
      <div className="space-y-2">
        <Label htmlFor="register-name">
          Nome completo
        </Label>

        <Input
          id="register-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
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

        <input
          id="register-birth-date"
          name="dataNascimento"
          type="date"
          value={birthDate}
          onChange={(event) =>
            setBirthDate(event.currentTarget.value)
          }
          min="1900-01-01"
          max={getTodayISO()}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            setPhone(event.target.value)
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
        <Label htmlFor="register-password">
          Senha
        </Label>

        <div className="relative">
          <Input
            id="register-password"
            type={
              showPassword ? "text" : "password"
            }
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
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
              setShowPassword((current) => !current)
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
              setConfirmPassword(event.target.value)
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
                (current) => !current
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

      {/* BOTÃO CRIAR CONTA */}
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
