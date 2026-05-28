import { NavLink } from "react-router-dom";
import { getNavItemsForRole, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface Props {
  role: UserRole;
}

export function MobileNav({ role }: Props) {
  const navItems = getNavItemsForRole(role);

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-slate-50/80 px-3 py-2 xl:hidden"
      aria-label="Mobile navigation"
    >
      {navItems.map(({ path, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-[#EB001B] text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100",
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
