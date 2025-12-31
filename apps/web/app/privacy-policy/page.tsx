import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">1. Introduction</h2>
          <p className="text-gray-300">
            Welcome to Rexocial ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services (collectively, "Services"). This policy explains our practices regarding the collection, use, and disclosure of your information.
          </p>
          <p className="text-gray-300">
            By accessing or using our Services at <strong>rexocial.rexcoders.in</strong>, you agree to the terms of this Privacy Policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">2. Information We Collect</h2>
          <p className="text-gray-300">
            We collect information that you provide directly to us, such as when you create an account, connect your social media profiles, or communicate with us. This may include:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Contact information (name, email address).</li>
            <li>Account credentials for our Services.</li>
            <li>Social media profile information (when you connect accounts like Instagram or Facebook).</li>
            <li>Content you choose to upload or manage through our platform.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">3. How We Use Your Information</h2>
          <p className="text-gray-300">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Provide, maintain, and improve our Services.</li>
            <li>Process your transactions and manage your account.</li>
            <li>Send you technical notices, updates, security alerts, and support messages.</li>
            <li>Respond to your comments, questions, and requests.</li>
            <li>Facilitate the connection with third-party platforms (like Meta/Instagram) as requested by you.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">4. Data Sharing</h2>
          <p className="text-gray-300">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Service providers who perform services on our behalf.</li>
            <li>Third-party platforms (e.g., Meta) when you explicitly connect your account to use our integration features.</li>
            <li>Law enforcement or other authorities if required by law.</li>
          </ul>
        </section>

        <section className="space-y-4 border-l-4 border-blue-500 pl-6 py-2 bg-white/5 rounded-r">
          <h2 className="text-2xl font-semibold text-blue-400">5. Facebook & Instagram Data Deletion Instructions</h2>
          <p className="text-gray-300">
            Pursuant to the Meta Platform Policy, we provide a way for users to request the deletion of their data. If you have connected your Facebook or Instagram account to our application and wish to delete your data, you can do so by following these steps:
          </p>
          <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4 mt-2">
            <li>Log in to your account on our platform.</li>
            <li>Go to the <strong>Settings</strong> or <strong>Integrations</strong> page.</li>
            <li>Find the Facebook/Instagram connection section.</li>
            <li>Click on the <strong>Disconnect</strong> or <strong>Remove</strong> button.</li>
            <li>This action will remove the connection and delete any stored access tokens associated with your account from our database.</li>
          </ol>
          <p className="text-gray-300 mt-4">
            Alternatively, you can remove our app's access directly from your Facebook settings:
          </p>
          <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4 mt-2">
            <li>Go to your Facebook Account's "Settings & Privacy" > "Settings".</li>
            <li>Look for "Apps and Websites" and you will see all of the apps and websites you linked with your Facebook.</li>
            <li>Search and Click "Rexocial" in the search bar.</li>
            <li>Scroll and click "Remove".</li>
            <li>Congratulations, you have successfully removed your app activities.</li>
          </ol>
          <p className="text-gray-300 mt-4">
             If you no longer have access to your account or wish to request a complete deletion of all your personal data from our systems, please contact us at <strong>support@rexcoders.in</strong>. We will process your request within 30 days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">6. Contact Us</h2>
          <p className="text-gray-300">
            If you have any questions about this Privacy Policy, please contact us at:
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
