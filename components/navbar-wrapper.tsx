"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

// Pages that should NOT show the navbar
const HIDDEN_PATHS = ["/", "/admin", "/admin/dashboard"];

export function NavbarWrapper() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.includes(pathname)) return null;
  return <Navbar />;
}
