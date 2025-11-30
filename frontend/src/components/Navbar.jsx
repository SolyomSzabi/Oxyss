import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Scissors } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import logo from "@/assets/logo.jpg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/services', label: t('nav.services') },
    { href: '/gallery', label: t('nav.gallery') },
    // { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {/* <div className="bg-zinc-900 p-2 rounded-lg"> */}
             {/* <img 
              src={logo}
              alt="Icon" 
              className="h-11 w-11 object-contain"
            /> */}
               {/* </div> */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold font-heading text-zinc-900 leading-tight">
                Oxy'ss
              </h1>
              <p className="text-xs text-zinc-600 -mt-0.5 leading-tight">Style</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-medium transition-colors hover:text-yellow-600 ${
                  isActive(link.href)
                    ? 'text-yellow-600 border-b-2 border-yellow-600 pb-1'
                    : 'text-zinc-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* <LanguageSwitcher /> */}
            <Link to="/booking">
              <Button 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6"
                data-testid="navbar-book-appointment-btn"
              >
                {t('nav.bookAppointment')}
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {/* <LanguageSwitcher /> */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center space-x-2">
                    <div className="bg-zinc-900 p-2 rounded-lg">
                      <Scissors className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-xl font-bold font-heading text-zinc-900 leading-tight">
                        Oxy'ss
                      </h1>
                      <p className="text-xs text-zinc-600 -mt-0.5 leading-tight">Barbershop</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-lg font-medium transition-colors hover:text-yellow-600 ${
                          isActive(link.href) ? 'text-yellow-600' : 'text-zinc-700'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link to="/booking" onClick={() => setIsOpen(false)}>
                      <Button 
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold w-full"
                        data-testid="mobile-book-appointment-btn"
                      >
                        {t('nav.bookAppointment')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
