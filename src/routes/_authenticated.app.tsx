import { createFileRoute } from "@tanstack/react-router";
import MarvosApp from "@/components/MarvosApp";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "MarvOS · Dashboard" },
      { name: "description", content: "Marvos business operating system — POS, inventory, customers, and reports." },
    ],
  }),
  component: () => <MarvosApp />,
});