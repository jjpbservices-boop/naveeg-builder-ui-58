"use client";
import React from "react";
import {
  Bot, ServerCog, PanelsTopLeft, Globe2, KeyRound, BarChart3, Building2, ChevronDown, Rocket, TrendingUp, Star,
  Search, Users, Zap, ShoppingCart, Clock, Edit,
  type LucideProps
} from "lucide-react";

/**
 * Stable, hydration-safe icon wrapper.
 * - On the server: renders a minimal <svg> with the EXACT classes lucide adds ("lucide lucide-${slug}")
 * - On the client: renders the real Lucide component WITHOUT re-adding "lucide …" ourselves,
 *   so the className string matches 1:1 after hydration.
 * 
 * IMPORTANT: MAP keys must match EXACTLY what Lucide generates on the client side.
 * Some icons like Building2 generate "lucide-building2" (no hyphen), others use hyphens.
 */
const MAP = {
  "building2": Building2,  // Lucide generates "lucide-building2" (no hyphen)
  "bot": Bot,
  "server-cog": ServerCog,
  "panels-top-left": PanelsTopLeft,
  "globe2": Globe2,        // Lucide generates "lucide-globe2" (no hyphen)
  "key-round": KeyRound,
  "bar-chart-3": BarChart3,
  "chevron-down": ChevronDown,
  "rocket": Rocket,
  "trending-up": TrendingUp,
  "star": Star,
  "search": Search,
  "users": Users,
  "zap": Zap,
  "shopping-cart": ShoppingCart,
  "clock": Clock,
  "edit": Edit,
} as const;

export type IconName = keyof typeof MAP;

type Props = Omit<LucideProps, "name"> & { name: IconName };

export function Icon({ name, className = "", ...rest }: Props) {
  // IMPORTANT: Use the provided name verbatim - do NOT transform or derive from displayName
  const slug = name;

  if (typeof window === "undefined") {
    // Server markup MUST match what lucide adds on client: "lucide lucide-${slug}"
    // Keep class order stable and do not add extra tokens.
    const serverClass = `lucide lucide-${slug}${className ? " " + className : ""}`;
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        className={serverClass}
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
      />
    );
  }

  const Cmp = MAP[slug];
  // Client: pass ONLY user classes; lucide will add "lucide lucide-${slug}" internally.
  return <Cmp aria-hidden="true" className={className} {...rest} />;
}

export default Icon;
