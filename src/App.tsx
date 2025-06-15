
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SupabaseEventsProvider } from "./context/SupabaseEventsContext";
import { SupabaseRevisionsProvider } from "./context/SupabaseRevisionsContext";
import { SupabaseFlashcardsProvider } from "./context/SupabaseFlashcardsContext";
import Index from "./pages/Index";
import LoginRegister from "./pages/LoginRegister";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {isAuthenticated ? (
              <SupabaseEventsProvider>
                <SupabaseRevisionsProvider>
                  <SupabaseFlashcardsProvider>
                    <Routes>
                      <Route path="/login" element={<Navigate to="/" replace />} />
                      <Route 
                        path="/" 
                        element={
                          <ProtectedRoute>
                            <Index />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Index />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </SupabaseFlashcardsProvider>
                </SupabaseRevisionsProvider>
              </SupabaseEventsProvider>
            ) : (
              <Routes>
                <Route path="/login" element={<LoginRegister />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
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
