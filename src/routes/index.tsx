import { createFileRoute } from "@tanstack/react-router";
import { Desk } from "@/components/treasury/desk";
import { refreshCurve } from "@/lib/curve.functions";

export const Route = createFileRoute("/")({
  loader: () => refreshCurve().catch(() => null),
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  return <Desk initial={initial} />;
}
