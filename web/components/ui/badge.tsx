import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blue-600 text-white",
        secondary: "border-transparent bg-zinc-100 text-zinc-900",
        outline: "border-zinc-200 text-zinc-900",
        draft: "border-transparent bg-zinc-100 text-zinc-600",
        sent: "border-transparent bg-blue-100 text-blue-700",
        submitted: "border-transparent bg-orange-100 text-orange-700",
        changes_requested: "border-transparent bg-yellow-100 text-yellow-700",
        approved: "border-transparent bg-green-100 text-green-700",
        destructive: "border-transparent bg-red-100 text-red-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
