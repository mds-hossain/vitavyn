import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
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
import { EmptyState, MetricTile, PageHeader, Panel } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Meals & nutrition — Vitavyn" },
      {
        name: "description",
        content: "Log meals with optional carbs and calories, and see them alongside your other health data.",
      },
      { property: "og:title", content: "Meals & nutrition — Vitavyn" },
      { property: "og:description", content: "Simple meal logging that connects to the rest of your record." },
    ],
  }),
  component: NutritionPage,
});

function NutritionPage() {
  const { data, add, remove } = useVitavyn();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", mealType: "lunch", carbs: "", calories: "" });

  const today = new Date();
  const todaysMeals = data.meals.filter((m) => isSameDay(new Date(m.eatenAt), today));
  const carbs = todaysMeals.reduce((sum, m) => sum + (m.carbsGrams ?? 0), 0);
  const calories = todaysMeals.reduce((sum, m) => sum + (m.calories ?? 0), 0);

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Add a meal name");
      return;
    }
    add("meals", {
      name: form.name.trim(),
      mealType: form.mealType,
      carbsGrams: form.carbs ? Number(form.carbs) : null,
      calories: form.calories ? Number(form.calories) : null,
      eatenAt: new Date().toISOString(),
    } as never);
    setForm({ name: "", mealType: "lunch", carbs: "", calories: "" });
    setOpen(false);
    toast.success("Meal logged");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meals & nutrition"
        description="Optional, lightweight food logging — useful context, never a calorie police."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Log meal
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricTile label="Meals today" value={String(todaysMeals.length)} />
        <MetricTile label="Carbs today" value={String(carbs)} unit="g" />
        <MetricTile label="Calories today" value={String(calories)} unit="kcal" />
      </div>

      <Panel title="Meal history">
        {data.meals.length === 0 ? (
          <EmptyState title="No meals logged" description="Log a meal to see it here and on your timeline." />
        ) : (
          <ul className="divide-y divide-border">
            {data.meals
              .sort((a, b) => new Date(b.eatenAt).getTime() - new Date(a.eatenAt).getTime())
              .map((meal) => (
                <li key={meal.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {meal.name} <span className="text-muted-foreground">· {meal.mealType}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(meal.eatenAt), "MMM d, yyyy · HH:mm")}
                      {meal.carbsGrams ? ` · ${meal.carbsGrams}g carbs` : ""}
                      {meal.calories ? ` · ${meal.calories} kcal` : ""}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Remove meal" onClick={() => remove("meals", meal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
          </ul>
        )}
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a meal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>What did you eat?</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Carbs (g)</Label>
              <Input
                inputMode="numeric"
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Calories</Label>
              <Input
                inputMode="numeric"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>Save meal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
