import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DollarSign, Info, Mail, LucideIcon, Shield, Activity, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { SentinelLogo } from "@/components/app/SentinelLogo";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type NavItem =
  | {
      name: string;
      type: "anchor";
      target: "features" | "how-it-works" | "pricing" | "faq";
      icon: LucideIcon;
    }
  | {
      name: string;
      type: "page";
      url: string;
      icon: LucideIcon;
    };

const navItems: NavItem[] = [
  { name: "Features", type: "anchor", target: "features", icon: Shield },
  { name: "How It Works", type: "anchor", target: "how-it-works", icon: Activity },
  { name: "Pricing", type: "anchor", target: "pricing", icon: DollarSign },
  { name: "FAQ", type: "anchor", target: "faq", icon: CircleHelp },
  { name: "Pricing Page", type: "page", url: "/pricing", icon: DollarSign },
  { name: "About", type: "page", url: "/about", icon: Info },
  { name: "Contact", type: "page", url: "/contact", icon: Mail },
];

interface FloatingNavBarProps {
  className?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export function FloatingNavBar({ className, leftSlot, rightSlot }: FloatingNavBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.pathname === "/home" || location.pathname === "/landing" ? "features" : location.pathname
  );

  const scrollTo = (id: "features" | "how-it-works" | "pricing" | "faq") => {
    const scroll = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const isLandingRoute = location.pathname === "/home" || location.pathname === "/landing";
    if (isLandingRoute) {
      scroll();
      return;
    }

    navigate("/home");
    setTimeout(scroll, 100);
  };

  useEffect(() => {
    if (location.pathname === "/home" || location.pathname === "/landing") {
      return;
    }

    setActiveTab(location.pathname);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        className
      )}
    >
      <div className="flex items-center gap-1 bg-card/80 backdrop-blur-xl border border-border/50 px-2 py-1.5 rounded-full shadow-lg shadow-primary/5">
        {leftSlot ?? (
          <div className="pl-2 pr-1 hidden lg:block">
            <SentinelLogo size="md" linkTo="/" />
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const tabId = item.type === "anchor" ? item.target : item.url;
          const isActive = activeTab === tabId;
          const itemClassName = cn(
            "relative cursor-pointer text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300",
            "text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isActive && "bg-secondary text-primary",
            !isActive && "hover:bg-primary/5"
          );

          const content = (
            <>
              <span className="hidden sm:inline">{item.name}</span>
              <span className="sm:hidden">
                <Icon className="w-4 h-4" />
              </span>

              {isActive && (
                <motion.div
                  layoutId="lamp-glow"
                  className="absolute inset-0 w-full h-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                >
                  {/* Lamp glow effect */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </>
          );

          if (item.type === "anchor") {
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setActiveTab(item.target);
                  scrollTo(item.target);
                }}
                className={itemClassName}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.url)}
              aria-current={isActive ? "page" : undefined}
              className={itemClassName}
            >
              {content}
            </Link>
          );
        })}

        {rightSlot ?? (
          <>
            <ThemeToggle />

            <Link to="/login">
              <Button size="sm" variant="ghost" className="rounded-full px-4 text-xs font-semibold">
                Sign In
              </Button>
            </Link>

            <Link to="/signup">
              <Button size="sm" className="rounded-full ml-1 px-4 text-xs font-semibold btn-glow">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
