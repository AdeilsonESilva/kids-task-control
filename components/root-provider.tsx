import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/components/query-provider";
import { SummaryProvider } from "@/components/summary-provider";
import { Toaster } from "@/components/ui/toaster";

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <QueryProvider>
          <SummaryProvider>{children}</SummaryProvider>
          <Toaster />
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
