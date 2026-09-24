import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ControlV2 } from "./components/control-v2/ControlV2";
import QualifyingStandingsOverlay from "./components/overlays/stencil/qualifying/result";
import RaceStandingsOverlay from "./components/overlays/stencil/race/result";
import { ControlPage } from "./pages/ControlPage";
import { OverlayPage } from "./pages/OverlayPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/control" replace />} />
        <Route path="/overlay/stencil" element={<OverlayPage />} />
        <Route path="/control" element={<ControlPage />} />
        <Route path="/control/v2" element={<ControlV2 />} />
        <Route
          path="/result/qualifying"
          element={<QualifyingStandingsOverlay />}
        />
        <Route path="/result/race" element={<RaceStandingsOverlay />} />
      </Routes>
    </BrowserRouter>
  );
}
