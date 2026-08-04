import { X } from "lucide-react";

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
  if (bookings.length === 0) {
    return null;
  }

  return (
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
              onClick={() => onCancel(booking)}
              aria-label="Cancelar aula"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}