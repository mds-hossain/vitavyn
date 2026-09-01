import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { EmptyState, PageHeader, Panel } from "@/components/vitavyn/primitives";
import { buildTimeline, useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Health timeline — Vitavyn" },
      {
        name: "description",
        content:
          "Measurements, medications, symptoms, meals, appointments and records combined into one chronological health story.",
      },
      { property: "og:title", content: "Health timeline — Vitavyn" },
      { property: "og:description", content: "Your whole health history in one chronological view." },
    ],
  }),
  component: TimelinePage,
});

const FILTERS = [
  { id: "all", label: "All" },
  { id: "measurement", label: "Measurements" },
  { id: "medication", label: "Medications" },
  { id: "symptom", label: "Symptoms" },
  { id: "meal", label: "Meals" },
  { id: "appointment", label: "Appointments" },
  { id: "record", label: "Records" },
];

function dayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
}

function TimelinePage() {
  const { data } = useVitavyn();
  const [filter, setFilter] = useState("all");
  const events = buildTimeline(data).filter((e) => filter === "all" || e.type === filter);

  const grouped = events.reduce<Record<string, typeof events>>((acc, event) => {
    const key = dayLabel(new Date(event.at));
    (acc[key] ??= []).push(event);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Health timeline" description="Everything you record, in the order it happened." />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Log a measurement, medication or symptom to start your timeline." />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([day, dayEvents]) => (
            <Panel key={day} title={day}>
              <ul className="space-y-4">
                {dayEvents.map((event) => (
                  <li key={event.type + event.id} className="flex gap-4">
                    <span className="metric-value w-14 shrink-0 text-sm text-muted-foreground">
                      {format(new Date(event.at), "HH:mm")}
                    </span>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.detail ? (
                        <p className="text-xs text-muted-foreground">{event.detail}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
