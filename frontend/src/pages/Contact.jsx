import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, CheckCircle, Cookie } from 'lucide-react';
import { useCookieConsent } from '@/components/CookieBanner';

const Contact = () => {
  const { t } = useTranslation();
  const { consent } = useCookieConsent();
  const googleAllowed = consent?.thirdParty === true;

  const openCookieSettings = () => {
    try {
      localStorage.removeItem("oxyss_cookie_consent");
    } catch {}
    window.location.reload();
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-yellow-600" />,
      titleKey: 'contact.info.visit.title',
      details: [
        t('contact.info.visit.address1'),
        t('contact.info.visit.address2')
      ],
      actionKey: 'contact.info.visit.action'
    },
    {
      icon: <Phone className="h-6 w-6 text-yellow-600" />,
      titleKey: 'contact.info.call.title',
      details: [t('contact.info.call.phone')],
      actionKey: 'contact.info.call.action'
    },
    {
      icon: <Mail className="h-6 w-6 text-yellow-600" />,
      titleKey: 'contact.info.email.title',
      details: [t('contact.info.email.address')],
      actionKey: 'contact.info.email.action'
    }
  ];

  const businessHours = [
    { 
      dayKey: 'contact.hours.weekdays', 
      hoursKey: 'contact.hours.weekdaysHours' 
    },
    { 
      dayKey: 'contact.hours.saturday', 
      hoursKey: 'contact.hours.saturdayHours' 
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Header Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-zinc-900 mb-6">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-heading text-zinc-900 mb-6">
                {t('contact.getInTouch.title')}
              </h2>
              <p className="text-lg text-zinc-600 mb-8">
                {t('contact.getInTouch.subtitle')}
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
                          {t(info.titleKey)}
                        </h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-zinc-600 text-sm">
                            {detail}
                          </p>
                        ))}
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
                    <span>{t('contact.hours.title')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {businessHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-zinc-900">{t(schedule.dayKey)}</span>
                        <span className="text-zinc-600">{t(schedule.hoursKey)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      {t('contact.hours.note')}
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
              {t('contact.map.title')}
            </h2>
          </div>

          <div className="relative w-full h-[450px] rounded-xl overflow-hidden shadow-lg">
            {googleAllowed ? (
              // ── Map loads only after Google cookies are accepted ──
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2712.6948477512888!2d22.86645967677371!3d47.16383061844748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x474865cedc1de883%3A0xeb99241c438a7776!2sOxyss%20Style!5e0!3m2!1shu!2sro!4v1763506134238!5m2!1shu!2sro"
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Oxy'ss Hair Studio pe hartă"
              />
            ) : (
              // ── Placeholder shown until cookies are accepted ──
              <div className="absolute inset-0 bg-zinc-100 flex flex-col items-center justify-center gap-4 text-center px-6">
                <div className="bg-zinc-200 rounded-full p-4">
                  <Cookie className="h-8 w-8 text-zinc-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-700 text-lg mb-1">
                    {t('contact.map.cookieBlocked.title', 'Harta necesită cookie-uri Google')}
                  </p>
                  <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                    {t(
                      'contact.map.cookieBlocked.desc',
                      'Acceptă cookie-urile Google pentru a vedea locația noastră pe hartă.'
                    )}
                  </p>
                </div>
                <button
                  onClick={openCookieSettings}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  {t('contact.map.cookieBlocked.button', 'Gestionează preferințele cookie')}
                </button>
                {/* Static fallback: show address instead */}
                <div className="mt-2 flex items-center gap-2 text-zinc-500 text-sm">
                  <MapPin className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <span>Str. Ratinului, nr. 959, Crasna, Sălaj, România</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;