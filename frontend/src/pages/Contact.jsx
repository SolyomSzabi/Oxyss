import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API}/contact`, formData);
      
      if (response.data) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-yellow-600" />,
      title: 'Visit Us',
      details: ['123 Style Street', 'Downtown, NY 10001'],
      action: 'Get Directions'
    },
    {
      icon: <Phone className="h-6 w-6 text-yellow-600" />,
      title: 'Call Us',
      details: ['(555) 123-4567'],
      action: 'Call Now'
    },
    {
      icon: <Mail className="h-6 w-6 text-yellow-600" />,
      title: 'Email Us',
      details: ['info@oxyssbarbershop.com'],
      action: 'Send Email'
    },
    {
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
      title: 'Hours',
      details: ['Mon-Fri: 9AM - 8PM', 'Sat: 8AM - 6PM', 'Sun: 10AM - 4PM'],
      action: ''
    }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 4:00 PM' }
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold font-heading text-zinc-900 mb-6">
                  Get in Touch
                </h2>
                <p className="text-lg text-zinc-600 mb-8">
                  We'd love to hear from you. Whether you're looking to book an appointment, 
                  have questions about our services, or want to provide feedback, don't hesitate to reach out.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {info.action && (
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-yellow-600 hover:text-yellow-700 mt-2"
                              data-testid={`contact-action-${index}`}
                            >
                              {info.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Business Hours */}
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

            {/* Contact Form */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-zinc-900">
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                    <div>
                      <Label htmlFor="name" className="text-zinc-700 font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-2 form-input"
                        placeholder="Enter your full name"
                        data-testid="contact-name-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-zinc-700 font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-2 form-input"
                        placeholder="Enter your email address"
                        data-testid="contact-email-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-zinc-700 font-medium">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        className="mt-2 form-input min-h-[120px]"
                        placeholder="Tell us how we can help you..."
                        data-testid="contact-message-input"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3"
                      data-testid="contact-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 p-4 bg-zinc-50 rounded-lg">
                    <p className="text-sm text-zinc-600">
                      <strong>Response Time:</strong> We typically respond to messages within 2-4 hours during business hours.
                      For urgent matters, please call us directly at (555) 123-4567.
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
            <p className="text-xl text-zinc-600">
              Located in the heart of Downtown, we're easily accessible and offer convenient parking.
            </p>
          </div>
          
          <div className="bg-zinc-100 rounded-lg h-96 flex items-center justify-center" data-testid="map-placeholder">
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
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-zinc-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-zinc-900 mb-2">Parking & Accessibility</h3>
              <p className="text-zinc-600 text-sm">
                Street parking available. Wheelchair accessible entrance. 
                Public transportation: Bus stops within 2 blocks, Metro station 0.3 miles away.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;