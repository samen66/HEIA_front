import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRouteLabel, ROLE_LABELS, type UserRole } from "@/lib/roles";

interface Props {
  role: UserRole;
  attemptedPath: string;
}

export function AccessRestricted({ role, attemptedPath }: Props) {
  const { clearRole } = useRole();
  const navigate = useNavigate();
  const pageName = getRouteLabel(attemptedPath);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="max-w-lg border-[var(--color-border)] shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#EB001B]/10">
            <ShieldAlert className="h-6 w-6 text-[#EB001B]" aria-hidden />
          </div>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            This page is not available for your current role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-[var(--color-muted-foreground)]">
          <p>
            You are signed in as{" "}
            <span className="font-medium text-[var(--color-foreground)]">
              {ROLE_LABELS[role]}
            </span>
            . The <strong className="text-[var(--color-foreground)]">{pageName}</strong>{" "}
            workspace requires different permissions.
          </p>
          <p>
            Use the navigation menu to open pages assigned to your role, or click
            Change Role in the top bar to select a different persona.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => {
              clearRole();
              navigate("/");
            }}
          >
            Change Role
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
