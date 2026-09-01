import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  ChartLine,
  ClipboardList,
  FileText,
  FlaskConical,
  HeartPulse,
  Home,
  Menu,
  Moon,
  Pill,
  Plus,
  Settings,
  ShieldCheck,
  Siren,
  Stethoscope,
  Sun,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VitavynLogo, VitavynMark } from "./Logo";
import { QuickAdd } from "./QuickAdd";
import { useVitavyn } from "@/lib/vitavyn/store";

type NavItem = { to: string; label: string; icon: typeof Home };

const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Today", icon: Home },
  { to: "/health", label: "My Health", icon: HeartPulse },
  { to: "/medications", label: "Medications", icon: Pill },
  { to: "/nutrition", label: "Nutrition", icon: UtensilsCrossed },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/records", label: "Records", icon: FileText },
  { to: "/insights", label: "Insights", icon: ChartLine },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/privacy", label: "Data & Privacy", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];

const MORE_SECTIONS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Health",
    items: [
      { to: "/conditions", label: "Conditions", icon: Activity },
      { to: "/measurements", label: "Measurements", icon: ChartLine },
      { to: "/symptoms", label: "Symptoms", icon: ClipboardList },
      { to: "/timeline", label: "Timeline", icon: CalendarDays },
    ],
  },
  {
    heading: "Care",
    items: [
      { to: "/medications", label: "Medications", icon: Pill },
      { to: "/appointments", label: "Appointments", icon: CalendarDays },
      { to: "/doctors", label: "Doctors", icon: Stethoscope },
    ],
  },
  {
    heading: "Records",
    items: [
      { to: "/records", label: "Medical records", icon: FileText },
      { to: "/labs", label: "Lab results", icon: FlaskConical },
    ],
  },
  {
    heading: "Wellness",
    items: [
      { to: "/nutrition", label: "Nutrition", icon: UtensilsCrossed },
      { to: "/insights", label: "Insights", icon: ChartLine },
    ],
  },
  {
    heading: "Tools",
    items: [
      { to: "/report", label: "Health report", icon: FileText },
      { to: "/emergency", label: "Emergency card", icon: Siren },
      { to: "/tools", label: "Unit converters", icon: Wrench },
    ],
  },
  {
    heading: "Account",
    items: [
      { to: "/plans", label: "Plans & storage", icon: BadgeCheck },
      { to: "/privacy", label: "Data & Privacy", icon: ShieldCheck },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];


export function AppShell({ children }: { children: ReactNode }) {
  const [addOpen, setAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { data, setPreferences } = useVitavyn();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDark = data.preferences.theme === "dark";

  const firstName = data.profile.name.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/" className="px-2">
          <VitavynLogo tone="inverse" markClass="h-7 w-7" />
        </Link>
        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto">
          {PRIMARY_NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-sidebar-border pt-4">
          <Button className="w-full" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add entry
          </Button>
          <button
            onClick={() => setPreferences({ theme: isDark ? "light" : "dark" })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {isDark ? "Light appearance" : "Dark appearance"}
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <VitavynMark className="h-7 w-7" />
          <span className="font-display text-sm font-semibold tracking-[0.2em]">VITAVYN</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle appearance"
            onClick={() => setPreferences({ theme: isDark ? "light" : "dark" })}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] overflow-y-auto sm:w-80">
              <SheetHeader className="text-left">
                <SheetTitle>Hello, {firstName}</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 px-4 pb-10">
                {MORE_SECTIONS.map((section) => (
                  <div key={section.heading}>
                    <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                      {section.heading}
                    </p>
                    <div className="grid gap-0.5">
                      {section.items.map((item) => (
                        <Link
                          key={section.heading + item.to}
                          to={item.to}
                          onClick={() => setMoreOpen(false)}
                          className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-accent"
                        >
                          <item.icon className="h-4 w-4 text-primary" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 sm:px-6 lg:ml-64 lg:px-10 lg:pb-14 lg:pt-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 items-end">
          <BottomLink to="/" label="Today" icon={Home} active={pathname === "/"} />
          <BottomLink
            to="/health"
            label="Health"
            icon={HeartPulse}
            active={pathname.startsWith("/health") || pathname.startsWith("/conditions")}
          />
          <div className="flex justify-center pb-2">
            <button
              onClick={() => setAddOpen(true)}
              aria-label="Add entry"
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-float)] transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
          <BottomLink
            to="/appointments"
            label="Appointments"
            icon={CalendarDays}
            active={pathname.startsWith("/appointments")}
          />
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-1 py-3 text-[11px] font-medium text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
            More
          </button>
        </div>
      </nav>

      <QuickAdd open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function BottomLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
