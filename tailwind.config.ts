import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-orange-400',
    'bg-orange-100',
    'text-orange-600',
    'text-orange-700',
    'bg-pink-400',
    'bg-pink-100',
    'text-pink-600',
    'bg-green-400',
    'bg-green-100',
    'text-green-600',
    'text-green-700',
    'bg-teal-400',
    'bg-teal-100',
    'text-teal-600',
    'bg-green-50',
    'border-green-500',
    'text-green-700',
    'bg-green-500',
    'bg-red-50',
    'bg-red-100',
    'border-red-500',
    'text-red-700',
    'text-red-600',
    'bg-red-500',
    'bg-yellow-50',
    'bg-yellow-100',
    'border-yellow-500',
    'text-yellow-700',
    'bg-yellow-500',
    'bg-blue-50',
    'bg-blue-100',
    'border-blue-500',
    'text-blue-700',
    'text-blue-600',
    'bg-blue-500',
    'bg-purple-100',
    'text-purple-600',
    'bg-gray-100',
    'text-gray-600',
    'border-current',
    'bg-gray-900',
    'text-gray-200',
    'border-gray-700',
    'hover:bg-gray-800',
    'bg-gray-800',
    'text-white',
    'hover:bg-gray-700',
    'focus:bg-gray-700',
    'text-gray-400'
  ],
  theme: {
    extend: {
      boxShadow: {
        'smooth': '0px 4px 1px rgba(185, 190, 203, 0.08), 1px 15px 4px rgba(185, 190, 203, 0.08), 2px 34px 9px rgba(185, 190, 203, 0.08), 3px 60px 15px rgba(185, 190, 203, 0.08), 5px 94px 24px rgba(185, 190, 203, 0.08)',
      },
      fontFamily: {
        body: ['PT Sans', 'sans-serif'],
        headline: ['PT Sans', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'collapsible-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-collapsible-content-height)',
          },
        },
        'collapsible-up': {
          from: {
            height: 'var(--radix-collapsible-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
