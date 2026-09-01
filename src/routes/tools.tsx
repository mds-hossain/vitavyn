import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { PageHeader, Panel, SafetyNote } from "@/components/vitavyn/primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  glucoseToMgdl,
  glucoseToMmol,
  kgToLb,
  lbToKg,
  cToF,
  fToC,
  round,
} from "@/lib/vitavyn/units";

const a1cToAverageGlucose = (percent: number) => round(28.7 * percent - 46.7, 0);
const averageGlucoseToA1c = (mgdl: number) => round((mgdl + 46.7) / 28.7, 1);

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Health tools — Vitavyn" },
      {
        name: "description",
        content:
          "Two-way unit converters for glucose, weight and temperature, plus BMI and estimated average glucose.",
      },
      { property: "og:title", content: "Health tools — Vitavyn" },
      {
        property: "og:description",
        content: "Convert in either direction — type in whichever unit you have.",
      },
    ],
  }),
  component: ToolsPage,
});

/** A converter where either side can be typed into; the other side follows. */
function TwoWay({
  title,
  leftLabel,
  rightLabel,
  initialLeft,
  toRight,
  toLeft,
  leftDigits = 1,
  rightDigits = 1,
  note,
}: {
  title: string;
  leftLabel: string;
  rightLabel: string;
  initialLeft: string;
  toRight: (n: number) => number;
  toLeft: (n: number) => number;
  leftDigits?: number;
  rightDigits?: number;
  note?: string;
}) {
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(String(round(toRight(Number(initialLeft)), rightDigits)));

  const onLeft = (v: string) => {
    setLeft(v);
    setRight(v === "" || Number.isNaN(Number(v)) ? "" : String(round(toRight(Number(v)), rightDigits)));
  };
  const onRight = (v: string) => {
    setRight(v);
    setLeft(v === "" || Number.isNaN(Number(v)) ? "" : String(round(toLeft(Number(v)), leftDigits)));
  };

  return (
    <Panel title={title}>
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label>{leftLabel}</Label>
          <Input
            inputMode="decimal"
            value={left}
            onChange={(e) => onLeft(e.target.value)}
            className="metric-value"
          />
        </div>
        <ArrowLeftRight className="mb-3 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex-1 space-y-1.5">
          <Label>{rightLabel}</Label>
          <Input
            inputMode="decimal"
            value={right}
            onChange={(e) => onRight(e.target.value)}
            className="metric-value"
          />
        </div>
      </div>
      {note ? <p className="mt-3 text-xs text-muted-foreground">{note}</p> : null}
    </Panel>
  );
}

function ToolsPage() {
  const [weight, setWeight] = useState("72");
  const [height, setHeight] = useState("175");

  const bmi =
    Number(weight) > 0 && Number(height) > 0
      ? (Number(weight) / (Number(height) / 100) ** 2).toFixed(1)
      : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health tools"
        description="Every converter works in both directions — type into whichever box you have a number for."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TwoWay
          title="Glucose converter"
          leftLabel="mg/dL"
          rightLabel="mmol/L"
          initialLeft="120"
          toRight={glucoseToMmol}
          toLeft={glucoseToMgdl}
          leftDigits={0}
          rightDigits={1}
        />

        <TwoWay
          title="HbA1c ↔ average glucose"
          leftLabel="HbA1c (%)"
          rightLabel="Average glucose (mg/dL)"
          initialLeft="6.8"
          toRight={a1cToAverageGlucose}
          toLeft={averageGlucoseToA1c}
          leftDigits={1}
          rightDigits={0}
          note="Estimated average glucose, using the standard ADAG relationship."
        />

        <TwoWay
          title="Weight converter"
          leftLabel="Kilograms"
          rightLabel="Pounds"
          initialLeft="72"
          toRight={kgToLb}
          toLeft={lbToKg}
        />

        <TwoWay
          title="Temperature converter"
          leftLabel="Celsius"
          rightLabel="Fahrenheit"
          initialLeft="37"
          toRight={cToF}
          toLeft={fToC}
        />

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
