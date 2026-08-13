import {
  Bookmark,
  Briefcase,
  ChartNoAxesColumn,
  CircleHelp,
  ExternalLink,
  Flag,
  FolderOpen,
  Home,
  Inbox,
  List,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";

/**
 * Phase 7 — one icon per nav key, shared by the tab bar and the drawer.
 *
 * lib/nav.ts stores icons as strings so it stays a plain config file with no
 * JSX in it. This is the only place that maps them, so one destination can
 * never wear two different icons in two shells.
 */
const MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  search: Search,
  message: MessageSquare,
  briefcase: Briefcase,
  inbox: Inbox,
  bookmark: Bookmark,
  chart: ChartNoAxesColumn,
  folder: FolderOpen,
  list: List,
  user: User,
  shield: Shield,
  wallet: Wallet,
  external: ExternalLink,
  help: CircleHelp,
  flag: Flag,
  sparkle: Sparkles,
  settings: Settings,
  menu: Menu,
};

export function NavIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const Cmp = MAP[name] || Home;
  return <Cmp className={className} />;
}
