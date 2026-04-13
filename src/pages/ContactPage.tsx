import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MapPin, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  company: z.string().trim().max(100).optional(),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: '' },
  });

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('contact-form', {
        body: data,
      });
      if (error) throw error;
      toast.success("Message sent! We'll get back to you within 24 hours.");
      reset();
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs font-mono text-primary tracking-widest mb-3 uppercase">CONTACT</motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-mono font-bold text-foreground mb-4">
              Get in Touch
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
              Have questions about Sentinel AI? We'd love to hear from you. Our team typically responds within 24 hours.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="lg:col-span-2 space-y-8"
          >
            <motion.div variants={fadeUp}>
              <h2 className="font-mono text-lg font-bold text-foreground mb-6">Contact Information</h2>
              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'Email', value: 'hello@sentinel-ai.com' },
                  { icon: MapPin, label: 'Office', value: 'San Francisco, CA\nUnited States' },
                  { icon: Clock, label: 'Business Hours', value: 'Mon–Fri, 9AM–6PM PST' },
                ].map((info) => (
                  <div key={info.label} className="flex gap-4">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <info.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-muted-foreground mb-0.5">{info.label}</p>
                      <p className="text-sm text-foreground whitespace-pre-line">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="border border-border rounded-lg p-5 bg-card">
              <h3 className="font-mono text-sm font-semibold text-foreground mb-2">Enterprise Inquiries</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Need a custom plan, on-premise deployment, or dedicated support? Our enterprise team is here to help.
              </p>
              <p className="text-sm text-primary font-mono">enterprise@sentinel-ai.com</p>
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="border border-border rounded-xl p-6 md:p-8 bg-card">
              <h2 className="font-mono text-lg font-bold text-foreground mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs text-muted-foreground">NAME *</Label>
                    <Input {...register('name')} placeholder="Your name" className="bg-background font-mono text-sm" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs text-muted-foreground">EMAIL *</Label>
                    <Input {...register('email')} type="email" placeholder="you@company.com" className="bg-background font-mono text-sm" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs text-muted-foreground">COMPANY</Label>
                    <Input {...register('company')} placeholder="Company name" className="bg-background font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs text-muted-foreground">SUBJECT *</Label>
                    <Select onValueChange={(val) => setValue('subject', val)}>
                      <SelectTrigger className="bg-background font-mono text-sm">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="sales">Sales / Enterprise</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="press">Press / Media</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">MESSAGE *</Label>
                  <Textarea {...register('message')} placeholder="Tell us how we can help..." rows={5} className="bg-background font-mono text-sm resize-none" />
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>

                <Button type="submit" disabled={loading} className="w-full sm:w-auto font-mono text-xs btn-glow px-8">
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  SEND MESSAGE
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
