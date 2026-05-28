import { cn } from "@/lib/utils";

export function HeiaLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-11 w-11 shrink-0">
        <span
          className="absolute left-0 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#EB001B]"
          aria-hidden
        />
        <span
          className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#F79E1B] opacity-90"
          aria-hidden
        />
      </div>
      <span className="text-xl font-bold tracking-tight text-white">HEIA</span>
    </div>
  );
}

export function HeiaLogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-14 w-14", className)}>
      <span
        className="absolute left-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#EB001B]"
        aria-hidden
      />
      <span
        className="absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#F79E1B] opacity-90"
        aria-hidden
      />
    </div>
  );
}
