import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  const appName = "LingoMate.AI"; // Use the app name
  const contactEmail = "lingo.ai.gmail.com"; // Replace with actual contact email
  const lastUpdated = "April 23, 2025"; // Replace with the actual date

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none text-foreground space-y-4">
          <p><strong>Last Updated:</strong> {lastUpdated}</p>

          <p>
            Welcome to {appName}! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect via the Application includes:
          </p>
          <ul>
            <li>
              <strong>Audio Data:</strong> We collect audio files that you upload to the service for the purpose of transcription, summarization, and action item extraction.
            </li>
            <li>
              <strong>Generated Content:</strong> We store the transcripts, summaries, and action items generated from your audio files to provide the service features.
            </li>
            <li>
              <strong>Usage Data:</strong> We may automatically collect information about how you access and use the Application, such as your device type, operating system, IP address (potentially anonymized), access times, and the features you have used. This data is used for analytics and service improvement.
            </li>
            <li>
              <strong>Personal Data (Optional):</strong> If you create an account (if applicable), we may collect personal information such as your name and email address.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
          <p>
            Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
          </p>
          <ul>
            <li>Provide, operate, and maintain our Application.</li>
            <li>Process your audio files to generate transcripts, summaries, and action items.</li>
            <li>Improve, personalize, and expand our Application.</li>
            <li>Understand and analyze how you use our Application.</li>
            <li>Develop new products, services, features, and functionality.</li>
            <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Application, and for marketing and promotional purposes (if applicable and consented to).</li>
            <li>Find and prevent fraud.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Disclosure of Your Information</h2>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <ul>
            <li>
              <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
            </li>
            <li>
              <strong>Third-Party Service Providers:</strong> We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., cloud hosting, audio transcription APIs, AI summarization APIs). We will strive to ensure these third parties have appropriate data protection and confidentiality agreements in place.
            </li>
            <li>
              <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
            </li>
            <li>
              <strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.
            </li>
          </ul>
          <p>We do not sell your personal information or audio data.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information and audio data. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Data Retention</h2>
          <p>
            We will retain your audio files, transcripts, summaries, and action items only for as long as necessary to provide you with the service or as required by law. You may be able to delete your data through the application interface (if applicable) or by contacting us. Usage data may be retained for longer periods for analytical purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Your Data Protection Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal information:
          </p>
          <ul>
            <li>The right to access – You have the right to request copies of your personal data.</li>
            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
            <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          </ul>
          <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at our contact email.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Children's Privacy</h2>
          <p>
            Our service is not intended for use by children under the age of 13 (or 16 in certain jurisdictions). We do not knowingly collect personally identifiable information from children under 13/16. If we become aware that we have collected personal information from a child under the relevant age without verification of parental consent, we take steps to remove that information from our servers.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul>
            <li>By email: {contactEmail}</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
