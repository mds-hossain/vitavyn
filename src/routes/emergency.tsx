import { createFileRoute } from "@tanstack/react-router";
import { Phone, ShieldAlert } from "lucide-react";
import { PageHeader, Panel, SafetyNote } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency card — Vitavyn" },
      {
        name: "description",
        content: "A single screen with blood type, allergies, conditions, medications and emergency contact.",
      },
      { property: "og:title", content: "Emergency card — Vitavyn" },
      { property: "og:description", content: "Critical information, readable in seconds." },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const { data } = useVitavyn();
  const { profile } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency card"
        description="Show this screen to a responder. It works offline, on this device."
      />

      <Panel className="border-destructive/40">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          <div>
            <h2 className="font-display text-xl font-semibold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">
              {profile.dateOfBirth ? `Born ${profile.dateOfBirth}` : "Date of birth not set"}
              {profile.bloodType ? ` · Blood type ${profile.bloodType}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Allergies</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {profile.allergies.length ? (
                profile.allergies.map((a) => <li key={a}>{a}</li>)
              ) : (
                <li className="text-muted-foreground">None recorded</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conditions</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {data.conditions.map((c) => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medications</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {data.medications.map((m) => (
                <li key={m.id}>
                  {m.name} {m.dose}
                  {m.unit} · {m.frequency}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Emergency contact
            </h3>
            <p className="mt-2 text-sm">{profile.emergencyContactName ?? "Not set"}</p>
            {profile.emergencyContactPhone ? (
              <a
                href={`tel:${profile.emergencyContactPhone}`}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                <Phone className="h-4 w-4" /> {profile.emergencyContactPhone}
              </a>
            ) : null}
          </div>
        </div>
      </Panel>

      <SafetyNote>
        In a life-threatening emergency, call your local emergency number first. This card is a record, not a service.
      </SafetyNote>
    </div>
  );
}
