import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { buildTimeline, useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/appointments/$appointmentId")({
  head: () => ({
    meta: [
      { title: "Appointment prep — Vitavyn" },
      {
        name: "description",
        content: "Questions to ask, a summary of recent readings, and space for notes from the visit.",
      },
      { property: "og:title", content: "Appointment prep — Vitavyn" },
      { property: "og:description", content: "Everything you need for your next visit, in one page." },
    ],
  }),
  component: AppointmentDetail,
});

function AppointmentDetail() {
  const { appointmentId } = Route.useParams();
  const { data, update } = useVitavyn();
  const appointment = data.appointments.find((a) => a.id === appointmentId);
  if (!appointment) throw notFound();

  const [question, setQuestion] = useState("");
  const recent = buildTimeline(data).slice(0, 8);

  const addQuestion = () => {
    if (!question.trim()) return;
    const text = question.trim();
    update((draft) => {
      const target = draft.appointments.find((a) => a.id === appointmentId);
      target?.questions.push({ id: `q-${Date.now()}`, text, asked: false });
      return draft;
    });
    setQuestion("");
    toast.success("Question added");
  };

  const toggleQuestion = (questionId: string) => {
    update((draft) => {
      const target = draft.appointments.find((a) => a.id === appointmentId);
      const q = target?.questions.find((item) => item.id === questionId);
      if (q) q.asked = !q.asked;
      return draft;
    });
  };

  const setNotes = (notes: string) => {
    update((draft) => {
      const target = draft.appointments.find((a) => a.id === appointmentId);
      if (target) target.notes = notes;
      return draft;
    });
  };

  const markCompleted = () => {
    update((draft) => {
      const target = draft.appointments.find((a) => a.id === appointmentId);
      if (target) target.status = "completed";
      return draft;
    });
    toast.success("Appointment marked as completed");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${appointment.providerName} · ${appointment.specialty}`}
        description={`${format(new Date(appointment.startsAt), "EEEE, MMMM d · HH:mm")}${
          appointment.location ? ` · ${appointment.location}` : ""
        }`}
        actions={
          appointment.status === "upcoming" ? (
            <Button variant="outline" onClick={markCompleted}>
              Mark completed
            </Button>
          ) : (
            <StatusPill tone="success">{appointment.status}</StatusPill>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Questions to ask">
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Should I keep the same dose?"
              onKeyDown={(e) => e.key === "Enter" && addQuestion()}
            />
            <Button onClick={addQuestion} aria-label="Add question">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {appointment.questions.map((q) => (
              <li key={q.id} className="flex items-start gap-3">
                <Checkbox checked={q.asked} onCheckedChange={() => toggleQuestion(q.id)} id={q.id} />
                <label
                  htmlFor={q.id}
                  className={`text-sm ${q.asked ? "text-muted-foreground line-through" : ""}`}
                >
                  {q.text}
                </label>
              </li>
            ))}
            {appointment.questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No questions yet — add anything you want to remember.</p>
            ) : null}
          </ul>
        </Panel>

        <Panel title="Recent activity to share">
          <ul className="space-y-2 text-sm">
            {recent.map((event) => (
              <li key={event.type + event.id} className="flex justify-between gap-3">
                <span>{event.title}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(event.at), "MMM d")}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Visit notes">
        <Textarea
          rows={6}
          value={appointment.notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What was decided, what changed, what to do next..."
        />
      </Panel>
    </div>
  );
}
