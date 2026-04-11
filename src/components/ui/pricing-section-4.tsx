"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description: "For individuals exploring contract analysis.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
    href: "/signup",
    includes: [
      "Free includes:",
      "5 contracts/month",
      "Basic risk scoring",
      "Clause detection",
      "Email support",
      "1 workspace",
    ],
  },
  {
    name: "Pro",
    description: "For growing teams that need full intelligence.",
    price: 49,
    yearlyPrice: 468,
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
    popular: true,
    href: "/signup",
    includes: [
      "Everything in Starter, plus:",
      "Unlimited contracts",
      "Advanced AI analysis",
      "Contract chat (AI Q&A)",
      "Priority support",
      "5 workspaces",
      "Custom risk rules",
      "Export reports",
    ],
  },
  {
    name: "Enterprise",
    description: "For organizations with complex compliance needs.",
    price: 199,
    yearlyPrice: 1990,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    href: "/contact",
    includes: [
      "Everything in Pro, plus:",
      "Unlimited workspaces",
      "SSO & SAML",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
    ],
  },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center rounded-full bg-secondary/50 border border-border p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 h-10 rounded-full px-4 sm:px-6 py-2 font-mono text-xs font-medium transition-colors",
            selected === "0" ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {selected === "0" && (
            <motion.div
              layoutId="pricing-switch"
              className="absolute inset-0 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">Monthly</span>
        </button>
        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 h-10 rounded-full px-4 sm:px-6 py-2 font-mono text-xs font-medium transition-colors",
            selected === "1" ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {selected === "1" && (
            <motion.div
              layoutId="pricing-switch"
              className="absolute inset-0 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">Yearly</span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLElement>(null);

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <section id="pricing" ref={pricingRef} className="py-20 md:py-32 relative overflow-hidden">
      {/* Sparkles background */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles
          className="absolute inset-0 h-full w-full"
          color="hsl(217, 91%, 60%)"
          size={1.2}
          density={100}
          speed={0.5}
          opacity={0.3}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <TimelineContent animationNum={0} timelineRef={pricingRef}>
            <p className="text-xs font-mono text-primary tracking-widest mb-3 uppercase">PRICING</p>
          </TimelineContent>

          <TimelineContent animationNum={1} timelineRef={pricingRef}>
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4">
              <VerticalCutReveal
                splitBy="characters"
                staggerDuration={0.03}
                containerClassName="justify-center"
                elementLevelClassName="inline-block"
              >
                Plans for Every Team Size
              </VerticalCutReveal>
            </h2>
          </TimelineContent>

          <TimelineContent animationNum={2} timelineRef={pricingRef}>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free. Scale as your contract analysis needs grow.
            </p>
          </TimelineContent>

          <TimelineContent animationNum={3} timelineRef={pricingRef} className="mt-8">
            <PricingSwitch onSwitch={togglePricingPeriod} />
          </TimelineContent>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <TimelineContent key={plan.name} animationNum={index + 4} timelineRef={pricingRef}>
              <Card
                className={cn(
                  "relative h-full bg-card border-border transition-all duration-300",
                  plan.popular && "border-primary shadow-lg shadow-primary/10"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary rounded-full">
                    <span className="text-xs font-mono font-semibold text-primary-foreground">MOST POPULAR</span>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-mono text-lg font-bold text-foreground">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-sm text-muted-foreground">$</span>
                    <NumberFlow
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-4xl font-mono font-bold text-foreground"
                      format={{ useGrouping: false }}
                      transformTiming={{ duration: 500, easing: "ease-out" }}
                    />
                    <span className="text-sm text-muted-foreground">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <Link to={plan.href}>
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className={cn(
                        "w-full font-mono text-xs mb-6",
                        plan.popular && "btn-glow"
                      )}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>

                  <div className="space-y-3">
                    <p className="text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wider">
                      {plan.includes[0]}
                    </p>
                    <ul className="space-y-2.5">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TimelineContent>
          ))}
        </div>
      </div>
    </section>
  );
}
