import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Globe, Mail, MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react";
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
import { AddressAutocomplete } from "@/components/vitavyn/AddressAutocomplete";
import { useVitavyn } from "@/lib/vitavyn/store";
import type { Provider } from "@/lib/vitavyn/types";

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

const empty = {
  name: "",
  specialty: "",
  clinic: "",
  phone: "",
  email: "",
  address: "",
  website: "",
};

function DoctorsPage() {
  const { data, add, remove, updateItem } = useVitavyn();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const openAdd = () => {
    setEditingId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (provider: Provider) => {
    setEditingId(provider.id);
    setForm({
      name: provider.name,
      specialty: provider.specialty ?? "",
      clinic: provider.clinic ?? "",
      phone: provider.phone ?? "",
      email: provider.email ?? "",
      address: provider.address ?? "",
      website: provider.website ?? "",
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = { ...form, name: form.name.trim() };
    if (editingId) {
      updateItem("providers", editingId, payload as never);
      toast.success("Provider updated");
    } else {
      add("providers", payload as never);
      toast.success("Added to your care team");
    }
    setForm(empty);
    setEditingId(null);
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Care team"
        description="Doctors, specialists and clinics you work with."
        actions={
          <Button onClick={openAdd}>
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
                <div className="flex shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${provider.name}`}
                    onClick={() => openEdit(provider)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${provider.name}`}
                    onClick={() => remove("providers", provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
                {provider.website ? (
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline underline-offset-2"
                    >
                      {provider.website.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                ) : null}
                {provider.address ? (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {provider.address}
                  </li>
                ) : null}
              </ul>
            </Panel>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit provider" : "Add provider"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", "Name"],
                ["specialty", "Specialty"],
                ["clinic", "Clinic"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["website", "Website"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <AddressAutocomplete
                value={form.address}
                onChange={(address) => setForm({ ...form, address })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>{editingId ? "Save changes" : "Save provider"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
