import { WebSocketProvider } from "@/contexts/web-socket-context.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider.tsx";
import "./index.css";
import { LandingPage } from "./landing";
import Platform from "./platform";

const queryClient = new QueryClient();

// eslint-disable-next-line react-refresh/only-export-components
function Application() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/platform" element={<Platform />} />
    </Routes>
  );
}

export function renderToDom(container: HTMLElement) {
  createRoot(container).render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Application />
            <Toaster />
          </ThemeProvider>
        </WebSocketProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </BrowserRouter>
  );
}
