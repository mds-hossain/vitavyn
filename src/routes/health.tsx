import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ChartLine, ClipboardList, History } from "lucide-react";
import { PageHeader, Panel } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "My Health — Vitavyn" },
      {
        name: "description",
        content: "Conditions, measurements, symptoms and your complete health timeline in one hub.",
      },
      { property: "og:title", content: "My Health — Vitavyn" },
      {
        property: "og:description",
        content: "Conditions, measurements, symptoms and timeline in one place.",
      },
    ],
  }),
  component: HealthHub,
});

function HealthHub() {
  const { data } = useVitavyn();

  const sections = [
    {
      to: "/conditions" as const,
      title: "Conditions",
      icon: Activity,
      detail: `${data.conditions.length} tracked`,
    },
    {
      to: "/measurements" as const,
      title: "Measurements",
      icon: ChartLine,
      detail: `${data.measurements.length} recorded`,
    },
    {
      to: "/symptoms" as const,
      title: "Symptoms",
      icon: ClipboardList,
      detail: `${data.symptoms.length} recorded`,
    },
    {
      to: "/timeline" as const,
      title: "Timeline",
      icon: History,
      detail: "Everything, in order",
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Health"
        description="One structured picture of the whole person — not a single disease."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.to} to={section.to} className="group">
            <Panel className="h-full transition-colors group-hover:border-primary">
              <section.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-display text-lg font-semibold">{section.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{section.detail}</p>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
