import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Target, Eye, Zap, ChevronRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const values = [
  { icon: Target, title: 'Precision', desc: 'We obsess over accuracy. Every clause flagged, every risk scored, is backed by rigorous AI validation.' },
  { icon: Eye, title: 'Transparency', desc: 'No black boxes. Every risk assessment comes with clear rationale and source citations from the contract.' },
  { icon: Shield, title: 'Security', desc: 'Enterprise-grade encryption and compliance. Your contracts are the most sensitive data you have — we treat them that way.' },
  { icon: Zap, title: 'Speed', desc: 'What takes a legal team days, Sentinel AI does in seconds. Because risk doesn\'t wait for review cycles.' },
];

const team = [
  { name: 'Dr. Elena Vasquez', role: 'CEO & Co-Founder', bio: 'Former Head of Legal AI at a Fortune 500. PhD in Computational Linguistics from MIT.' },
  { name: 'James Okafor', role: 'CTO & Co-Founder', bio: '15 years building scalable ML systems. Previously led engineering at a leading legaltech startup.' },
  { name: 'Priya Sharma', role: 'VP of Product', bio: 'Product leader with a JD/MBA. Built contract management tools used by 10,000+ legal teams.' },
  { name: 'Alex Kim', role: 'Head of AI Research', bio: 'Published NLP researcher specializing in legal document understanding. Former Google Brain.' },
];

const milestones = [
  { year: '2023', event: 'Founded with a mission to democratize contract intelligence.' },
  { year: '2024', event: 'Launched v1.0 and analyzed 50,000 contracts in the first 6 months.' },
  { year: '2025', event: 'Series A funding. Expanded to 5,000+ customers globally.' },
  { year: '2026', event: 'Launched autonomous analysis with 99.2% risk detection accuracy.' },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="py-16 md:py-24 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto px-4 relative">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs font-mono text-primary tracking-widest mb-3 uppercase">ABOUT US</motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-mono font-bold text-foreground mb-6">
              We're Building the Future of
              <br />
              <span className="text-primary">Contract Intelligence</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sentinel AI was founded on a simple belief: every organization deserves to understand the risks in their contracts — instantly, accurately, and affordably.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-card/50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center">
            <motion.h2 variants={fadeUp} className="text-2xl font-mono font-bold text-foreground mb-6">Our Mission</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Contracts are the backbone of every business relationship, yet most organizations still review them manually — a process that's slow, expensive, and error-prone. We're changing that. Sentinel AI uses advanced language models to read, understand, and assess risk in every clause, giving legal teams superhuman analysis capabilities.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-2xl font-mono font-bold text-foreground">Our Values</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <motion.div key={v.title} variants={fadeUp} className="glow-card rounded-lg p-6 bg-card text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-mono text-base font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-2xl font-mono font-bold text-foreground mb-2">Leadership Team</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">The people behind the intelligence.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <motion.div key={member.name} variants={fadeUp} className="border border-border rounded-lg p-6 bg-card text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="font-mono text-lg text-primary font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-mono text-sm font-semibold text-foreground mb-0.5">{member.name}</h3>
                <p className="text-xs text-primary mb-3">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl font-mono font-bold text-foreground text-center mb-12">
            Our Journey
          </motion.h2>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start pb-8 relative"
              >
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary/30 shrink-0" />
                  {i < milestones.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                </div>
                <div className="pb-2">
                  <span className="font-mono text-sm text-primary font-bold">{m.year}</span>
                  <p className="text-sm text-muted-foreground mt-1">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-mono font-bold text-foreground mb-4">Ready to join us?</h2>
          <p className="text-muted-foreground mb-8">Start analyzing contracts for free or talk to our team about enterprise solutions.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button className="font-mono text-xs btn-glow px-8">
                GET STARTED
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="font-mono text-xs px-8">CONTACT US</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
