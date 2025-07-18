"use client";

import { Menu, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
export default function MobileHeader() {
  const isMobile = useIsMobile();
  const { toggle } = useSidebarStore();

  if (!isMobile) return null;

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background md:hidden">
      <Link href="/dashboard">
        <div className="flex items-center gap-2">
          <Hotel className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">예약관리 솔루션</h1>
        </div>
      </Link>
      <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  );
}
