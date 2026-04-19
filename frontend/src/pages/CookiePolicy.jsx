import React from 'react';
import { Cookie, Settings, BarChart2, MapPin, Shield, ToggleLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Section = ({ icon: Icon, title, children }) => (
  <Card className="border-0 shadow-md mb-6">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-3 text-xl font-bold text-zinc-900">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <Icon className="h-5 w-5 text-yellow-600" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-zinc-600 leading-relaxed space-y-3">
      {children}
    </CardContent>
  </Card>
);

const CookieRow = ({ name, provider, purpose, duration, type }) => (
  <tr className="border-b border-zinc-100 last:border-0">
    <td className="p-3 font-mono text-sm text-zinc-800">{name}</td>
    <td className="p-3 text-sm">{provider}</td>
    <td className="p-3 text-sm text-zinc-600">{purpose}</td>
    <td className="p-3 text-sm">{duration}</td>
    <td className="p-3">
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
        type === 'Necesar' ? 'bg-green-100 text-green-700' :
        type === 'Funcțional' ? 'bg-blue-100 text-blue-700' :
        'bg-orange-100 text-orange-700'
      }`}>
        {type}
      </span>
    </td>
  </tr>
);

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Header */}
      <section className="bg-zinc-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-600 p-3 rounded-xl">
              <Cookie className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Politică de Cookie-uri
          </h1>
          <p className="text-zinc-300 text-lg">
            Oxy'ss Hair Studio — Ce cookie-uri folosim și cum le controlezi
          </p>
          <p className="text-zinc-500 text-sm mt-3">Ultima actualizare: Aprilie 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Intro */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <p className="text-zinc-700 leading-relaxed">
            Această pagină explică ce sunt cookie-urile, ce tipuri folosim pe site-ul{' '}
            <strong>oxyssstyle.ro</strong> și cum poți controla utilizarea lor. Prin utilizarea
            site-ului nostru și acceptarea cookie-urilor neesențiale, îți dai consimțământul
            pentru utilizarea lor conform acestei politici.
          </p>
        </div>

        <Section icon={Cookie} title="1. Ce sunt cookie-urile?">
          <p>
            Cookie-urile sunt fișiere text mici stocate pe dispozitivul tău (calculator, telefon,
            tabletă) atunci când vizitezi un site web. Ele permit site-ului să-și amintească
            acțiunile și preferințele tale pe o perioadă de timp.
          </p>
          <p>
            Cookie-urile nu pot accesa alte informații de pe dispozitivul tău și nu conțin viruși.
          </p>
        </Section>

        <Section icon={Settings} title="2. Tipurile de cookie-uri pe care le folosim">

          {/* Necessary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <h3 className="font-bold text-green-800">Cookie-uri Necesare (întotdeauna active)</h3>
            </div>
            <p className="text-sm text-green-700">
              Aceste cookie-uri sunt esențiale pentru funcționarea site-ului și nu pot fi dezactivate.
              Ele nu stochează date personale identificabile.
            </p>
          </div>

          {/* Functional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-blue-800">Cookie-uri Funcționale</h3>
            </div>
            <p className="text-sm text-blue-700">
              Permit funcționalități îmbunătățite (ex: memorizarea preferinței de limbă). Dezactivarea
              lor poate afecta unele funcționalități.
            </p>
          </div>

          {/* Third-party */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              <h3 className="font-bold text-orange-800">Cookie-uri Terțe (Google)</h3>
            </div>
            <p className="text-sm text-orange-700">
              Site-ul nostru integrează servicii Google (Maps, Places API pentru recenzii) care pot
              seta propriile cookie-uri. Aceste cookie-uri sunt supuse{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Politicii de Confidențialitate Google
              </a>
              .
            </p>
          </div>
        </Section>

        {/* Cookie Table */}
        <Section icon={BarChart2} title="3. Lista cookie-urilor utilizate">
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-zinc-100">
                <tr>
                  <th className="text-left p-3 font-semibold text-zinc-800">Nume</th>
                  <th className="text-left p-3 font-semibold text-zinc-800">Furnizor</th>
                  <th className="text-left p-3 font-semibold text-zinc-800">Scop</th>
                  <th className="text-left p-3 font-semibold text-zinc-800">Durată</th>
                  <th className="text-left p-3 font-semibold text-zinc-800">Tip</th>
                </tr>
              </thead>
              <tbody>
                <CookieRow
                  name="oxyss_cookie_consent"
                  provider="Oxy'ss"
                  purpose="Memorează preferințele tale de cookie-uri"
                  duration="12 luni"
                  type="Necesar"
                />
                <CookieRow
                  name="i18next"
                  provider="Oxy'ss"
                  purpose="Memorează preferința de limbă (RO/HU/EN)"
                  duration="Sesiune / 1 an"
                  type="Funcțional"
                />
                <CookieRow
                  name="NID"
                  provider="Google"
                  purpose="Cookie de preferințe Google Maps"
                  duration="6 luni"
                  type="Terță parte"
                />
                <CookieRow
                  name="CONSENT"
                  provider="Google"
                  purpose="Stochează starea consimțământului Google"
                  duration="2 ani"
                  type="Terță parte"
                />
                <CookieRow
                  name="_ga, _gid"
                  provider="Google Analytics"
                  purpose="Analiză trafic site (dacă este activat)"
                  duration="2 ani / 24 ore"
                  type="Terță parte"
                />
              </tbody>
            </table>
          </div>
          <p className="text-sm text-zinc-500 mt-2">
            * Lista poate fi actualizată pe măsură ce serviciile utilizate se modifică.
          </p>
        </Section>

        <Section icon={ToggleLeft} title="4. Cum poți controla cookie-urile">
          <p>Ai mai multe opțiuni pentru a gestiona cookie-urile:</p>

          <div className="space-y-4 mt-2">
            <div className="border border-zinc-200 rounded-lg p-4">
              <h4 className="font-semibold text-zinc-800 mb-2">🍪 Bannerul de cookie-uri al site-ului</h4>
              <p className="text-sm">
                La prima vizită, poți accepta sau refuza cookie-urile neesențiale prin bannerul de
                consimțământ. Poți reveni oricând la aceste preferințe accesând secțiunea
                "Setări Cookie" din footer.
              </p>
            </div>

            <div className="border border-zinc-200 rounded-lg p-4">
              <h4 className="font-semibold text-zinc-800 mb-2">🌐 Setările browserului</h4>
              <p className="text-sm mb-2">
                Poți configura browserul să blocheze sau să șteargă cookie-urile:
              </p>
              <ul className="text-sm space-y-1 text-zinc-600">
                <li>
                  <strong>Chrome:</strong> Setări → Confidențialitate și securitate → Cookie-uri
                </li>
                <li>
                  <strong>Firefox:</strong> Opțiuni → Confidențialitate și securitate
                </li>
                <li>
                  <strong>Safari:</strong> Preferințe → Confidențialitate
                </li>
                <li>
                  <strong>Edge:</strong> Setări → Cookie-uri și permisiuni pentru site
                </li>
              </ul>
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ Notă: Blocarea tuturor cookie-urilor poate afecta funcționarea unor
                elemente ale site-ului (ex: harta, preferința de limbă).
              </p>
            </div>

            <div className="border border-zinc-200 rounded-lg p-4">
              <h4 className="font-semibold text-zinc-800 mb-2">🛡️ Opt-out Google</h4>
              <p className="text-sm">
                Poți dezactiva publicitatea personalizată Google la{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:underline"
                >
                  adssettings.google.com
                </a>
                {' '}și Google Analytics la{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:underline"
                >
                  tools.google.com/dlpage/gaoptout
                </a>
                .
              </p>
            </div>
          </div>
        </Section>

        <Section icon={Shield} title="5. Modificări ale politicii de cookie-uri">
          <p>
            Putem actualiza această politică periodic. Data ultimei modificări este afișată în
            antetul acestei pagini. Te încurajăm să verifici această pagină regulat.
          </p>
          <p>
            Pentru întrebări, ne poți contacta la{' '}
            <a href="mailto:oxyssstyle@gmail.com" className="text-yellow-600 hover:underline font-semibold">
              oxyssstyle@gmail.com
            </a>
            {' '}sau poți consulta{' '}
            <a href="/privacy" className="text-yellow-600 hover:underline font-semibold">
              Politica noastră de Confidențialitate
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
};

export default CookiePolicy;
