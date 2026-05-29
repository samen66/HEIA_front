import { cn } from "@/lib/utils";

type HeiaLogoProps = {
  className?: string;
  variant?: "light" | "dark";
};

export function HeiaLogo({ className, variant = "dark" }: HeiaLogoProps) {
  const src = variant === "light" ? "/logo_light.jpeg" : "/logo.jpeg";

  return (
    <img
      src={src}
      alt="HEIS — Hidden Entrepreneur Intelligence System"
      className={cn("h-11 w-auto object-contain", className)}
    />
  );
}

export function HeiaLogoMark({ className, variant = "light" }: HeiaLogoProps) {
  const src = variant === "light" ? "/logo_light.jpeg" : "/logo.jpeg";

  return (
    <img
      src={src}
      alt="HEIS — Hidden Entrepreneur Intelligence System"
      className={cn("h-14 w-auto object-contain", className)}
    />
  );
}
