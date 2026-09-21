import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { useState } from "react";

import {
  ArrowLeft,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

import type { Student } from "@/lib/clinic-store";

export const Route = createFileRoute("/paciente")({
  component: PatientAccessPage,
});

function PatientAccessPage() {
  const navigate = useNavigate();

  const [mode, setMode] =
    useState<"login" | "signup">("login");

  const handleLogin = (_student: Student) => {
    navigate({
      to: "/dashboard",
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-50">
      {/* TOPO */}
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/acesso",
              })
            }
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="Logo Timely"
              className="h-12 w-12 object-contain"
            />

            <div className="text-left">
              <p className="text-xl font-bold text-slate-900">
                TIMELY
              </p>

              <p className="text-xs text-slate-500">
                Gestão e Autoatendimento
              </p>
            </div>
          </button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({
                to: "/acesso",
              })
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2">
        {/* LADO ESQUERDO */}
        <section>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <UserRound className="h-4 w-4" />
            Acesso do Paciente
          </div>

          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">
            Sua rotina de cuidados,
            <span className="text-primary">
              {" "}
              mais simples.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            Acesse sua agenda, acompanhe seus atendimentos,
            consulte seu histórico e gerencie seus planos,
            pacotes e sessões em um só lugar.
          </p>

          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <p>
              ✓ Consulte seus próximos atendimentos
            </p>

            <p>
              ✓ Agende e cancele horários
            </p>

            <p>
              ✓ Acompanhe seus planos e sessões
            </p>

            <p>
              ✓ Veja seu histórico e notificações
            </p>
          </div>
        </section>

        {/* LOGIN / CADASTRO */}
        <section className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md p-8 shadow-xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-950">
                {mode === "login"
                  ? "Bem-vindo de volta"
                  : "Crie sua conta"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {mode === "login"
                  ? "Entre para acessar sua área de paciente."
                  : "Cadastre-se para começar a usar o Timely."}
              </p>
            </div>

            {/* ABAS */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() =>
                  setMode("login")
                }
                className={`rounded-md py-2 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Entrar
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode("signup")
                }
                className={`rounded-md py-2 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Cadastrar
              </button>
            </div>

            {mode === "login" ? (
              <LoginForm
                onLogin={handleLogin}
              />
            ) : (
              <RegisterForm
                onLogin={handleLogin}
              />
            )}

            <p className="mt-6 text-center text-xs text-slate-500">
              Ao continuar, você concorda com os termos de uso
              e política de privacidade do Timely.
            </p>
          </Card>
        </section>
      </main>
    </div>
  );
}