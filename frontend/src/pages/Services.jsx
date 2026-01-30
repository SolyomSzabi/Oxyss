import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Scissors, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Services = () => {
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get localized field
  const getLocalizedField = (item, fieldName) => {
    const currentLang = i18n.language;
    if (currentLang === 'hu') {
      return item[`${fieldName}_hu`] || item[fieldName] || '';
    } else if (currentLang === 'ro') {
      return item[`${fieldName}_ro`] || item[fieldName] || '';
    }
    return item[fieldName] || '';
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // First initialize services if needed
      await axios.post(`${API}/init-services`);
      // Then fetch all services
      const response = await axios.get(`${API}/services`);
      
      // Remove duplicate services by name, keeping the first occurrence
      const uniqueServices = [];
      const seenNames = new Set();
      
      for (const service of response.data) {
        if (!seenNames.has(service.name)) {
          seenNames.add(service.name);
          uniqueServices.push(service);
        }
      }
      
      setServices(uniqueServices);
    } catch (err) {
      setError(t('services.error'));
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-zinc-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchServices} variant="outline">
            {t('services.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Header Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-zinc-900 mb-6">
            {t('services.title')}
          </h1>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto mb-8">
            {t('services.subtitle')}
          </p>
          <Link to="/booking">
            <Button 
              size="lg" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8"
              data-testid="services-book-now-btn"
            >
              {t('services.bookAppointment')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Services Grid by Category */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {['Men', 'Women', 'Children'].map((category) => {
            const categoryServices = services.filter(s => s.category === category);
            
            if (categoryServices.length === 0) return null;
            
            return (
              <div key={category} className="mb-16 last:mb-0">
                <h2 className="text-3xl font-bold font-heading text-zinc-900 mb-8 text-center">
                  {t(`services.categories.${category.toLowerCase()}`)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryServices.map((service) => (
                    <Card 
                      key={service.id} 
                      className="service-card group hover:shadow-xl transition-all duration-300"
                      data-testid={`service-card-${service.id}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl font-semibold text-zinc-900">
                            {getLocalizedField(service, 'name')}
                          </CardTitle>
                          <Scissors className="h-5 w-5 text-yellow-600" />
                        </div>
                        <p className="text-zinc-600 leading-relaxed">
                          {getLocalizedField(service, 'description')}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-zinc-400" />
                              <span className="text-sm text-zinc-600">
                                {service.duration} {t('common.min')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-lg font-bold text-yellow-600">
                                {t('services.from')} {service.base_price} {t('common.currency')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link to="/booking" state={{ selectedService: service }}>
                          <Button 
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`book-service-${service.id}`}
                          >
                            {t('services.bookThisService')}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Service Features */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-zinc-900 mb-6">
              {t('services.whatMakesSpecial.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center" data-testid="service-feature-precision">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Scissors className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                {t('services.whatMakesSpecial.precision.title')}
              </h3>
              <p className="text-zinc-600">
                {t('services.whatMakesSpecial.precision.description')}
              </p>
            </div>

            <div className="text-center" data-testid="service-feature-products">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧴</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                {t('services.whatMakesSpecial.products.title')}
              </h3>
              <p className="text-zinc-600">
                {t('services.whatMakesSpecial.products.description')}
              </p>
            </div>

            <div className="text-center" data-testid="service-feature-consultation">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                {t('services.whatMakesSpecial.consultation.title')}
              </h3>
              <p className="text-zinc-600">
                {t('services.whatMakesSpecial.consultation.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Information */}
      <section className="section-padding bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            {t('services.pricing.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            {t('services.pricing.subtitle')}
          </p>
          <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
            <p className="text-yellow-200 text-sm">
              <strong>{t('services.pricing.noteTitle')}:</strong> {t('services.pricing.noteDescription')}
            </p>
          </div>

          <Link to="/booking">
            <Button 
              size="lg" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8"
              data-testid="pricing-book-now-btn"
            >
              {t('services.pricing.bookButton')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;