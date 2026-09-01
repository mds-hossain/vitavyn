import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BROWSER_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as
  | string
  | undefined;
const TRACKING_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as
  | string
  | undefined;

declare global {
  interface Window {
    google?: any;
    __vitavynMapsReady?: boolean;
    __vitavynMapsInit?: () => void;
  }
}

let loaderPromise: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.__vitavynMapsReady) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  if (!BROWSER_KEY) return Promise.reject(new Error("no key"));

  loaderPromise = new Promise<void>((resolve, reject) => {
    window.__vitavynMapsInit = () => {
      window.__vitavynMapsReady = true;
      resolve();
    };
    const script = document.createElement("script");
    const channel = TRACKING_ID ? `&channel=${TRACKING_ID}` : "";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&libraries=places&loading=async&callback=__vitavynMapsInit${channel}`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

type Suggestion = { text: string };

/**
 * Address field with Google Places (New) suggestions. Falls back to a plain
 * text input when the Maps connector is not configured.
 */
export function AddressAutocomplete({
  label = "Address",
  value,
  onChange,
  placeholder = "Start typing an address…",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const sessionToken = useRef<any>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!BROWSER_KEY) return;
    loadMaps()
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, []);

  const query = (text: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (!ready || text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const places = await window.google.maps.importLibrary("places");
        if (!sessionToken.current) {
          sessionToken.current = new places.AutocompleteSessionToken();
        }
        const { suggestions: result } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: text.slice(0, 200),
          sessionToken: sessionToken.current,
        });
        setSuggestions(
          (result ?? [])
            .map((s: any) => ({ text: s?.placePrediction?.text?.text ?? "" }))
            .filter((s: Suggestion) => s.text)
            .slice(0, 5),
        );
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 350);
  };

  return (
    <div className="relative space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          query(e.target.value);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 ? (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {suggestions.map((s) => (
            <li key={s.text}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => {
                  onChange(s.text);
                  setSuggestions([]);
                  setOpen(false);
                  sessionToken.current = null;
                }}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{s.text}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
