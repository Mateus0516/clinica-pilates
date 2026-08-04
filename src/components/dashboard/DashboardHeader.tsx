import { Bell, Coins, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Student } from "@/lib/clinic-store";

type DashboardHeaderProps = {
  student: Student;
  onLogout: () => void;
};

export function DashboardHeader({
  student,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <img
          src="/logo.png"
          alt="Logo do Studio Pilates"
          className="h-16 w-16 shrink-0 object-contain"
        />

        <div>
          <p className="text-sm font-semibold text-primary">
            Studio Pilates
          </p>

          <h1 className="mt-1 text-2xl font-bold md:text-3xl">
            Olá, {student.name}!
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />

          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 shadow-sm">
          <Coins className="h-5 w-5 text-accent-foreground" />

          <span className="font-semibold text-accent-foreground">
            {student.credits} créditos
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}