
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SubscriptionProvider, useSubscription } from "./context/SubscriptionContext";
import Index from "./pages/Index";
import LoginRegister from "./pages/LoginRegister";
import NotFound from "./pages/NotFound";
import UpgradeModal from "./components/UpgradeModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppWithSubscription() {
  const { subscribed, planType, isLoading } = useSubscription();
  
  const shouldShowUpgradeModal = !isLoading && !subscribed && planType === 'free';

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <UpgradeModal isOpen={shouldShowUpgradeModal} />
    </>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {isAuthenticated ? (
            <SubscriptionProvider>
              <AppWithSubscription />
            </SubscriptionProvider>
          ) : (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LoginRegister />} />
                <Route path="/login" element={<LoginRegister />} />
                <Route path="*" element={<LoginRegister />} />
              </Routes>
            </BrowserRouter>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
