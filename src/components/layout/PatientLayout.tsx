import { ReactNode, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/layout/Sidebar";

type PatientLayoutProps = {
  children: ReactNode;
  onLogout: () => void;
  onNavigate: (
    section:
      | "inicio"
      | "agenda"
      | "aulas"
      | "historico"
      | "perfil"
      | "notificacoes",
  ) => void;
};

export function PatientLayout({
  children,
  onLogout,
  onNavigate,
}: PatientLayoutProps) {
  const mobile = useIsMobile();
  const [collapsedPreference, setCollapsedPreference] = useState<boolean | null>(null);
  const sidebarCollapsed = collapsedPreference ?? mobile;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setCollapsedPreference((current) => !(current ?? mobile))
        }
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}