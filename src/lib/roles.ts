import {
  BarChart3,
  Brain,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  Package,
  Scale,
  Sparkles,
  Target,
  Users,
  Bot,
  type LucideIcon,
} from "lucide-react";

export type UserRole =
  | "director"
  | "product_manager"
  | "sales_manager"
  | "risk_compliance"
  | "data_scientist"
  | "admin"
  | "judge_demo";

export const ROUTES = {
  dashboard: "/dashboard",
  businessImpact: "/business-impact",
  beforeVsAfter: "/before-vs-after",
  productRecommendations: "/product-recommendations",
  salesLeads: "/sales-leads",
  cardholder: "/cardholder",
  feedback: "/feedback",
  modelMetrics: "/model-metrics",
  featureImportance: "/feature-importance",
  judgeDemo: "/judge-demo",
  aiAgent: "/ai-agent",
} as const;

export type AppPath = (typeof ROUTES)[keyof typeof ROUTES];

export const ALL_APP_PATHS: AppPath[] = [
  ROUTES.dashboard,
  ROUTES.businessImpact,
  ROUTES.aiAgent,
  ROUTES.beforeVsAfter,
  ROUTES.productRecommendations,
  ROUTES.salesLeads,
  ROUTES.cardholder,
  ROUTES.feedback,
  ROUTES.modelMetrics,
  ROUTES.featureImportance,
];

export interface NavItem {
  path: AppPath;
  label: string;
  icon: LucideIcon;
}

const NAV: Record<string, NavItem> = {
  dashboard: { path: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  businessImpact: {
    path: ROUTES.businessImpact,
    label: "Business Impact",
    icon: BarChart3,
  },
  beforeVsAfter: {
    path: ROUTES.beforeVsAfter,
    label: "Before vs After",
    icon: Scale,
  },
  productRecommendations: {
    path: ROUTES.productRecommendations,
    label: "Product Recommendations",
    icon: Package,
  },
  salesLeads: { path: ROUTES.salesLeads, label: "Sales Leads", icon: Target },
  feedback: { path: ROUTES.feedback, label: "Feedback", icon: MessageSquare },
  modelMetrics: {
    path: ROUTES.modelMetrics,
    label: "Model Metrics",
    icon: Gauge,
  },
  featureImportance: {
    path: ROUTES.featureImportance,
    label: "Feature Importance",
    icon: Brain,
  },
  judgeDemo: {
    path: ROUTES.judgeDemo,
    label: "Guided Demo",
    icon: Sparkles,
  },
  aiAgent: { path: ROUTES.aiAgent, label: "AI Agent", icon: Bot },
};

const ROLE_NAV_KEYS: Record<UserRole, (keyof typeof NAV)[]> = {
  director: [
    "dashboard",
    "businessImpact",
    "aiAgent",
    "beforeVsAfter",
    "modelMetrics",
    "featureImportance",
  ],
  product_manager: [
    "dashboard",
    "businessImpact",
    "aiAgent",
    "productRecommendations",
    "modelMetrics",
    "featureImportance",
  ],
  sales_manager: ["salesLeads", "feedback"],
  risk_compliance: ["salesLeads", "modelMetrics", "feedback"],
  data_scientist: [
    "modelMetrics",
    "featureImportance",
    "dashboard",
    "businessImpact",
    "aiAgent",
    "beforeVsAfter",
    "productRecommendations",
    "salesLeads",
    "feedback",
  ],
  admin: [
    "dashboard",
    "businessImpact",
    "aiAgent",
    "beforeVsAfter",
    "productRecommendations",
    "salesLeads",
    "feedback",
    "modelMetrics",
    "featureImportance",
  ],
  judge_demo: ["judgeDemo", "aiAgent"],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  director: "Director / Executive",
  product_manager: "Product Manager",
  sales_manager: "Sales Manager",
  risk_compliance: "Risk / Compliance",
  data_scientist: "Data Scientist",
  admin: "Admin",
  judge_demo: "Judge Demo Mode",
};

export const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  director: "bg-blue-100 text-blue-800 ring-1 ring-blue-200/80",
  product_manager: "bg-violet-100 text-violet-800 ring-1 ring-violet-200/80",
  sales_manager: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80",
  risk_compliance: "bg-amber-100 text-amber-900 ring-1 ring-amber-200/80",
  data_scientist: "bg-cyan-100 text-cyan-900 ring-1 ring-cyan-200/80",
  admin: "bg-slate-200 text-slate-800 ring-1 ring-slate-300/80",
  judge_demo: "bg-[#EB001B]/10 text-[#EB001B] ring-1 ring-[#EB001B]/20",
};

export interface RoleCardConfig {
  role: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const ROLE_CARDS: RoleCardConfig[] = [
  {
    role: "director",
    title: "Director / Executive",
    description: "Portfolio KPIs, business impact, and transformation outcomes",
    icon: LineChart,
  },
  {
    role: "product_manager",
    title: "Product Manager",
    description: "Impact metrics and product recommendations for SME growth",
    icon: Package,
  },
  {
    role: "sales_manager",
    title: "Sales Manager",
    description: "Prioritized leads, cardholder profiles, and field feedback",
    icon: Users,
  },
  {
    role: "risk_compliance",
    title: "Risk / Compliance",
    description: "Lead review, model governance, and compliance feedback",
    icon: ClipboardList,
  },
  {
    role: "data_scientist",
    title: "Data Scientist",
    description: "Model performance, features, and full analytical workspace",
    icon: Brain,
  },
  {
    role: "admin",
    title: "Admin",
    description: "Full access to every HEIA workspace and configuration view",
    icon: Gauge,
  },
  {
    role: "judge_demo",
    title: "Judge Demo Mode",
    description: "Step-by-step guided walkthrough for competition judging",
    icon: Sparkles,
  },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return ROLE_NAV_KEYS[role].map((k) => NAV[k]);
}

export function getAllowedPaths(role: UserRole): AppPath[] {
  if (role === "judge_demo") return [ROUTES.judgeDemo, ROUTES.aiAgent];
  if (role === "admin" || role === "data_scientist") return [...ALL_APP_PATHS];
  return getNavItemsForRole(role).map((item) => item.path);
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith(`${ROUTES.cardholder}/`)) {
    return getAllowedPaths(role).includes(ROUTES.salesLeads);
  }
  const allowed = getAllowedPaths(role);
  return allowed.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function getDefaultRouteForRole(role: UserRole): AppPath {
  const nav = getNavItemsForRole(role);
  return nav[0]?.path ?? ROUTES.dashboard;
}

export function getRouteLabel(pathname: string): string {
  const path = pathname.split("?")[0];
  if (path.startsWith(`${ROUTES.cardholder}/`)) {
    return "Cardholder Detail";
  }
  const item = Object.values(NAV).find(
    (n) => path === n.path || path.startsWith(`${n.path}/`),
  );
  return item?.label ?? "Page";
}

const FULL_MODEL_ANALYTICS_ROLES: UserRole[] = [
  "data_scientist",
  "risk_compliance",
  "admin",
];

export function hasFullModelMetricsAccess(role: UserRole): boolean {
  return FULL_MODEL_ANALYTICS_ROLES.includes(role);
}

export function hasFullFeatureImportanceAccess(role: UserRole): boolean {
  return FULL_MODEL_ANALYTICS_ROLES.includes(role);
}
