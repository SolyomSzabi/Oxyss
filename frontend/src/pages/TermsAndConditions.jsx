import React from 'react';
import { FileText, Calendar, XCircle, CreditCard, AlertTriangle, Scale, Phone } from 'lucide-react';
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

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Header */}
      <section className="bg-zinc-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-600 p-3 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Termeni și Condiții
          </h1>
          <p className="text-zinc-300 text-lg">
            Oxy'ss Hair Studio — Condiții de utilizare a site-ului și serviciilor
          </p>
          <p className="text-zinc-500 text-sm mt-3">Ultima actualizare: Aprilie 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Intro */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <p className="text-zinc-700 leading-relaxed">
            Bine ai venit pe site-ul <strong>Oxy'ss Hair Studio</strong>. Prin utilizarea acestui
            site și/sau efectuarea unei programări, ești de acord cu termenii și condițiile
            de mai jos. Te rugăm să le citești cu atenție.
          </p>
        </div>

        <Section icon={FileText} title="1. Informații despre societate">
          <div className="bg-zinc-50 rounded-lg p-4 space-y-2">
            <p><strong>Denumire comercială:</strong> Oxy'ss Hair Studio</p>
            <p><strong>Adresă:</strong> Str. Ratinului, nr. 959, Crasna, Sălaj, România</p>
            <p><strong>Telefon:</strong> +40 74 116 1016</p>
            <p><strong>Email:</strong> oxyssstyle@gmail.com</p>
          </div>
          <p>
            Site-ul este guvernat de legislația română. Utilizarea acestui site implică acceptul
            complet al acestor termeni.
          </p>
        </Section>

        <Section icon={FileText} title="2. Utilizarea site-ului">
          <p>Site-ul <strong>oxyssstyle.ro</strong> oferă:</p>
          <ul className="space-y-2">
            {[
              'Informații despre serviciile de coafură oferite',
              'Un sistem de programare online pentru clienți',
              'Un portal de administrare pentru personalul saloanului',
              'Galerie foto și informații de contact',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            Utilizatorii se angajează să folosească site-ul doar în scopuri legale și să nu
            perturbe funcționarea acestuia prin orice mijloace tehnice sau alte acțiuni dăunătoare.
          </p>
        </Section>

        <Section icon={Calendar} title="3. Programări online">
          <h4 className="font-semibold text-zinc-800">3.1 Confirmarea programării</h4>
          <p>
            O programare este considerată confirmată în momentul în care primești un email de
            confirmare la adresa furnizată. Te rugăm să verifici și folderul de spam dacă nu
            primești confirmarea în câteva minute.
          </p>

          <h4 className="font-semibold text-zinc-800">3.2 Datele necesare</h4>
          <p>
            Pentru efectuarea unei programări, trebuie să furnizezi: numele și prenumele complet,
            o adresă de email validă și un număr de telefon activ. Furnizarea de date false sau
            inexacte poate duce la anularea programării.
          </p>

          <h4 className="font-semibold text-zinc-800">3.3 Responsabilitatea clientului</h4>
          <p>
            Ești responsabil pentru acuratețea informațiilor furnizate la programare și pentru
            a te prezenta la ora stabilită.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Notă:</strong> Programarea online este un instrument de rezervare.
              Plata se efectuează exclusiv la salon, după prestarea serviciului.
            </p>
          </div>
        </Section>

        <Section icon={XCircle} title="4. Politica de anulare și neprezentare">
          <div className="space-y-4">
            <div className="border border-zinc-200 rounded-lg p-4">
              <h4 className="font-semibold text-zinc-800 mb-2 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">OK</span>
                Anulare în timp util
              </h4>
              <p className="text-sm">
                Dacă dorești să anulezi sau să reprogramezi, te rugăm să ne contactezi cu cel puțin
                <strong> 2 ore înainte</strong> de ora programată, la numărul{' '}
                <strong>+40 74 116 1016</strong> sau prin email la{' '}
                <strong>oxyssstyle@gmail.com</strong>.
              </p>
            </div>

            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">Atenție</span>
                Neprezentare / Anulare tardivă
              </h4>
              <p className="text-sm text-orange-700">
                În caz de neprezentare repetată sau anulare tardivă (cu mai puțin de 2 ore înainte),
                ne rezervăm dreptul de a refuza programări viitoare online pentru respectivul client.
                Înțelegem că pot apărea situații neprevăzute — te rugăm să ne anunți cât mai devreme posibil.
              </p>
            </div>
          </div>
        </Section>

        <Section icon={CreditCard} title="5. Prețuri și plată">
          <p>
            Prețurile afișate pe site sunt orientative și reprezintă tarife de pornire. Prețul
            final depinde de frizerul ales, de lungimea și complexitatea lucrării și va fi comunicat
            înainte de prestarea serviciului.
          </p>
          <p>
            <strong>Plata se face exclusiv la salon</strong>, în numerar sau prin alte metode
            acceptate la locație. Site-ul nu procesează plăți online.
          </p>
          <p>
            Ne rezervăm dreptul de a modifica prețurile fără notificare prealabilă. Prețul
            comunicat verbal la salon este cel aplicabil.
          </p>
        </Section>

        <Section icon={AlertTriangle} title="6. Limitarea răspunderii">
          <p>
            Oxy'ss Hair Studio depune toate eforturile pentru a asigura acuratețea informațiilor
            de pe site, însă nu garantează că site-ul va fi disponibil în permanență sau că
            informațiile sunt complete și actualizate în orice moment.
          </p>
          <p>
            Nu răspundem pentru:
          </p>
          <ul className="space-y-2">
            {[
              'Indisponibilitatea temporară a site-ului sau a sistemului de programări',
              'Erori tehnice care pot duce la întârzieri în confirmarea programării',
              'Situații de forță majoră care împiedică prestarea serviciilor',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={FileText} title="7. Proprietate intelectuală">
          <p>
            Toate conținuturile de pe acest site (texte, fotografii, logo-uri, design) sunt
            proprietatea Oxy'ss Hair Studio sau sunt utilizate cu acordul deținătorilor drepturilor.
          </p>
          <p>
            Reproducerea, copierea sau distribuirea oricărui conținut de pe site fără acordul
            scris al Oxy'ss Hair Studio este interzisă.
          </p>
        </Section>

        <Section icon={FileText} title="8. Link-uri externe">
          <p>
            Site-ul poate conține link-uri către site-uri terțe (Google Maps, Instagram etc.).
            Nu suntem responsabili pentru conținutul sau practicile de confidențialitate ale
            acestor site-uri. Accesarea lor se face pe propriul risc.
          </p>
        </Section>

        <Section icon={Scale} title="9. Legea aplicabilă și soluționarea disputelor">
          <p>
            Acești termeni și condiții sunt guvernați de <strong>legislația română</strong>.
            Orice dispută va fi soluționată în primul rând pe cale amiabilă, prin contactarea
            directă a Oxy'ss Hair Studio.
          </p>
          <p>
            În cazul în care soluționarea amiabilă nu este posibilă, disputele vor fi supuse
            <strong> instanțelor competente din România</strong>.
          </p>
        </Section>

        <Section icon={FileText} title="10. Modificări ale termenilor">
          <p>
            Ne rezervăm dreptul de a modifica acești termeni în orice moment. Modificările
            vor fi publicate pe această pagină cu indicarea datei actualizării. Utilizarea
            continuă a site-ului după publicarea modificărilor constituie acceptul acestora.
          </p>
        </Section>

        {/* Contact CTA */}
        <div className="bg-zinc-900 text-white rounded-xl p-8 text-center mt-8">
          <h3 className="text-xl font-bold mb-2">Ai întrebări despre termenii noștri?</h3>
          <p className="text-zinc-300 mb-6">
            Suntem bucuroși să clarificăm orice aspect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+40741161016"
              className="inline-flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Phone className="h-4 w-4" />
              +40 74 116 1016
            </a>
            <a
              href="mailto:oxyssstyle@gmail.com"
              className="inline-flex items-center justify-center gap-2 border border-zinc-600 hover:border-yellow-500 hover:text-yellow-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              oxyssstyle@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;