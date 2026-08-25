import { CheckIcon, ClockIcon, WarningIcon } from "./Icons";
import type { ItemState } from "../types/dashboard";

interface StatusMarkProps {
  state: ItemState;
  size?: "small" | "medium" | "large";
}

const successfulStates = new Set<ItemState>(["operational", "running", "completed", "healthy", "no_action"]);
const warningStates = new Set<ItemState>(["degraded", "needs_attention"]);

export function StatusMark({ state, size = "small" }: StatusMarkProps) {
  const tone = successfulStates.has(state)
    ? "success"
    : warningStates.has(state)
      ? "warning"
      : state === "major_issue" || state === "action_required"
        ? "danger"
        : "informational";

  return (
    <span className={`status-mark status-mark--${tone} status-mark--${size}`} aria-hidden="true">
      {tone === "success" && <CheckIcon />}
      {(tone === "warning" || tone === "danger") && <WarningIcon />}
      {tone === "informational" && <ClockIcon />}
    </span>
  );
}
