import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsOfServicePage: React.FC = () => {
  const appName = "LingoMate.AI"; // Use the app name
  const contactEmail = "lingo.ai.gmail.com"; // Replace with actual contact email
  const lastUpdated = "April 23, 2025"; // Replace with the actual date

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none text-foreground space-y-4">
          <p><strong>Last Updated:</strong> {lastUpdated}</p>

          <p>
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the {appName} application (the "Service") operated by us.
          </p>
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
          </p>
          <p>
            By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">1. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on {appName}'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on {appName}'s website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          <p>
            This license shall automatically terminate if you violate any of these restrictions and may be terminated by {appName} at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">2. User Content (Audio Files & Generated Data)</h2>
          <p>
            You retain ownership of any intellectual property rights that you hold in the audio files you upload and the content generated from them (transcripts, summaries, action items). When you upload audio to our Service, you give {appName} (and those we work with) a worldwide license to use, host, store, reproduce, modify (such as results from transcription or summarization), and create derivative works for the limited purpose of operating, promoting, and improving our Services, and to develop new ones. Ensure you have the necessary rights to grant us this license for any content you submit to our Service.
          </p>
          <p>
            You are responsible for the content you upload and must ensure it does not violate any laws or third-party rights. We reserve the right to remove content that violates these Terms or is otherwise objectionable.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">3. Disclaimer</h2>
          <p>
            The materials and services on {appName} are provided on an 'as is' basis. {appName} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <p>
            Further, {appName} does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials (including transcripts, summaries, and action items) on its website or otherwise relating to such materials or on any sites linked to this site. AI-generated content may contain inaccuracies; users should verify critical information.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">4. Limitations</h2>
          <p>
            In no event shall {appName} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {appName}'s website, even if {appName} or a {appName} authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">5. Accuracy of Materials</h2>
          <p>
            The materials appearing on {appName}'s website could include technical, typographical, or photographic errors. {appName} does not warrant that any of the materials on its website are accurate, complete or current. {appName} may make changes to the materials contained on its website at any time without notice. However {appName} does not make any commitment to update the materials.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">6. Links</h2>
          <p>
            {appName} has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by {appName} of the site. Use of any such linked website is at the user's own risk.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">7. Modifications</h2>
          <p>
            {appName} may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction, e.g., California, USA] and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>

           <h2 className="text-2xl font-semibold mt-6 mb-2">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us:
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

export default TermsOfServicePage;
