import { Outlet, Navigate, useLocation } from "react-router-dom";
import { AccessRestricted } from "@/components/AccessRestricted";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { PageTitleProvider } from "@/context/PageTitleContext";
import { useRole } from "@/context/RoleContext";
import { canAccessRoute } from "@/lib/roles";

export function AppLayout() {
  const { role } = useRole();
  const location = useLocation();

  if (!role) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const allowed = canAccessRoute(role, location.pathname);

  return (
    <PageTitleProvider>
      <div className="flex min-h-screen min-w-0">
        <Sidebar role={role} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-white">
          <TopNavbar pathname={location.pathname} role={role} />
          <MobileNav role={role} />
          <main className="relative min-w-0 flex-1 overflow-y-auto pb-8">
            <div
              key={location.pathname}
              className="page-enter min-h-full"
            >
              {allowed ? (
                <Outlet />
              ) : (
                <AccessRestricted
                  role={role}
                  attemptedPath={location.pathname}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
