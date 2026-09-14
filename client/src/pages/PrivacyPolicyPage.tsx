import { Lock, ShieldCheck } from 'lucide-react';
import { Footer } from '../components/marketing/Footer';
import { Navbar } from '../components/marketing/Navbar';

export function PrivacyPolicyPage() {
  const lastUpdated = 'September 14, 2026';

  return (
    <div className="marketing-page min-h-screen bg-white text-[#18122B]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck size={14} />
            <span>Data Protection & Privacy Policy</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#18122B] sm:text-4xl">
            TenantPro Privacy & Personal Data Policy
          </h1>
          <p className="mt-2 text-xs text-slate-500">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-slate mt-10 max-w-none space-y-10 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-[#18122B]">1. Overview & Commitment</h2>
            <p className="mt-3">
              TenantPro Technologies Inc. ("TenantPro", "we", "our", or "us") is dedicated to safeguarding
              the privacy and personal data of all residents, property managers, landlords, and maintenance
              technicians who interact with our platform. This policy outlines how information is collected,
              processed, encrypted, and isolated across our property management services.
            </p>
          </section>

          <section id="data-collection">
            <h2 className="text-xl font-bold text-[#18122B]">2. Information We Collect</h2>
            <p className="mt-3">
              To operate maintenance workflows smoothly, we collect only necessary personal and operational
              data:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Account Information:</strong> Full name, verified email address, assigned residential
                unit number, role classification (tenant, manager, technician), and specialization details.
              </li>
              <li>
                <strong>Maintenance & Repair Records:</strong> Ticket titles, problem descriptions, category
                tags, priority ratings, unit locations, timestamped status updates, and discussion threads.
              </li>
              <li>
                <strong>Media Attachments:</strong> Diagnostic issue photographs and resolution proof uploaded
                directly by users to document maintenance conditions.
              </li>
              <li>
                <strong>System & Audit Logs:</strong> Access timestamps, status transition histories, technician
                dispatch logs, and session identifiers.
              </li>
            </ul>
          </section>

          <section id="security">
            <h2 className="text-xl font-bold text-[#18122B]">3. Data Security & Multi-Tenant Isolation</h2>
            <p className="mt-3">
              We implement industry-leading technical and organizational security controls:
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-bold text-[#18122B]">
                  <Lock size={16} className="text-[#635985]" /> 12-Round BCrypt Hashing
                </div>
                <p className="mt-1.5 text-xs text-slate-600">
                  User passwords are encrypted before storage. Plaintext passwords never enter databases or server logs.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-bold text-[#18122B]">
                  <ShieldCheck size={16} className="text-emerald-600" /> Database-Level RBAC Isolation
                </div>
                <p className="mt-1.5 text-xs text-slate-600">
                  Every query is strictly partitioned by Property ID, preventing cross-tenant or unauthorized data exposure.
                </p>
              </div>
            </div>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-bold text-[#18122B]">4. Cookies & Session Management</h2>
            <p className="mt-3">
              TenantPro uses secure, HTTP-only cookies (`tenantpro_auth`) solely for maintaining authenticated
              user sessions. These cookies cannot be read or stolen via client-side JavaScript or cross-site
              scripting (XSS). Local storage is utilized solely for user preferences (such as audio chime alerts
              and ticket notification toggles).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#18122B]">5. Third-Party Services</h2>
            <p className="mt-3">
              We integrate with trusted enterprise infrastructure providers under strict confidentiality agreements:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Cloudinary:</strong> Secure, encrypted cloud media storage for repair photographs.</li>
              <li><strong>MongoDB Atlas:</strong> SOC 2-compliant encrypted database clustering.</li>
              <li><strong>Render & Vercel:</strong> Isolated hosting environments with SSL/TLS 1.3 encryption.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#18122B]">6. Resident Rights & Contact</h2>
            <p className="mt-3">
              You have the right to inspect, correct, or request deletion of your personal account information
              at any time. For questions regarding this policy or data inquiries, please contact our Data Protection
              Officer at:
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <p className="font-bold text-[#18122B]">TenantPro Technologies Inc. — Data Protection</p>
              <p className="mt-1 text-slate-600">100 Panorama Way, Austin, TX 78701</p>
              <p className="mt-1 text-slate-600">
                Email: <a href="mailto:privacy@tenantpro.com" className="font-bold text-[#635985] hover:underline">privacy@tenantpro.com</a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
