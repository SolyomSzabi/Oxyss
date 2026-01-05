import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, MapPin, Clock, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-yellow-600 p-2 rounded-lg">
                <Scissors className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold font-heading">Oxy'ss</h2>
                <p className="text-yellow-400 font-medium">Premium Hair Studio</p>
              </div>
            </div>
            <p className="text-zinc-300 mb-6 max-w-md">
              Experience the finest in hairstyling services at Oxy'ss. Our skilled hairdressers 
              combine traditional techniques with modern style to give you the perfect cut.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors cursor-pointer">
                <span className="text-sm font-bold">fb</span>
              </div>
              <div
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors cursor-pointer"
                onClick={() => window.location.href = "https://www.instagram.com/__oxyss?igsh=MTRmaWtnbjJ6Ym13NA=="}
              >
                <span className="text-sm font-bold">ig</span>
              </div>
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors cursor-pointer">
                <span className="text-sm font-bold">tw</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-zinc-300 hover:text-yellow-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className="text-zinc-300 hover:text-yellow-400 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/gallery" 
                  className="text-zinc-300 hover:text-yellow-400 transition-colors"
                >
                  Gallery
                </Link>
              </li>
              {/* <li>
                <Link 
                  to="/about" 
                  className="text-zinc-300 hover:text-yellow-400 transition-colors"
                >
                  About
                </Link>
              </li> */}
              <li>
                <Link 
                  to="/contact" 
                  className="text-zinc-300 hover:text-yellow-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span className="text-zinc-300 text-sm">
                  Str. Ratinului, nr.959, Crasna, Sălaj, Romania
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span className="text-zinc-300 text-sm">+40 74 116 1016</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-yellow-400" />
                <span className="text-zinc-300 text-sm">oxyssstyle@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-yellow-400 mt-1" />
                <div className="text-zinc-300 text-sm">
                  <p>Mon-Fri: 9AM - 7PM</p>
                  <p>Sat: 9AM - 1PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-400 text-sm">
            © 2025 Oxy'ss Barbershop. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link to="/barber-dashboard" className="text-zinc-400 hover:text-yellow-400 text-sm transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;