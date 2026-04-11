import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Perfect for individuals exploring contract analysis.',
    features: [
      '5 contracts per month',
      'Basic risk scoring (0–100)',
      'Clause detection & categorization',
      'Email support',
      '1 workspace',
      'PDF & DOCX support',
    ],
    excluded: ['Contract chat (AI Q&A)', 'Custom risk rules', 'Export reports', 'API access'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    desc: 'For growing teams that need full AI intelligence.',
    features: [
      'Unlimited contracts',
      'Advanced AI analysis',
      'Contract chat (AI Q&A)',
      'Priority support (< 4h)',
      '5 workspaces',
      'Custom risk rules',
      'Export reports (PDF, CSV)',
      'Batch upload',
      'Threat feed dashboard',
    ],
    excluded: ['SSO & SAML', 'Dedicated account manager'],
    cta: 'Start 14-Day Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For organizations with complex compliance needs.',
    features: [
      'Everything in Pro',
      'Unlimited workspaces',
      'SSO & SAML authentication',
      'Dedicated account manager',
      'Custom AI model training',
      'API access & webhooks',
      'SLA guarantee (99.9%)',
      'On-premise deployment option',
      'Custom integrations',
      'Audit log & compliance reports',
    ],
    excluded: [],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const comparisonFeatures = [
  { feature: 'Contracts per month', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'AI Risk Scoring', starter: '✓', pro: '✓', enterprise: '✓' },
  { feature: 'Clause Detection', starter: '✓', pro: '✓', enterprise: '✓' },
  { feature: 'Contract Chat', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'Workspaces', starter: '1', pro: '5', enterprise: 'Unlimited' },
  { feature: 'Custom Risk Rules', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'Export Reports', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'Batch Upload', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'Threat Feed', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'SSO / SAML', starter: '—', pro: '—', enterprise: '✓' },
  { feature: 'API Access', starter: '—', pro: '—', enterprise: '✓' },
  { feature: 'SLA Guarantee', starter: '—', pro: '—', enterprise: '99.9%' },
  { feature: 'Dedicated Manager', starter: '—', pro: '—', enterprise: '✓' },
  { feature: 'On-Premise Option', starter: '—', pro: '—', enterprise: '✓' },
  { feature: 'Support', starter: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
];

export default function PricingPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs font-mono text-primary tracking-widest mb-3 uppercase">PRICING</motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-mono font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
              Start free. Upgrade when you're ready. No hidden fees, no surprise charges.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={`rounded-xl p-6 border flex flex-col ${
                plan.highlight ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 relative' : 'border-border bg-card'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary rounded-full">
                  <span className="text-xs font-mono font-semibold text-primary-foreground">MOST POPULAR</span>
                </div>
              )}
              <h3 className="font-mono text-lg font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-mono font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={plan.name === 'Enterprise' ? '/contact' : '/signup'}>
                <Button className={`w-full font-mono text-xs ${plan.highlight ? 'btn-glow' : ''}`} variant={plan.highlight ? 'default' : 'outline'}>
                  {plan.cta}
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-mono font-bold text-foreground text-center mb-8">Feature Comparison</h2>
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">FEATURE</th>
                  <th className="text-center px-4 py-3 font-mono text-xs text-muted-foreground">STARTER</th>
                  <th className="text-center px-4 py-3 font-mono text-xs text-primary bg-primary/5">PRO</th>
                  <th className="text-center px-4 py-3 font-mono text-xs text-muted-foreground">ENTERPRISE</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-secondary/20'}`}>
                    <td className="px-4 py-3 text-foreground">{row.feature}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{row.starter}</td>
                    <td className="px-4 py-3 text-center text-foreground bg-primary/5 font-medium">{row.pro}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-mono font-bold text-foreground text-center mb-8">Pricing FAQ</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I switch plans anytime?', a: 'Yes. Upgrade, downgrade, or cancel at any time. Changes take effect at the start of your next billing cycle.' },
            { q: 'Is there a free trial for Pro?', a: 'Yes! Pro comes with a 14-day free trial. No credit card required to start.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, wire transfers for Enterprise, and support invoicing for annual plans.' },
            { q: 'Do you offer annual billing?', a: 'Yes. Annual plans come with a 20% discount. Contact us for details.' },
          ].map((faq) => (
            <div key={faq.q} className="border border-border rounded-lg p-5 bg-card">
              <h3 className="font-medium text-foreground mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
