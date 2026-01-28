// src/layouts/AppShell.tsx
import PcLayout from "./PcLayout";
import MobileLayout from "./MobileLayout";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function AppShell() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileLayout /> : <PcLayout />;
}
