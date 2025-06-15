
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import LoginRegister from "./pages/LoginRegister";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <LanguageProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {isAuthenticated ? (
                <>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<LoginRegister />} />
                  <Route path="/login" element={<LoginRegister />} />
                  <Route path="*" element={<LoginRegister />} />
                </>
              )}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
