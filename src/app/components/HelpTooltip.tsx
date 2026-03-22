import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";

interface HelpTooltipProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function HelpTooltip({ content, side = "top", className = "" }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors ${className}`}
          onClick={(e) => e.preventDefault()}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface InfoTooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function InfoTooltip({ children, content, side = "top" }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex">
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-sm">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}