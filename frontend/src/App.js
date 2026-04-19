import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";
import "./i18n";

// Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import BarberDashboard from "./pages/BarberDashboard";
import BarberLogin from "./pages/BarberLogin";
import AllAppointments from "./pages/AllAppointments";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

// Components
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import CookieBanner from "./components/CookieBanner";

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
              {/* Legal pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
            </Routes>
          </main>
          <Footer />
          <CookieBanner />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;