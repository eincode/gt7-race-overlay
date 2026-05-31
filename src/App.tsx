import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OverlayPage } from './pages/OverlayPage';
import { ControlPage } from './pages/ControlPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/control" replace />} />
        <Route path="/overlay/stencil" element={<OverlayPage />} />
        <Route path="/control" element={<ControlPage />} />
      </Routes>
    </BrowserRouter>
  );
}
