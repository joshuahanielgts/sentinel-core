import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark'
        ? <Sun className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        : <Moon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
      }
    </Button>
  );
}
