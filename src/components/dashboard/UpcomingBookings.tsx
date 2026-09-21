import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Booking } from "@/lib/clinic-store";

type UpcomingBookingsProps = {
  bookings: Booking[];
  onCancel: (booking: Booking) => void;
};

export function UpcomingBookings({
  bookings,
  onCancel,
}: UpcomingBookingsProps) {
  const [bookingToCancel, setBookingToCancel] =
    useState<Booking | null>(null);

  if (bookings.length === 0) {
    return null;
  }

  const handleConfirmCancel = () => {
    if (!bookingToCancel) {
      return;
    }

    onCancel(bookingToCancel);
    setBookingToCancel(null);
  };

  return (
    <>
      <Card className="mb-6 p-4">
        <h2 className="mb-3 font-semibold">
          Minhas próximas aulas
        </h2>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-lg border bg-secondary/40 p-3"
            >
              <div className="text-sm">
                <div className="font-medium">
                  {new Date(
                    `${booking.date}T00:00:00`,
                  ).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}

                  {" • "}

                  {booking.time}
                </div>

                <div className="text-xs text-muted-foreground">
                  Instrutor(a) {booking.instructor}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setBookingToCancel(booking)
                }
                aria-label="Cancelar aula"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Cancelar aula?
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Tem certeza de que deseja cancelar
                  esta aula?
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-xl border bg-muted/40 p-4">
              <p className="font-medium">
                {new Date(
                  `${bookingToCancel.date}T00:00:00`,
                ).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {bookingToCancel.time}
                {" • "}
                Instrutor(a){" "}
                {bookingToCancel.instructor}
              </p>
            </div>

            <p className="mb-6 text-xs text-muted-foreground">
              Lembre-se: cancelamentos realizados com
              pelo menos 6 horas de antecedência
              devolvem a sessão ao seu pacote.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setBookingToCancel(null)
                }
              >
                Voltar
              </Button>

              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
              >
                Confirmar cancelamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}