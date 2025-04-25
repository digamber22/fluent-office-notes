import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const SupportPage: React.FC = () => {
  // Basic form state (can be expanded later)
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');
    // Simulate submission
    console.log('Support Request:', { name, email, message });
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('Your message has been sent! We will get back to you shortly.');
      // Reset form (optional)
      // setName('');
      // setEmail('');
      // setMessage('');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Support</h1>
        <div className="max-w-2xl mx-auto bg-card p-6 md:p-8 rounded-lg shadow border border-border">
          <p className="mb-6 text-card-foreground">
            Need help? Fill out the form below, and our support team will get back to you as soon as possible.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-card-foreground">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 bg-input"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-card-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-input"
              />
            </div>
            <div>
              <Label htmlFor="message" className="text-card-foreground">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="mt-1 bg-input"
              />
            </div>
            <div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
            {submitStatus && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-4 text-center">{submitStatus}</p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;
