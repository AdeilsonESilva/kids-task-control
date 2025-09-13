import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/toaster";
import StoreProvider from "@/app/StoreProvider";

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
          <StoreProvider>
            {children}
          </StoreProvider>
          <Toaster />
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
