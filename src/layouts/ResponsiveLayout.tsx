import { useEffect, useState } from "react";
import MobileLayout from "@/layouts/MobileLayout";
import PcLayout from "@/layouts/PcLayout";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // initial
    setMatches(mql.matches);

    // subscribe
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export default function ResponsiveLayout() {
  // Tailwind md breakpoint = 768px
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return isDesktop ? <PcLayout /> : <MobileLayout />;
}
