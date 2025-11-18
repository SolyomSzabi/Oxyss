import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin, Scissors, Award, Users } from 'lucide-react';
import heroImg from "@/assets/hero2.jpg";
import gallery1 from "@/assets/gallery1.jpg";
import gallery2 from "@/assets/gallery2.jpg";
import gallery3 from "@/assets/gallery3.jpg";
import gallery4 from "@/assets/gallery4.jpg";

const Home = () => {
  const { t } = useTranslation();
  const services = [
    {
      name: "Men's Haircut",
      price: '63 RON',
      duration: '30 min',
      description: 'Washing • Cutting • Styling'
    },
    {
      name: "Men's BRONZE",
      price: '85 RON',
      duration: '45 min',
      description: 'Haircut • Beard Trim'
    },
    {
      name: "Men's OXY’SS GOLD",
      price: '170 RON',
      duration: '90 min',
      description: 'Hair wash with head massage • Haircut • Beard • Styling • Eyebrows • Ears • Nose'
    }
  ];

  const features = [
    {
      icon: <Scissors className="h-8 w-8 text-yellow-600" />,
      titleKey: 'home.whyChoose.experience.title',
      descKey: 'home.whyChoose.experience.desc'
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-600" />,
      titleKey: 'home.whyChoose.quality.title',
      descKey: 'home.whyChoose.quality.desc'
    },
    {
      icon: <Users className="h-8 w-8 text-yellow-600" />,
      titleKey: 'home.whyChoose.atmosphere.title',
      descKey: 'home.whyChoose.atmosphere.desc'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImg})`
          }}
        />
        <div className="hero-overlay" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <Badge className="mb-6 bg-yellow-600/20 text-yellow-400 border-yellow-400/30 px-4 py-2">
            {t('home.hero.title')}
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 leading-tight">
            Welcome to
            <span className="block text-gradient">Oxy'ss Style</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/booking">
              <Button 
                size="lg" 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 text-lg"
                data-testid="hero-book-appointment-btn"
              >
                {t('home.hero.bookNow')}
              </Button>
            </Link>
            <Link to="/services">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-zinc-900 px-8 py-3 text-lg"
                data-testid="hero-view-services-btn"
              >
                {t('home.hero.viewServices')}
              </Button>
            </Link>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-gray-300">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-yellow-400" />
              <span>Str. Ratinului, nr.959, Crasna, Sălaj, Romania</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span>Open 9AM - 7PM</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span>5/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section-padding bg-white" data-testid="services-preview-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 mb-4">
              {t('home.services.title')}
            </h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.map((service, index) => (
              <Card key={index} className="service-card group cursor-pointer" data-testid={`service-card-${index}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-zinc-900">
                      {service.name}
                    </h3>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {service.duration}
                    </Badge>
                  </div>
                  <p className="text-zinc-600 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-yellow-600">
                      {service.price}
                    </span>
                    <Link to="/booking">
                      <Button 
                        size="sm" 
                        className="bg-zinc-900 hover:bg-zinc-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`book-service-btn-${index}`}
                      >
                        {t('home.hero.bookNow')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/services">
              <Button 
                size="lg" 
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-8"
                data-testid="view-all-services-btn"
              >
                {t('home.services.viewAll')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us 
      <section className="section-padding bg-zinc-50" data-testid="why-choose-us-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 mb-4">
              Why Choose Oxy'ss?
            </h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Experience the difference that quality, expertise, and attention to detail make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group" data-testid={`feature-${index}`}>
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>*/}

      {/* Gallery Preview */}
      <section className="section-padding bg-white" data-testid="gallery-preview-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 mb-4">
              Our Work Speaks
            </h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              See the transformation and craftsmanship that sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              gallery1,
              gallery2,
              gallery3,
              gallery4,
            ].map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg group cursor-pointer" data-testid={`gallery-image-${index}`}>
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/gallery">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white px-8"
                data-testid="view-gallery-btn"
              >
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-zinc-900 text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Ready for a Fresh Look?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the Oxy'ss difference. 
            Walk in ordinary, walk out extraordinary.
          </p>
          <Link to="/booking">
            <Button 
              size="lg" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 text-lg"
              data-testid="cta-book-appointment-btn"
            >
              Book Your Appointment Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;