"use client";

import { ReactNode } from "react";

interface ButtonProps {
  type: "submit" | "reset" | "button" | undefined;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const Button = ({
  type = "button",
  disabled = false,
  children,
  className,
  onClick,
}: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      type={type}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
