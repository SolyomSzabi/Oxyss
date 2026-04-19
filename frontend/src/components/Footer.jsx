import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scissors, MapPin, Clock, Phone, Mail, Code } from 'lucide-react';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const Footer = () => {
  const { t } = useTranslation();

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
                <h2 className="text-3xl font-bold font-heading">{t('footer.brand.name')}</h2>
                <p className="text-yellow-400 font-medium">{t('footer.brand.tagline')}</p>
              </div>
            </div>
            <p className="text-zinc-300 mb-6 max-w-md">
              {t('footer.brand.description')}
            </p>
            <div className="flex space-x-4">
              <div
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors cursor-pointer"
                onClick={() => window.location.href = "https://www.facebook.com/Oxystylemcrew/"}
              >
                <FacebookIcon />
              </div>
              <div
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors cursor-pointer"
                onClick={() => window.location.href = "https://www.instagram.com/__oxyss?igsh=MTRmaWtnbjJ6Ym13NA=="}
              >
                <InstagramIcon />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-zinc-300 hover:text-yellow-400 transition-colors">
                  {t('footer.quickLinks.home')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-zinc-300 hover:text-yellow-400 transition-colors">
                  {t('footer.quickLinks.services')}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-zinc-300 hover:text-yellow-400 transition-colors">
                  {t('footer.quickLinks.gallery')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-zinc-300 hover:text-yellow-400 transition-colors">
                  {t('footer.quickLinks.contact')}
                </Link>
              </li>
              {/* Legal links */}
              <li className="pt-2 border-t border-zinc-800 mt-2">
                <Link to="/privacy" className="text-zinc-400 hover:text-yellow-400 transition-colors text-sm">
                  Politică de Confidențialitate
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-zinc-400 hover:text-yellow-400 transition-colors text-sm">
                  Politică de Cookie-uri
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-zinc-400 hover:text-yellow-400 transition-colors text-sm">
                  Termeni și Condiții
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contactInfo.title')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span className="text-zinc-300 text-sm">
                  {t('footer.contactInfo.address')}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span className="text-zinc-300 text-sm">{t('footer.contactInfo.phone')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-yellow-400" />
                <span className="text-zinc-300 text-sm">{t('footer.contactInfo.email')}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-yellow-400 mt-1" />
                <div className="text-zinc-300 text-sm">
                  <p>{t('footer.contactInfo.hours.weekdays')}</p>
                  <p>{t('footer.contactInfo.hours.saturday')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-zinc-400 text-sm">
                {t('footer.bottom.copyright')}
              </p>
              {/* Legal mini-links repeated for easy access */}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <Link to="/privacy" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
                  Confidențialitate
                </Link>
                <span className="text-zinc-700 text-xs">·</span>
                <Link to="/cookies" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
                  Cookie-uri
                </Link>
                <span className="text-zinc-700 text-xs">·</span>
                <Link to="/terms" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
                  Termeni
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/barber-dashboard" className="text-zinc-400 hover:text-yellow-400 text-sm transition-colors">
                {t('footer.bottom.staffLogin')}
              </Link>
            </div>
          </div>

          {/* Web Developer Credit */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-yellow-400" />
                <span>{t('footer.developer.madeBy')}</span>
                <span className="text-yellow-400 font-semibold">Sólyom Szabolcs</span>
              </div>
              <span className="hidden md:inline">•</span>
              <a
                href="tel:+40742345678"
                className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
              >
                <Phone className="h-3 w-3" />
                <span>+40 757 630 225</span>
              </a>
              <span className="hidden md:inline">•</span>
              <span className="text-zinc-600">{t('footer.developer.websiteDesign')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;