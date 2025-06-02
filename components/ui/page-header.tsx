"use client"; // Important because MainNav is a client component

import Link from "next/link";
import { MainNav } from "@/components/main-nav";

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold text-primary hover:underline cursor-pointer">
            {title}
          </h1>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
