import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Scissors, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError('Failed to load services');
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
          <p className="text-zinc-600">Loading services...</p>
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
            Try Again
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
            Our Services
          </h1>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto mb-8">
            Discover our comprehensive range of premium grooming services, each crafted 
            with precision and care to give you the perfect look.
          </p>
          <Link to="/booking">
            <Button 
              size="lg" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8"
              data-testid="services-book-now-btn"
            >
              Book Appointment
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
                  {category}'s Services
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
                            {service.name}
                          </CardTitle>
                          <Scissors className="h-5 w-5 text-yellow-600" />
                        </div>
                        <p className="text-zinc-600 leading-relaxed">
                          {service.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-zinc-400" />
                              <span className="text-sm text-zinc-600">{service.duration} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-lg font-bold text-yellow-600">From {service.base_price} RON</span>
                            </div>
                          </div>
                        </div>
                        <Link to="/booking" state={{ selectedService: service }}>
                          <Button 
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`book-service-${service.id}`}
                          >
                            Book This Service
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

      {/* Service Categories */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-zinc-900 mb-6">
              What Makes Our Services Special?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center" data-testid="service-feature-precision">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Scissors className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Precision Cuts</h3>
              <p className="text-zinc-600">
                Every cut is executed with meticulous attention to detail and years of expertise.
              </p>
            </div>

            <div className="text-center" data-testid="service-feature-products">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧴</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Premium Products</h3>
              <p className="text-zinc-600">
                We use only the finest grooming products and professional-grade tools.
              </p>
            </div>

            <div className="text-center" data-testid="service-feature-consultation">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Personal Consultation</h3>
              <p className="text-zinc-600">
                Each service begins with a consultation to understand your style and preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Information */}
      <section className="section-padding bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            Personalized Pricing
          </h2>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Our experienced hairdressers offer services at different pricing levels based on their 
            expertise and specializations. Choose your preferred hairdresser during booking to see exact pricing.
          </p>
          <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
            <p className="text-yellow-200 text-sm">
              <strong>*Pricing Note:</strong> Prices shown are starting rates. Each hairdresser has their own pricing 
              based on experience and specializations. Final pricing will be confirmed when you select 
              your preferred hairdresser during the booking process.
            </p>
          </div>
          
          {/* <div className="bg-zinc-800 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400 mb-1">Average Service Time</p>
                <p className="text-2xl font-bold text-yellow-400">30 - 120 min</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Price Range</p>
                <p className="text-2xl font-bold text-yellow-400">38 - 200 RON</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Payment Methods</p>
                <p className="text-lg text-white">Cash • Card • Digital</p>
              </div>
            </div>
          </div> */}

          <Link to="/booking">
            <Button 
              size="lg" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8"
              data-testid="pricing-book-now-btn"
            >
              Book Your Service Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;