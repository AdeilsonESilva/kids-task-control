"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";

export function LogoutButton() {
  const { signOut } = useAuth();

  return (
    <Button variant="ghost" onClick={signOut}>
      Sair
    </Button>
  );
}
