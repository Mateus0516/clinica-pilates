import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { useEffect, useState } from "react";

import {
  Student,
  getSession,
  setSession,
} from "@/lib/clinic-store";

import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

import { Toaster } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  const [student, setStudent] =
    useState<Student | null>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentStudent = getSession();

    if (!currentStudent) {
      navigate({
        to: "/paciente",
        replace: true,
      });

      return;
    }

    setStudent(currentStudent);
    setReady(true);
  }, [navigate]);

  if (!ready || !student) {
    return null;
  }

  const handleLogout = () => {
    setSession(null);
    setStudent(null);

    navigate({
      to: "/acesso",
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        richColors
        position="top-center"
      />

      <StudentDashboard
        student={student}
        onLogout={handleLogout}
        onUpdate={setStudent}
      />
    </div>
  );
}