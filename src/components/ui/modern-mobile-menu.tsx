import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Home, Briefcase, Calendar, Shield, Settings } from 'lucide-react';

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  onClick?: () => void;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: 'home', icon: Home },
  { label: 'strategy', icon: Briefcase },
  { label: 'period', icon: Calendar },
  { label: 'security', icon: Shield },
  { label: 'settings', icon: Settings },
];

const defaultAccentColor = 'hsl(var(--primary))';

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ items, accentColor, activeIndex: controlledIndex, onActiveChange }) => {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) return defaultItems;
    return items;
  }, [items]);

  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex ?? internalIndex;

  useEffect(() => {
    if (activeIndex >= finalItems.length) {
      setInternalIndex(0);
    }
  }, [finalItems, activeIndex]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();
    window.addEventListener('resize', setLineWidth);
    return () => window.removeEventListener('resize', setLineWidth);
  }, [activeIndex, finalItems]);

  const handleItemClick = (index: number) => {
    setInternalIndex(index);
    onActiveChange?.(index);
    finalItems[index]?.onClick?.();
  };

  const activeColor = accentColor || defaultAccentColor;

  return (
    <nav
      className="flex items-end justify-around w-full rounded-2xl px-2 py-2 shadow-lg border border-border"
      style={{
        '--component-active-color': activeColor,
        backgroundColor: 'hsl(var(--card))',
      } as React.CSSProperties}
    >
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex;
        const IconComponent = item.icon;

        return (
          <button
            key={item.label}
            onClick={() => handleItemClick(index)}
            ref={(el) => (itemRefs.current[index] = el)}
            className="interactive-menu-item group relative flex flex-col items-center gap-1 px-3 py-2 transition-all duration-300 border-0 bg-transparent cursor-pointer"
            style={{ '--lineWidth': '0px' } as React.CSSProperties}
          >
            <span
              className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300"
              style={{
                backgroundColor: isActive ? 'hsl(var(--secondary))' : 'transparent',
              }}
            >
              <IconComponent
                className="w-5 h-5 transition-all duration-300"
                style={{
                  color: isActive ? 'var(--component-active-color)' : 'hsl(var(--muted-foreground))',
                  animation: isActive ? 'iconBounce 0.5s ease-out' : 'none',
                }}
              />
            </span>
            <span
              ref={(el) => (textRefs.current[index] = el)}
              className="text-[10px] font-mono font-medium uppercase tracking-wider transition-all duration-300 whitespace-nowrap"
              style={{
                color: isActive ? 'var(--component-active-color)' : 'hsl(var(--muted-foreground))',
                opacity: isActive ? 1 : 0.7,
                transform: isActive ? 'translateY(0)' : 'translateY(2px)',
              }}
            >
              {item.label}
            </span>
            {/* Active indicator line */}
            <span
              className="absolute -bottom-0.5 h-0.5 rounded-full transition-all duration-300"
              style={{
                width: isActive ? 'var(--lineWidth, 0px)' : '0px',
                backgroundColor: isActive ? 'var(--component-active-color)' : 'transparent',
              }}
            />
          </button>
        );
      })}
    </nav>
  );
};

export { InteractiveMenu };
