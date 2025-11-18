import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";
import "./i18n";

// Import pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import BarberDashboard from "./pages/BarberDashboard";
import BarberLogin from "./pages/BarberLogin";
import AllAppointments from "./pages/AllAppointments";
import { AuthProvider } from "./contexts/AuthContext";

// Import components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <div className="App min-h-screen bg-zinc-50">
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/gallery" element={<Gallery />} />
              {/* <Route path="/about" element={<About />} /> */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/barber-login" element={<BarberLogin />} />
              <Route path="/barber-dashboard" element={<BarberDashboard />} />
              <Route path="/all-appointments" element={<AllAppointments />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;