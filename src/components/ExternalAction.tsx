import type { MouseEventHandler, ReactNode } from "react";

interface ExternalActionProps {
  href?: string;
  children: ReactNode;
  className?: string;
  onUnavailable: () => void;
  ariaLabel?: string;
}

export function ExternalAction({ href, children, className = "", onUnavailable, ariaLabel }: ExternalActionProps) {
  if (href) {
    const isInternal = href.startsWith("#");
    return (
      <a className={className} href={href} target={isInternal ? undefined : "_blank"} rel={isInternal ? undefined : "noreferrer"} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    onUnavailable();
  };

  return (
    <button className={`${className} link-button`} type="button" onClick={handleClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
