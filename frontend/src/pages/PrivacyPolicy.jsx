import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Database, UserCheck, Mail, Phone, MapPin, Clock, ExternalLink } from 'lucide-react';
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

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Header */}
      <section className="bg-zinc-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-600 p-3 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Politică de Confidențialitate
          </h1>
          <p className="text-zinc-300 text-lg">
            Oxy'ss Hair Studio — Cum protejăm datele tale personale
          </p>
          <p className="text-zinc-500 text-sm mt-3">
            Ultima actualizare: Aprilie 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Intro */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <p className="text-zinc-700 leading-relaxed">
            Oxy'ss Hair Studio se angajează să protejeze confidențialitatea și datele tale personale.
            Această politică descrie ce date colectăm, de ce le colectăm și cum le protejăm, în
            conformitate cu <strong>Regulamentul (UE) 2016/679 (GDPR)</strong> și legislația română în
            vigoare (Legea nr. 190/2018).
          </p>
        </div>

        <Section icon={UserCheck} title="1. Cine suntem (Operatorul de date)">
          <p>Datele tale personale sunt prelucrate de:</p>
          <div className="bg-zinc-50 rounded-lg p-4 space-y-2 mt-2">
            <div className="flex items-center gap-2"><strong>Denumire:</strong> Oxy'ss Hair Studio</div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Str. Ratinului, nr. 959, Crasna, Sălaj, România</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <span>+40 74 116 1016</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <span>oxyssstyle@gmail.com</span>
            </div>
          </div>
          <p className="mt-3">
            <strong>Date de contact pentru probleme de confidențialitate:</strong> Pentru orice
            întrebare sau solicitare legată de datele tale personale, ne poți contacta la adresa de
            email de mai sus.
          </p>
        </Section>

        <Section icon={Database} title="2. Ce date personale colectăm">
          <p>Colectăm datele personale pe care ni le furnizezi în mod direct prin formularul de programare:</p>
          <ul className="list-none space-y-2 mt-3">
            {[
              ['Nume și prenume', 'Pentru a te identifica la programare'],
              ['Adresă de email', 'Pentru confirmarea programării și comunicări legate de aceasta'],
              ['Număr de telefon', 'Pentru confirmarea sau modificarea programării'],
            ].map(([data, reason]) => (
              <li key={data} className="flex items-start gap-3 bg-zinc-50 rounded-lg p-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-zinc-800">{data}</span>
                  <span className="text-zinc-500"> — {reason}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <strong>Date tehnice:</strong> Ca orice site web, serverele noastre pot înregistra automat
            date tehnice standard (adresă IP, tipul browserului, pagini accesate) în scopuri de
            securitate și diagnosticare.
          </p>
          <p>
            <strong>Google Reviews:</strong> Site-ul afișează recenzii publice preluate prin Google
            Places API. Nu colectăm date despre autorii acestor recenzii.
          </p>
        </Section>

        <Section icon={Eye} title="3. De ce folosim datele tale (Scopul și temeiul legal)">
          <div className="space-y-4">
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-100">
                  <tr>
                    <th className="text-left p-3 font-semibold text-zinc-800">Scop</th>
                    <th className="text-left p-3 font-semibold text-zinc-800">Temei legal (GDPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="p-3">Gestionarea programărilor</td>
                    <td className="p-3 text-zinc-500">Art. 6(1)(b) — executarea unui contract</td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="p-3">Trimiterea confirmărilor și notificărilor de programare</td>
                    <td className="p-3 text-zinc-500">Art. 6(1)(b) — executarea unui contract</td>
                  </tr>
                  <tr>
                    <td className="p-3">Securitatea și funcționarea site-ului</td>
                    <td className="p-3 text-zinc-500">Art. 6(1)(f) — interes legitim</td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="p-3">Respectarea obligațiilor legale</td>
                    <td className="p-3 text-zinc-500">Art. 6(1)(c) — obligație legală</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>Nu folosim datele tale</strong> în scopuri de marketing fără consimțământul tău
              explicit și nu le vindem sau transferăm unor terțe părți în scop comercial.
            </p>
          </div>
        </Section>

        <Section icon={Clock} title="4. Cât timp păstrăm datele tale">
          <p>
            Datele de programare (nume, email, telefon, serviciu, data și ora) sunt păstrate timp de
            <strong> 12 luni</strong> de la data programării, după care sunt șterse automat.
          </p>
          <p>
            Datele tehnice de server (loguri) sunt păstrate timp de maximum <strong>90 de zile</strong>.
          </p>
          <p>
            Poți solicita ștergerea datelor tale oricând înainte de expirarea acestor termene
            (vezi secțiunea 6).
          </p>
        </Section>

        <Section icon={Database} title="5. Cu cine împărtășim datele tale">
          <p>Datele tale pot fi accesate de:</p>
          <ul className="space-y-3 mt-2">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Personalul Oxy'ss Hair Studio</strong> — frizerul care urmează să te
                primească și echipa de administrare a programărilor.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Furnizori de servicii tehnice</strong> — hosting (Fly.io, SUA — cu garanții
                adecvate prin Clauzele Contractuale Standard), baza de date MongoDB.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Google LLC</strong> — Google Maps și Google Places API sunt utilizate pentru
                afișarea hărții și a recenziilor. Google prelucrează date conform propriei
                politici de confidențialitate.
              </div>
            </li>
          </ul>
          <p className="mt-3">
            Nu transferăm datele tale în afara Spațiului Economic European fără garanții adecvate.
          </p>
        </Section>

        <Section icon={UserCheck} title="6. Drepturile tale">
          <p>Conform GDPR, ai următoarele drepturi în legătură cu datele tale personale:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {[
              ['Dreptul de acces', 'Poți solicita o copie a datelor pe care le deținem despre tine'],
              ['Dreptul la rectificare', 'Poți cere corectarea datelor inexacte sau incomplete'],
              ['Dreptul la ștergere', 'Poți cere ștergerea datelor tale (dreptul "de a fi uitat")'],
              ['Dreptul la restricționare', 'Poți cere limitarea prelucrării datelor tale'],
              ['Dreptul la portabilitate', 'Poți primi datele tale într-un format structurat, lizibil'],
              ['Dreptul de opoziție', 'Poți te opune prelucrării bazate pe interes legitim'],
            ].map(([right, desc]) => (
              <div key={right} className="bg-zinc-50 rounded-lg p-3">
                <p className="font-semibold text-zinc-800 text-sm">{right}</p>
                <p className="text-zinc-500 text-sm mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="font-semibold text-zinc-800 mb-1">Cum îți exerciți drepturile:</p>
            <p>
              Trimite o cerere la <strong>oxyssstyle@gmail.com</strong>. Vom răspunde în termen de
              30 de zile. Dacă nu ești mulțumit de răspunsul nostru, ai dreptul să depui o plângere
              la <strong>ANSPDCP</strong> (Autoritatea Națională de Supraveghere a Prelucrării
              Datelor cu Caracter Personal): <strong>www.dataprotection.ro</strong>, Telefon:{' '}
              <strong>+40 318 059 211</strong>.
            </p>
          </div>
        </Section>

        <Section icon={Shield} title="7. Securitatea datelor">
          <p>
            Luăm măsuri tehnice și organizatorice adecvate pentru a proteja datele tale împotriva
            accesului neautorizat, pierderii sau distrugerii, inclusiv:
          </p>
          <ul className="space-y-2 mt-2">
            {[
              'Conexiuni criptate HTTPS/TLS pentru transmiterea datelor',
              'Acces restricționat la baza de date — doar personalul autorizat',
              'Autentificare cu token JWT pentru accesul la panoul de administrare',
              'Backup regulat al datelor',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ExternalLink} title="8. Cookie-uri și tehnologii similare">
          <p>
            Site-ul nostru utilizează cookie-uri. Pentru detalii complete despre tipurile de
            cookie-uri utilizate și cum poți gestiona preferințele tale, consultă{' '}
            <a href="/cookies" className="text-yellow-600 hover:underline font-semibold">
              Politica noastră de Cookie-uri
            </a>
            .
          </p>
        </Section>

        <Section icon={Shield} title="9. Modificări ale politicii">
          <p>
            Ne rezervăm dreptul de a actualiza această politică de confidențialitate. Orice
            modificare semnificativă va fi comunicată prin publicarea versiunii actualizate pe
            această pagină, cu indicarea datei revizuirii.
          </p>
          <p>
            Te încurajăm să revizuiești periodic această pagină pentru a fi la curent cu modul în
            care protejăm datele tale.
          </p>
        </Section>

        {/* Contact Box */}
        <div className="bg-zinc-900 text-white rounded-xl p-8 text-center mt-8">
          <h3 className="text-xl font-bold mb-2">Ai întrebări despre datele tale?</h3>
          <p className="text-zinc-300 mb-4">
            Contactează-ne și vom răspunde în termen de 30 de zile.
          </p>
          <a
            href="mailto:oxyssstyle@gmail.com"
            className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Mail className="h-4 w-4" />
            oxyssstyle@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
