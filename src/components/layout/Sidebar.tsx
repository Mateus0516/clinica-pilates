import { useState } from "react";

import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  LogOut,
  User,
} from "lucide-react";

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onNavigate: (section: SidebarSection) => void;
};

const menuItems: {
  label: string;
  section: SidebarSection;
  icon: typeof Home;
}[] = [
  {
    label: "Início",
    section: "inicio",
    icon: Home,
  },
  {
    label: "Agenda",
    section: "agenda",
    icon: CalendarDays,
  },
  {
    label: "Minhas aulas",
    section: "aulas",
    icon: CalendarDays,
  },
  {
    label: "Histórico",
    section: "historico",
    icon: Clock3,
  },
  {
    label: "Perfil",
    section: "perfil",
    icon: User,
  },
  {
    label: "Notificações",
    section: "notificacoes",
    icon: Bell,
  },
];

export function Sidebar({
  collapsed,
  onToggle,
  onLogout,
  onNavigate,
}: SidebarProps) {
  const [activeSection, setActiveSection] =
    useState<SidebarSection>("inicio");

  const handleNavigation = (section: SidebarSection) => {
    setActiveSection(section);
    onNavigate(section);
  };

  return (
    <aside
      className={
        "sticky top-3 m-3 flex h-[calc(100vh-24px)] shrink-0 flex-col self-start rounded-xl border border-border bg-background shadow-sm transition-all duration-300 " +
        (collapsed ? "w-[76px]" : "w-[220px]")
      }
    >
      {/* Logo */}
      <div
        className={
          "flex h-20 items-center border-b border-border " +
          (collapsed ? "justify-center px-2" : "px-4")
        }
      >
        {collapsed ? (
          <img
            src="/logo.png"
            alt="Studio Pilates"
            className="h-9 w-9 object-contain"
          />
        ) : (
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Studio Pilates"
              className="h-10 w-10 object-contain"
            />

            <div>
              <p className="text-sm font-bold text-primary">
                Studio Pilates
              </p>

              <p className="text-xs text-muted-foreground">
                Autoatendimento
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botão recolher / expandir */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          collapsed ? "Expandir menu" : "Recolher menu"
        }
        title={
          collapsed ? "Expandir menu" : "Recolher menu"
        }
        className="
          absolute
          -right-3
          top-[62px]
          z-20
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-background
          text-muted-foreground
          shadow-sm
          transition-all
          hover:border-primary/40
          hover:bg-primary
          hover:text-primary-foreground
          hover:shadow-md
        "
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Navegação */}
      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.section;

          return (
            <button
              key={item.section}
              type="button"
              onClick={() =>
                handleNavigation(item.section)
              }
              className={
                "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors " +
                (collapsed
                  ? "justify-center"
                  : "gap-3") +
                " " +
                (active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground")
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />

              {!collapsed && (
                <span>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sair */}
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onLogout}
          className={
            "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive " +
            (collapsed
              ? "justify-center"
              : "gap-3")
          }
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />

          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}