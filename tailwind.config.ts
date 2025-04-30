
import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// CastCompanion custom colors
				cast: {
					"sea-green": "#14A090",
					"moss-gray": "#7A9992",
					"silver-gray": "#CCCCCC",
					"deep-forest": "#0A1915",
					"early-mist": "#DAE5E2",
					"shadow-green": "#5E6664",
					"light-bg": "#F9F9F9",
					"dark-bg": "#222625",
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			typography: (theme: any) => ({
				DEFAULT: {
					css: {
						'code::before': {
							content: '""',
						},
						'code::after': {
							content: '""',
						},
						'blockquote p:first-of-type::before': {
							content: '""',
						},
						'blockquote p:last-of-type::after': {
							content: '""',
						},
					},
				},
				light: {
					css: {
						color: '#0A1915',
						a: { color: '#14A090' },
						'h1,h2,h3,h4,h5,h6': { color: '#0A1915' },
						'ul > li::marker': { color: '#0A1915' },
						'ol > li::marker': { color: '#0A1915' },
					},
				},
				dark: {
					css: {
						color: '#FFFFFF',
						a: { color: '#14A090' },
						'h1,h2,h3,h4,h5,h6': { color: '#FFFFFF' },
						'ul > li::marker': { color: '#FFFFFF' },
						'ol > li::marker': { color: '#FFFFFF' },
					},
				},
			}),
		}
	},
	plugins: [typography, require("tailwindcss-animate")],
} satisfies Config;
