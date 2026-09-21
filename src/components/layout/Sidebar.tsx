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

import { useLocation } from "@tanstack/react-router";

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
  const location = useLocation();

  const getActiveSection = (): SidebarSection => {
    const pathname = location.pathname;

    if (pathname === "/agenda") {
      return "agenda";
    }

    if (pathname === "/aulas") {
      return "aulas";
    }

    if (pathname === "/historico") {
      return "historico";
    }

    if (pathname === "/perfil") {
      return "perfil";
    }

    if (pathname === "/notificacoes") {
      return "notificacoes";
    }

    return "inicio";
  };

  const activeSection = getActiveSection();

  return (
    <aside
      className={
        "sticky top-3 m-3 flex h-[calc(100vh-24px)] shrink-0 flex-col self-start rounded-xl border border-border bg-background shadow-sm transition-all duration-300 " +
        (collapsed
          ? "w-[76px]"
          : "w-[220px]")
      }
    >
      {/* LOGO */}
      <div
        className={
          "flex h-20 shrink-0 items-center border-b border-border " +
          (collapsed
            ? "justify-center px-2"
            : "px-4")
        }
      >
        {collapsed ? (
          <img
            src="/logo.png"
            alt="Timely"
            className="h-9 w-9 object-contain"
          />
        ) : (
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Timely"
              className="h-10 w-10 object-contain"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary">
                Timely
              </p>

              <p className="truncate text-xs text-muted-foreground">
                Autoatendimento
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BOTÃO RECOLHER / EXPANDIR */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          collapsed
            ? "Expandir menu"
            : "Recolher menu"
        }
        title={
          collapsed
            ? "Expandir menu"
            : "Recolher menu"
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

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active =
            activeSection === item.section;

          return (
            <button
              key={item.section}
              type="button"
              onClick={() =>
                onNavigate(item.section)
              }
              title={
                collapsed
                  ? item.label
                  : undefined
              }
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              className={
                "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all " +
                (collapsed
                  ? "justify-center"
                  : "gap-3") +
                " " +
                (active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground")
              }
            >
              <Icon className="h-5 w-5 shrink-0" />

              {!collapsed && (
                <span className="truncate">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* SAIR */}
      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={onLogout}
          title={
            collapsed
              ? "Sair"
              : undefined
          }
          className={
            "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive " +
            (collapsed
              ? "justify-center"
              : "gap-3")
          }
        >
          <LogOut className="h-5 w-5 shrink-0" />

          {!collapsed && (
            <span>Sair</span>
          )}
        </button>
      </div>
    </aside>
  );
}