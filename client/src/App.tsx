import { Route, Routes } from "react-router";
import { LandingPage } from "./landing";
import Platform from "./platform";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/platform" element={<Platform />} />
    </Routes>
  );
}
