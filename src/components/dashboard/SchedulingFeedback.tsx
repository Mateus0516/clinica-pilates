import { Button } from "@/components/ui/button";
import { schedulingError } from "@/lib/scheduling";

export function SchedulingFeedback({
  query,
}: {
  query: { isPending: boolean; error: unknown; refetch: () => Promise<unknown> };
}) {
  if (query.error) {
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 py-3 text-sm text-destructive">
        {schedulingError(query.error)}
        <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return query.isPending ? (
    <p role="status" className="py-3 text-sm text-muted-foreground">
      Carregando dados…
    </p>
  ) : null;
}
