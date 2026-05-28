import { NavLink } from "react-router-dom";
import { getNavItemsForRole, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface Props {
  role: UserRole;
}

export function Sidebar({ role }: Props) {
  const navItems = getNavItemsForRole(role);

  return (
    <aside className="hidden w-56 shrink-0 flex-col bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)] xl:flex xl:w-64">
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          Navigation
        </p>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-[#F79E1B]" : "text-white/50",
                  )}
                />
                <span className="truncate">{label}</span>
                {isActive && (
                  <span
                    className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#EB001B]"
                    aria-hidden
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
