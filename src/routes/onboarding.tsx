import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VitavynLogo } from "@/components/vitavyn/Logo";
import { Panel } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Vitavyn" },
      {
        name: "description",
        content: "Set up Vitavyn in five short steps: your name, what you track, units, storage and you're done.",
      },
      { property: "og:title", content: "Get started — Vitavyn" },
      { property: "og:description", content: "A calm five-step setup, no medical jargon." },
    ],
  }),
  component: OnboardingPage,
});

const CONDITION_SUGGESTIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "Asthma",
  "Thyroid",
  "High cholesterol",
  "Anxiety",
  "Arthritis",
  "Migraine",
];

function OnboardingPage() {
  const { data, add, setProfile, setPreferences } = useVitavyn();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(data.profile.name);
  const [picked, setPicked] = useState<string[]>([]);
  const [glucoseUnit, setGlucoseUnit] = useState(data.preferences.glucoseUnit);
  const [tier, setTier] = useState(data.preferences.storageTier);

  const steps = ["Welcome", "About you", "What you track", "Units", "Storage"];

  const finish = () => {
    setProfile({ name: name.trim() || "Friend", onboarded: true });
    setPreferences({ glucoseUnit, storageTier: tier });
    picked
      .filter((p) => !data.conditions.some((c) => c.name === p))
      .forEach((p) =>
        add("conditions", { name: p, status: "active", trackedMetrics: [] } as never),
      );
    toast.success("You're all set");
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex justify-center">
        <VitavynLogo />
      </div>

      <div className="flex justify-center gap-2">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`h-1.5 w-10 rounded-full transition-colors ${
              index <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <Panel>
        {step === 0 ? (
          <div className="space-y-3 text-center">
            <h1 className="font-display text-2xl font-semibold">Your health, in one calm place</h1>
            <p className="text-sm text-muted-foreground">
              Vitavyn keeps measurements, medications, appointments and documents together — on your device by
              default. No ads, no data selling, no diagnosis.
            </p>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3">
            <h1 className="font-display text-xl font-semibold">What should we call you?</h1>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shuvoraj Noman" />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <h1 className="font-display text-xl font-semibold">Anything you'd like to track?</h1>
            <p className="text-sm text-muted-foreground">
              Pick as many or as few as you like — you can add your own later, and skipping is fine.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {CONDITION_SUGGESTIONS.map((condition) => {
                const active = picked.includes(condition);
                return (
                  <button
                    key={condition}
                    onClick={() =>
                      setPicked((prev) =>
                        active ? prev.filter((c) => c !== condition) : [...prev, condition],
                      )
                    }
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {active ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}
                    {condition}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <h1 className="font-display text-xl font-semibold">Which units do you use?</h1>
            <div className="flex gap-2 pt-2">
              {(["mg/dL", "mmol/L"] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setGlucoseUnit(unit)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    glucoseUnit === unit ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">You can change this any time in Settings.</p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <h1 className="font-display text-xl font-semibold">Where should your data live?</h1>
            <div className="space-y-2 pt-2">
              {(
                [
                  ["local", "On this device only — free forever"],
                  ["sync", "Encrypted cloud backup and multi-device — paid"],
                  ["vault", "Backup plus document storage and sharing — paid"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTier(id)}
                  className={`w-full rounded-xl border p-4 text-left text-sm transition-colors ${
                    tier === id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <span className="font-medium capitalize">Vitavyn {id}</span>
                  <span className="block text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))}>
            {step === 0 ? "Skip" : "Back"}
          </Button>
          <Button onClick={() => (step === steps.length - 1 ? finish() : setStep(step + 1))}>
            {step === steps.length - 1 ? "Finish setup" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Panel>
    </div>
  );
}
