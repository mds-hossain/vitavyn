import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, SafetyNote } from "@/components/vitavyn/primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  a1cToAverageGlucose,
  glucoseToMgdl,
  glucoseToMmol,
  kgToLb,
  lbToKg,
  cToF,
  fToC,
} from "@/lib/vitavyn/units";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Health tools — Vitavyn" },
      {
        name: "description",
        content: "Unit converters for glucose, weight and temperature, plus BMI and estimated average glucose.",
      },
      { property: "og:title", content: "Health tools — Vitavyn" },
      { property: "og:description", content: "Converters and calculators that respect your preferred units." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const [glucose, setGlucose] = useState("120");
  const [weight, setWeight] = useState("72");
  const [temp, setTemp] = useState("37");
  const [a1c, setA1c] = useState("6.8");
  const [height, setHeight] = useState("175");

  const bmi = Number(weight) > 0 && Number(height) > 0
    ? (Number(weight) / (Number(height) / 100) ** 2).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <PageHeader title="Health tools" description="Small calculators that save you a search." />

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Glucose converter">
          <div className="space-y-1.5">
            <Label>mg/dL</Label>
            <Input inputMode="decimal" value={glucose} onChange={(e) => setGlucose(e.target.value)} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            = <span className="metric-value text-base text-foreground">{glucoseToMmol(Number(glucose) || 0)}</span> mmol/L
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Reverse: 7.0 mmol/L = {glucoseToMgdl(7)} mg/dL
          </p>
        </Panel>

        <Panel title="HbA1c → estimated average glucose">
          <div className="space-y-1.5">
            <Label>HbA1c (%)</Label>
            <Input inputMode="decimal" value={a1c} onChange={(e) => setA1c(e.target.value)} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            ≈ <span className="metric-value text-base text-foreground">{a1cToAverageGlucose(Number(a1c) || 0)}</span> mg/dL average
          </p>
        </Panel>

        <Panel title="Weight converter">
          <div className="space-y-1.5">
            <Label>Kilograms</Label>
            <Input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            = <span className="metric-value text-base text-foreground">{kgToLb(Number(weight) || 0)}</span> lb
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Reverse: 160 lb = {lbToKg(160)} kg</p>
        </Panel>

        <Panel title="Temperature converter">
          <div className="space-y-1.5">
            <Label>Celsius</Label>
            <Input inputMode="decimal" value={temp} onChange={(e) => setTemp(e.target.value)} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            = <span className="metric-value text-base text-foreground">{cToF(Number(temp) || 0)}</span> °F
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Reverse: 100 °F = {fToC(100)} °C</p>
        </Panel>

        <Panel title="BMI">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Height (cm)</Label>
              <Input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            BMI <span className="metric-value text-base text-foreground">{bmi}</span>
          </p>
        </Panel>
      </div>

      <SafetyNote>
        Converters are for convenience only. Use the units your clinician uses when discussing results.
      </SafetyNote>
    </div>
  );
}
