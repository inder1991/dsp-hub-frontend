import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaults = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function SearchIcon(props: IconProps) {
  return <svg {...defaults} {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4.5-4.5" /></svg>;
}

export function BellIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
}

export function ChevronDownIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="m7 10 5 5 5-5" /></svg>;
}

export function ChevronRightIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="m9 18 6-6-6-6" /></svg>;
}

export function ArrowRightIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></svg>;
}

export function ArrowLeftIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M19 12H5" /><path d="m10 7-5 5 5 5" /></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="m6 12 4 4 8-9" /></svg>;
}

export function WarningIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v5" /><path d="M12 17h.01" /></svg>;
}

export function ClockIcon(props: IconProps) {
  return <svg {...defaults} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

export function HomeIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></svg>;
}

export function MyDspIcon(props: IconProps) {
  return <svg {...defaults} {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
}

export function DevelopIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="m8 9-4 3 4 3" /><path d="m16 9 4 3-4 3" /><path d="m14 5-4 14" /></svg>;
}

export function SystemsIcon(props: IconProps) {
  return <svg {...defaults} {...props}><rect x="3" y="4" width="18" height="6" rx="1" /><rect x="3" y="14" width="18" height="6" rx="1" /><path d="M7 7h.01M7 17h.01" /></svg>;
}

export function ChangesIcon(props: IconProps) {
  return <svg {...defaults} {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
}

export function SupportIcon(props: IconProps) {
  return <svg {...defaults} {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="m5.6 5.6 4.3 4.3M14.1 14.1l4.3 4.3M18.4 5.6l-4.3 4.3M9.9 14.1l-4.3 4.3" /></svg>;
}

export function DocumentationIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H11v18H6.5A2.5 2.5 0 0 0 4 22V4.5Z" /><path d="M20 4.5A2.5 2.5 0 0 0 17.5 2H13v18h4.5A2.5 2.5 0 0 1 20 22V4.5Z" /></svg>;
}

export function ExternalLinkIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></svg>;
}

export function CubeIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 7 9 5 9-5M12 12v10M3 7v10l9 5 9-5V7" /></svg>;
}

export function LockIcon(props: IconProps) {
  return <svg {...defaults} {...props}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>;
}

export function PackageIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 7 9 5 9-5M3 7v10l9 5 9-5V7M8 4.2l9 5" /></svg>;
}

export function ComputeIcon(props: IconProps) {
  return <svg {...defaults} {...props}><rect x="3" y="4" width="18" height="6" rx="1" /><rect x="3" y="14" width="18" height="6" rx="1" /><path d="M7 7h.01M7 17h.01M16 7h2M16 17h2" /></svg>;
}

export function DatabaseIcon(props: IconProps) {
  return <svg {...defaults} {...props}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></svg>;
}

export function NetworkIcon(props: IconProps) {
  return <svg {...defaults} {...props}><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="18" r="2.5" /><circle cx="19" cy="18" r="2.5" /><path d="m10.8 7.2-4.6 8.6M13.2 7.2l4.6 8.6M7.5 18h9" /></svg>;
}

export function SigmaIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M18 4H6l6 8-6 8h12" /></svg>;
}

export function GuideIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z" /></svg>;
}

export function ChatIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M21 15a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V7a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v8Z" /><path d="M7 9h10M7 13h6" /></svg>;
}

export function TicketIcon(props: IconProps) {
  return <svg {...defaults} {...props}><path d="M4 3h11l5 5v13H4V3Z" /><path d="M15 3v5h5M8 13h8M8 17h6" /></svg>;
}

export function OnboardingIcon(props: IconProps) {
  return <svg {...defaults} {...props}><circle cx="9" cy="8" r="4" /><path d="M2.5 21v-2a6.5 6.5 0 0 1 13 0v2M18 8v6M15 11h6" /></svg>;
}

export function CalendarIcon(props: IconProps) {
  return <svg {...defaults} {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>;
}

export function PlayIcon(props: IconProps) {
  return <svg {...defaults} {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m10 9 5 3-5 3V9Z" /></svg>;
}
