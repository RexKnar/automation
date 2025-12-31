import React from 'react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">1. Acceptance of Terms</h2>
          <p className="text-gray-300">
            By accessing and using the website <strong>rexocial.rexcoders.in</strong> (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">2. Description of Service</h2>
          <p className="text-gray-300">
            Rexocial provides a social media automation and management platform. You are responsible for obtaining access to the Service and that access may involve third party fees (such as Internet service provider or airtime charges).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">3. User Account</h2>
          <p className="text-gray-300">
            To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">4. Acceptable Use</h2>
          <p className="text-gray-300">
            You agree not to use the Service to:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Violate any local, state, national, or international law or regulation.</li>
            <li>Transmit any material that is abusive, harassing, tortious, defamatory, vulgar, pornographic, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
            <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
            <li>Violate the terms of service of any third-party platforms (e.g., Facebook, Instagram) connected to your account.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">5. Intellectual Property</h2>
          <p className="text-gray-300">
            The Service and its original content, features, and functionality are and will remain the exclusive property of Rexcoders and its licensors. The Service is protected by copyright, trademark, and other laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">6. Termination</h2>
          <p className="text-gray-300">
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">7. Limitation of Liability</h2>
          <p className="text-gray-300">
            In no event shall Rexcoders, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">8. Changes to Terms</h2>
          <p className="text-gray-300">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">9. Contact Us</h2>
          <p className="text-gray-300">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-300">
            Email: support@rexcoders.in<br />
            Website: rexocial.rexcoders.in
          </p>
        </section>
      </div>
    </div>
  );
}
