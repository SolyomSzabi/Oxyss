import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Clock, Star, Scissors, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { icon: <Users className="h-6 w-6" />, value: '5000+', label: 'Happy Customers' },
    { icon: <Award className="h-6 w-6" />, value: '15+', label: 'Years Experience' },
    { icon: <Star className="h-6 w-6" />, value: '4.9', label: 'Average Rating' },
    { icon: <Clock className="h-6 w-6" />, value: '6', label: 'Days a Week' }
  ];

  const team = [
    // {
    //   name: 'Marcus Rodriguez',
    //   role: 'Master Barber & Owner',
    //   experience: '15+ years',
    //   specialty: 'Classic cuts & styling',
    //   description: 'Founded Oxy\'ss with a vision of combining traditional barbering with modern techniques.',
    //   image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    // },
    // {
    //   name: 'James Thompson',
    //   role: 'Senior Barber',
    //   experience: '8+ years',
    //   specialty: 'Beard grooming & fades',
    //   description: 'Specializes in precision fades and contemporary styling with an eye for detail.',
    //   image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    // },
    {
      name: 'David Chen',
      role: 'Barber',
      experience: '5+ years',
      specialty: 'Modern cuts & hot shaves',
      description: 'Expert in modern styling and traditional hot towel shaves, bringing fresh perspectives.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face'
    }
  ];

  const values = [
    {
      icon: <Scissors className="h-8 w-8 text-yellow-600" />,
      title: 'Craftsmanship',
      description: 'Every cut is a work of art, executed with precision and attention to detail.'
    },
    {
      icon: <Heart className="h-8 w-8 text-yellow-600" />,
      title: 'Customer Care',
      description: 'We treat every client like family, ensuring comfort and satisfaction.'
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-600" />,
      title: 'Excellence',
      description: 'Continuous improvement and dedication to being the best in our craft.'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Hero Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-yellow-600/10 text-yellow-700 border-yellow-600/20 px-4 py-2">
                Established 2025
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-heading text-zinc-900 mb-6">
                About Oxy'ss
              </h1>
              <p className="text-xl text-zinc-600 mb-6 leading-relaxed">
                For over 15 years, Oxy'ss Barbershop has been the cornerstone of exceptional 
                men's grooming in Downtown. What started as a passion for traditional barbering 
                has evolved into a modern sanctuary where craftsmanship meets contemporary style.
              </p>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Our commitment to excellence, attention to detail, and genuine care for each 
                client has built a community of loyal customers who trust us with their image 
                and confidence.
              </p>
              <Link to="/booking">
                <Button 
                  size="lg" 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8"
                  data-testid="about-book-appointment-btn"
                >
                  Experience Oxy'ss
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1759134248487-e8baaf31e33e" 
                alt="Oxy'ss Barbershop Interior"
                className="rounded-lg shadow-2xl w-full"
                data-testid="about-hero-image"
              />
              {/* <div className="absolute -bottom-6 -right-6 bg-yellow-600 text-white p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">15+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Our Legacy in Numbers
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              These numbers represent our commitment to excellence and the trust our community has placed in us.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="bg-yellow-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-zinc-900 mb-6">
              Our Story
            </h2>
          </div>
          
          <div className="space-y-8 text-lg text-zinc-600 leading-relaxed">
            <p>
              <strong className="text-zinc-900">Oxy'ss Barbershop began in 2009</strong> when Marcus Rodriguez, 
              a passionate barber with a dream, opened the doors of our first location. With just two chairs 
              and an unwavering commitment to quality, Marcus set out to create more than just a barbershop—he 
              envisioned a place where tradition meets innovation.
            </p>
            
            <p>
              Over the years, we've grown from a small neighborhood shop to a renowned destination for discerning 
              gentlemen who appreciate the finer things in grooming. Our <strong className="text-zinc-900">philosophy</strong> 
              remains unchanged: treat every client with respect, deliver exceptional service, and never compromise on quality.
            </p>
            
            <p>
              Today, <strong className="text-zinc-900">Oxy'ss stands as a testament</strong> to what happens when 
              passion meets purpose. We've served thousands of clients, trained skilled barbers, and become an 
              integral part of the Downtown community. Our success is measured not just in cuts completed, but 
              in the confidence we help our clients carry into the world.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-zinc-900 mb-6">
              What We Stand For
            </h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Our values guide every interaction, every cut, and every relationship we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg" data-testid={`value-${index}`}>
                <CardContent className="pt-6">
                  <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-zinc-900 mb-6">
              Meet Our Master Barbers
            </h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Our team of skilled professionals brings decades of combined experience and genuine passion for the craft.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-testid={`team-member-${index}`}>
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-yellow-600 font-medium mb-2">{member.role}</p>
                  <div className="flex justify-center space-x-4 mb-4 text-sm text-zinc-600">
                    <span>📅 {member.experience}</span>
                    <span>✂️ {member.specialty}</span>
                  </div>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            Join the Oxy'ss Family
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the difference that comes from 15+ years of dedication to the craft. 
            Book your appointment today and discover why Oxy'ss is Downtown's premier barbershop.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking">
              <Button 
                size="lg" 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8"
                data-testid="about-cta-book-btn"
              >
                Book Appointment
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-zinc-900 px-8"
                data-testid="about-cta-contact-btn"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;