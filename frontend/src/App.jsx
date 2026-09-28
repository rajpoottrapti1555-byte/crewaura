import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/organizer" element={<OrganizerDashboard />} />

<Route path="/professional" element={<ProfessionalDashboard />} />

        <Route
          path="/professional-profile"
          element={<ProfessionalProfile />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;