/**
 * BioSovereignty Design System — Public API
 * ==========================================
 * استورد من هنا دائماً بدلاً من الاستيراد المباشر من design-system.jsx
 *
 * مثال:
 *   import { MetricCard, useToast, SkeletonCard } from "@/components/ui";
 */

// ── Provider & Layout ───────────────────────────────────────────────────────
export {
  DesignSystemProvider,
  PageLayout,
} from "./design-system";

// ── Data Display ────────────────────────────────────────────────────────────
export {
  MetricCard,
  ScoreDisplay,
  StatsRow,
  SparkLine,
} from "./design-system";

// ── Progress & Gauges ───────────────────────────────────────────────────────
export {
  ProgressBar,
  CircularGauge,
  CircularProgressRing,   // SVG ring مستقل — يدعم gradient وcustom color
} from "./design-system";

// ── Status & Feedback ───────────────────────────────────────────────────────
export {
  StatusBadge,
  AlertBanner,
  StreakCounter,
} from "./design-system";

// ── Toast / Notifications ───────────────────────────────────────────────────
export {
  ToastProvider,
  useToast,               // hook — يجب استخدامه داخل <ToastProvider>
} from "./design-system";

// ── Skeleton / Loading ──────────────────────────────────────────────────────
export {
  SkeletonRect,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
} from "./design-system";

// ── Navigation ──────────────────────────────────────────────────────────────
export {
  NavigationSidebar,
  TabBar,                 // bottom nav أو top pills
  Tabs,                   // panel-based tabs (underline / pill / card)
} from "./design-system";

// ── Typography & Headers ────────────────────────────────────────────────────
export {
  SectionHeader,
} from "./design-system";

// ── Inputs & Controls ───────────────────────────────────────────────────────
export {
  ActionButton,
  NumberInput,
  RatingSelector,
  ToggleSwitch,
  PhotoUpload,
} from "./design-system";

// ── Specialist & Chat ───────────────────────────────────────────────────────
export {
  SpecialistCard,
  ChatBubble,
} from "./design-system";

// ── Visualization ───────────────────────────────────────────────────────────
export {
  BodyMap,
  TimelineBar,
  TimerDisplay,
} from "./design-system";

// ── Type Helpers (للـ TypeScript) ───────────────────────────────────────────
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message?: string;
  /** مدة الإغلاق التلقائي بالـ ms — 0 لإيقاف الإغلاق التلقائي */
  duration?: number;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
  /** إضافة خط فاصل فوق هذا العنصر */
  dividerBefore?: boolean;
}

export interface TimelineBlock {
  start: number;    // ساعة (0-24)
  end: number;
  label: string;
  type: "sleep" | "work" | "exercise" | "meal" | "rest" | "other";
}

export interface StatItem {
  value: string | number;
  label: string;
  icon?: string;
}

export interface BreakdownItem {
  label: string;
  value: number;
  max: number;
}
