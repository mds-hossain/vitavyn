import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader, Panel } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Vitavyn" },
      {
        name: "description",
        content: "Profile, preferred units, theme, data export and permanent deletion — all under your control.",
      },
      { property: "og:title", content: "Settings — Vitavyn" },
      { property: "og:description", content: "Units, profile, theme and full data control." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, setPreferences, setProfile, resetDemo, clearAll } = useVitavyn();
  const { preferences, profile } = data;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vitavyn-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  };

  const toggleUnit = <K extends "glucoseUnit" | "weightUnit" | "tempUnit">(
    key: K,
    options: [string, string],
  ) => (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setPreferences({ [key]: option } as never)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            preferences[key] === option ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your profile, your units, your data." />

      <Panel title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Date of birth</Label>
            <Input
              type="date"
              value={profile.dateOfBirth ?? ""}
              onChange={(e) => setProfile({ dateOfBirth: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Blood type</Label>
            <Input
              value={profile.bloodType ?? ""}
              onChange={(e) => setProfile({ bloodType: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Allergies (comma separated)</Label>
            <Input
              value={profile.allergies.join(", ")}
              onChange={(e) =>
                setProfile({
                  allergies: e.target.value.split(",").map((a) => a.trim()).filter(Boolean),
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Emergency contact</Label>
            <Input
              value={profile.emergencyContactName ?? ""}
              onChange={(e) => setProfile({ emergencyContactName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Emergency phone</Label>
            <Input
              value={profile.emergencyContactPhone ?? ""}
              onChange={(e) => setProfile({ emergencyContactPhone: e.target.value })}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Units">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Blood glucose</Label>
            {toggleUnit("glucoseUnit", ["mg/dL", "mmol/L"])}
          </div>
          <div className="space-y-2">
            <Label>Weight</Label>
            {toggleUnit("weightUnit", ["kg", "lb"])}
          </div>
          <div className="space-y-2">
            <Label>Temperature</Label>
            {toggleUnit("tempUnit", ["°C", "°F"])}
          </div>
        </div>
      </Panel>

      <Panel title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-sm text-muted-foreground">Easier on the eyes for night-time logging.</p>
          </div>
          <Switch
            checked={preferences.theme === "dark"}
            onCheckedChange={(checked) => setPreferences({ theme: checked ? "dark" : "light" })}
          />
        </div>
      </Panel>

      <Panel title="Your data">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              resetDemo();
              toast.success("Demo data restored");
            }}
          >
            <RotateCcw className="h-4 w-4" /> Restore demo data
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" /> Delete everything
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all health data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes every condition, measurement, medication and document stored on this
                  device. It cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearAll();
                    toast.success("All local data deleted");
                  }}
                >
                  Delete permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Panel>
    </div>
  );
}
