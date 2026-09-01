import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader, Panel } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Care team — Vitavyn" },
      {
        name: "description",
        content: "Keep every doctor, clinic and specialist in one place, linked to your appointments.",
      },
      { property: "og:title", content: "Care team — Vitavyn" },
      { property: "og:description", content: "Your doctors and clinics, always to hand." },
    ],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const { data, add, remove } = useVitavyn();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", specialty: "", clinic: "", phone: "", email: "", address: "" });

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    add("providers", { ...form, name: form.name.trim() } as never);
    setForm({ name: "", specialty: "", clinic: "", phone: "", email: "", address: "" });
    setOpen(false);
    toast.success("Added to your care team");
  };

  return (
    <div>
      <PageHeader
        title="Care team"
        description="Doctors, specialists and clinics you work with."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add provider
          </Button>
        }
      />

      {data.providers.length === 0 ? (
        <EmptyState title="No providers yet" description="Add a doctor or clinic to link them to appointments." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.providers.map((provider) => (
            <Panel key={provider.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold">{provider.name}</h2>
                  <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                  {provider.clinic ? <p className="text-sm text-muted-foreground">{provider.clinic}</p> : null}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${provider.name}`}
                  onClick={() => remove("providers", provider.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {provider.phone ? (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {provider.phone}
                  </li>
                ) : null}
                {provider.email ? (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {provider.email}
                  </li>
                ) : null}
                {provider.address ? (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {provider.address}
                  </li>
                ) : null}
              </ul>
            </Panel>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add provider</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", "Name"],
                ["specialty", "Specialty"],
                ["clinic", "Clinic"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["address", "Address"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={save}>Save provider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
