import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Home, DollarSign, Info, Mail, Moon, Sun, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: "Home", url: "/home", icon: Home },
  { name: "Pricing", url: "/pricing", icon: DollarSign },
  { name: "About", url: "/about", icon: Info },
  { name: "Contact", url: "/contact", icon: Mail },
];

interface FloatingNavBarProps {
  className?: string;
}

export function FloatingNavBar({ className }: FloatingNavBarProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  useEffect(() => {
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
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.url;

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.url)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative cursor-pointer text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300",
                "text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive && "bg-secondary text-primary",
                !isActive && "hover:bg-primary/5"
              )}
            >
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
            </Link>
          );
        })}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link to="/signup">
          <Button size="sm" className="rounded-full ml-1 px-4 text-xs font-semibold btn-glow">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
