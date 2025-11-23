import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-yellow-600" />,
      title: 'Visit Us',
      details: ['Str. Ratinului, nr.959', 'Crasna, Sălaj, Romania'],
      action: 'Get Directions'
    },
    {
      icon: <Phone className="h-6 w-6 text-yellow-600" />,
      title: 'Call Us',
      details: ['+40 74 116 1016'],
      action: 'Call Now'
    },
    {
      icon: <Mail className="h-6 w-6 text-yellow-600" />,
      title: 'Email Us',
      details: ['oxyssstyle@gmail.com'],
      action: 'Send Email'
    }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 7:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 1:00 PM' },
    // { day: 'Sunday', hours: '10:00 AM - 4:00 PM' }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Header Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-zinc-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
            Get in touch with us for appointments, questions, or just to say hello. 
            We're here to help you look and feel your best.
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold font-heading text-zinc-900 mb-6">
                  Get in Touch
                </h2>
                <p className="text-lg text-zinc-600 mb-8">
                  We'd love to hear from you. Whether you're looking to book an appointment, 
                  have questions about our services, or want to provide feedback, don't hesitate to reach out.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid={`contact-info-${index}`}>
                    <CardContent className="p-0">
                      <div className="flex items-start space-x-4">
                        <div className="bg-yellow-100 rounded-full p-3 flex-shrink-0">
                          {info.icon}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-zinc-900 mb-2">
                            {info.title}
                          </h3>
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-zinc-600 text-sm">
                              {detail}
                            </p>
                          ))}
                          {/* {info.action && (
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-yellow-600 hover:text-yellow-700 mt-2"
                              data-testid={`contact-action-${index}`}
                            >
                              {info.action}
                            </Button>
                          )} */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Business Hours */}
              <div className="max-w-3xl mx-auto">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span>Business Hours</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {businessHours.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <span className="font-medium text-zinc-900">{schedule.day}</span>
                          <span className="text-zinc-600">{schedule.hours}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        We're open 6 days a week for your convenience
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-zinc-900 mb-6">
              Find Us
            </h2>
            {/* <p className="text-xl text-zinc-600">
              Located in the heart of Downtown, we're easily accessible and offer convenient parking.
            </p> */}
          </div>

          <div className="relative w-full h-[450px] rounded-xl overflow-hidden shadow-lg">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2712.6948477512888!2d22.86645967677371!3d47.16383061844748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x474865cedc1de883%3A0xeb99241c438a7776!2sOxyss%20Style!5e0!3m2!1shu!2sro!4v1763506134238!5m2!1shu!2sro"
    className="absolute top-0 left-0 w-full h-full"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  />
</div>


          {/* <div className="bg-zinc-100 rounded-lg h-96 flex items-center justify-center" data-testid="map-placeholder">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-600 font-medium">Interactive Map</p>
              <p className="text-sm text-zinc-500">123 Style Street, Downtown, NY 10001</p>
              <Button 
                variant="link" 
                className="text-yellow-600 hover:text-yellow-700 mt-2"
                data-testid="directions-btn"
              >
                Get Directions
              </Button>
            </div>
          </div> */}
          
          {/* <div className="mt-8 text-center">
            <div className="bg-zinc-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-zinc-900 mb-2">Parking & Accessibility</h3>
              <p className="text-zinc-600 text-sm">
                Street parking available. Wheelchair accessible entrance. 
                Public transportation: Bus stops within 2 blocks, Metro station 0.3 miles away.
              </p>
            </div>
          </div> */}
        </div>
      </section>
    </div>
  );
};

export default Contact;