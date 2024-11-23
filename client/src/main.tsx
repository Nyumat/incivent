import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./components/theme-provider.tsx";
import "./index.css";
import { LandingPage } from "./landing";
import Platform from "./platform";

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
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Application />
      </ThemeProvider>
    </BrowserRouter>
  );
}
