import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Plans — Vitavyn" },
      {
        name: "description",
        content: "Vitavyn Local is free forever. Sync and Vault add encrypted cloud backup, multi-device and sharing.",
      },
      { property: "og:title", content: "Plans — Vitavyn" },
      { property: "og:description", content: "Free local-first plan, optional paid cloud tiers." },
    ],
  }),
  component: PlansPage,
});

const PLANS = [
  {
    id: "local" as const,
    name: "Vitavyn Local",
    price: "Free",
    cadence: "forever",
    features: [
      "All tracking modules",
      "Unlimited conditions and measurements",
      "Timeline, insights and doctor report",
      "Data stays on this device",
    ],
  },
  {
    id: "sync" as const,
    name: "Vitavyn Sync",
    price: "$4",
    cadence: "per month",
    features: [
      "Everything in Local",
      "Encrypted cloud backup",
      "Multi-device sync",
      "Restore after losing a device",
    ],
  },
  {
    id: "vault" as const,
    name: "Vitavyn Vault",
    price: "$9",
    cadence: "per month",
    features: [
      "Everything in Sync",
      "Unlimited document storage",
      "Share a read-only record with family or a doctor",
      "Priority support",
    ],
  },
];

function PlansPage() {
  const { data, setPreferences } = useVitavyn();
  const current = data.preferences.storageTier;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        description="Start free and local. Upgrade only if you want your record backed up or shared."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Panel key={plan.id} className={plan.id === current ? "border-primary" : undefined}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">{plan.name}</h2>
              {plan.id === current ? <StatusPill tone="brand">Current</StatusPill> : null}
            </div>
            <p className="mt-3">
              <span className="metric-value text-3xl">{plan.price}</span>{" "}
              <span className="text-sm text-muted-foreground">{plan.cadence}</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              variant={plan.id === current ? "outline" : "default"}
              disabled={plan.id === current}
              onClick={() => {
                setPreferences({ storageTier: plan.id });
                toast.success(
                  plan.id === "local"
                    ? "Switched to local-only storage"
                    : `${plan.name} selected — billing is not connected in this demo`,
                );
              }}
            >
              {plan.id === current ? "Your plan" : `Choose ${plan.name}`}
            </Button>
          </Panel>
        ))}
      </div>
    </div>
  );
}
