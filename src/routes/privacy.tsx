import { createFileRoute } from "@tanstack/react-router";
import { Cloud, Lock, Server, Smartphone } from "lucide-react";
import { PageHeader, Panel } from "@/components/vitavyn/primitives";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Vitavyn" },
      {
        name: "description",
        content: "How Vitavyn stores your health data: local-first by default, encrypted sync only if you choose it.",
      },
      { property: "og:title", content: "Privacy — Vitavyn" },
      { property: "og:description", content: "Local-first by default. Your data is not the product." },
    ],
  }),
  component: PrivacyPage,
});

const POINTS = [
  {
    icon: Smartphone,
    title: "Local-first by default",
    body: "On the free Local plan every measurement, medication and document stays in this browser. Nothing is uploaded.",
  },
  {
    icon: Lock,
    title: "Encrypted before it leaves",
    body: "On Sync and Vault plans, records are encrypted on your device before they are sent for backup.",
  },
  {
    icon: Cloud,
    title: "Sync is optional, always",
    body: "You can use Vitavyn forever without an account. Turning sync off keeps the local copy intact.",
  },
  {
    icon: Server,
    title: "No advertising, no data sale",
    body: "Vitavyn is funded by paid plans. Health data is never sold, shared or used to target you.",
  },
];

function PrivacyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Privacy"
        description="Health data is the most sensitive data there is. Vitavyn is built around that."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {POINTS.map((point) => (
          <Panel key={point.title}>
            <point.icon className="h-6 w-6 text-primary" />
            <h2 className="mt-4 font-display text-lg font-semibold">{point.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{point.body}</p>
          </Panel>
        ))}
      </div>
      <Panel title="Your rights">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Export everything you have recorded as JSON at any time from Settings.</li>
          <li>Delete all local data permanently with one action, with confirmation.</li>
          <li>Vitavyn does not diagnose, treat or replace professional medical care.</li>
        </ul>
      </Panel>
    </div>
  );
}
