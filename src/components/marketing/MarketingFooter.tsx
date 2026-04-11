import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Twitter, Linkedin, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const emailSchema = z.string().trim().email().max(255);

const footerLinks = {
  Product: [
    { label: 'Features', href: '/home#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Security', href: '/home#features' },
    { label: 'Integrations', href: '/home#features' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/about' },
    { label: 'Blog', href: '/about' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/contact' },
    { label: 'Terms of Service', href: '/contact' },
    { label: 'Cookie Policy', href: '/contact' },
  ],
};

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: parsed.data });
      if (error) {
        if (error.code === '23505') {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success('Subscribed! Welcome aboard.');
      }
      setEmail('');
    } catch (err) {
      console.error('Newsletter signup error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="font-mono text-xs font-semibold text-foreground tracking-wider mb-3 uppercase flex items-center gap-2">
        <Mail className="w-3.5 h-3.5 text-primary" />
        Stay Updated
      </h4>
      <p className="text-sm text-muted-foreground mb-4">
        Get the latest on AI contract analysis — no spam, unsubscribe anytime.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background font-mono text-sm h-9 flex-1"
          required
        />
        <Button type="submit" size="sm" disabled={loading} className="font-mono text-xs btn-glow shrink-0 h-9">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'SUBSCRIBE'}
        </Button>
      </form>
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 space-y-6">
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <Shield className="w-7 h-7 text-primary" />
                <span className="font-mono text-lg font-bold tracking-wider text-foreground">
                  SENTINEL AI
                </span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                Autonomous contract risk analysis powered by AI. Protect your business from hidden legal threats.
              </p>
              <div className="flex items-center gap-3">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            <NewsletterForm />
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-mono text-xs font-semibold text-foreground tracking-wider mb-4 uppercase">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()} SENTINEL AI. ALL RIGHTS RESERVED.
          </p>
          <p className="text-xs text-muted-foreground">
            Secured with enterprise-grade encryption
          </p>
        </div>
      </div>
    </footer>
  );
}