import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Application } from "./app.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import "./index.css";

export function renderToDom(container: HTMLElement) {
  createRoot(container).render(
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Application />
      </ThemeProvider>
    </BrowserRouter>
  );
}
