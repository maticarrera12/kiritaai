import { CheckmarkCircle02Icon, CircleIcon, FireIcon } from "hugeicons-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface QuestProps {
  title: string;
  description: string;
  progress: number;
  target: number;
  xp: number;
  isCompleted: boolean;
}

export function QuestItem({ title, description, progress, target, xp, isCompleted }: QuestProps) {
  const percentage = Math.min(100, Math.round((progress / target) * 100));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "p-3 rounded-xl border transition-all cursor-default",
            isCompleted
              ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30 opacity-80"
              : "bg-card border-border hover:border-primary/30"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-start gap-2.5">
              <div
                className={cn("mt-0.5", isCompleted ? "text-green-500" : "text-muted-foreground")}
              >
                {isCompleted ? <CheckmarkCircle02Icon size={16} /> : <CircleIcon size={16} />}
              </div>
              <div>
                <p
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                  )}
                >
                  {title}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-0.5">
                    <FireIcon size={10} /> +{xp} XP
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {progress}/{target}
            </span>
          </div>

          {/* Barra de Progreso */}
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                isCompleted ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-[220px] p-3">
        <p className="font-semibold text-sm mb-1">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">
            Progress: {progress}/{target}
          </span>
          <span className="text-[10px] font-bold text-yellow-500">+{xp} XP</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
