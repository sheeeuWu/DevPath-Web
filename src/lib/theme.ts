/**
 * Theme-Aware Color Utilities
 * 
 * This file provides utilities for working with theme-aware colors in the application.
 * All colors automatically adapt to the current theme (light/dark mode).
 * 
 * Usage in CSS Modules:
 * - Use CSS variables: color: var(--text-primary), color: var(--text-secondary)
 * - Use utility classes: className="text-primary-theme", className="text-secondary-theme"
 * 
 * Usage in Tailwind:
 * - Use Tailwind classes with foreground colors: text-foreground, text-muted-foreground
 */

/**
 * CSS Variables Available:
 * 
 * Text Colors (Primary & Secondary):
 * - --text-primary: Main text color (adjusts per theme)
 * - --text-secondary: Secondary text color (adjusts per theme)
 * - --text-muted: Muted text color (adjusts per theme)
 * - --text-light: Light text color (adjusts per theme)
 * - --text-dark: Dark text color (adjusts per theme)
 * 
 * Background Colors:
 * - --bg-primary: Primary background
 * - --bg-secondary: Secondary background
 * 
 * Accent Colors (Fixed - not theme dependent):
 * - --accent-cyan: #00d4ff
 * - --accent-purple: #9d4edd
 * - --accent-pink: #ff006e
 * - --accent-green: #00ff88
 * - --accent-orange: #ff6b35
 * 
 * Light Mode (Default):
 * - --text-primary: #0f172a (dark slate)
 * - --text-secondary: #64748b (medium slate)
 * - --text-muted: #94a3b8 (light slate)
 * 
 * Dark Mode (.dark class):
 * - --text-primary: #ffffff (white)
 * - --text-secondary: #94a3b8 (slate)
 * - --text-muted: #64748b (darker slate)
 */

/**
 * Utility Classes for Theme-Aware Text Colors:
 * 
 * .text-primary-theme - Use for main heading and body text
 * .text-secondary-theme - Use for secondary information
 * .text-muted-theme - Use for disabled or less important text
 * .text-light-theme - Use for light text on dark backgrounds
 * .text-dark-theme - Use for dark text on light backgrounds
 * 
 * .theme-aware-gray - For gray text that changes in dark mode
 * .theme-aware-black - For black text that becomes white in dark mode
 * .theme-aware-light-gray - For light gray text
 * .theme-aware-subtle-gray - For subtle gray text
 * .theme-aware-dark-gray - For dark gray text
 */

/**
 * Best Practices:
 * 
 * 1. Use CSS Variables in Module CSS files:
 *    .myComponent {
 *      color: var(--text-primary);
 *    }
 * 
 * 2. Use Tailwind Classes in JSX:
 *    <p className="text-foreground">Main text</p>
 *    <p className="text-muted-foreground">Secondary text</p>
 * 
 * 3. Avoid hardcoded colors:
 *    ❌ color: #000; or color: #ffffff;
 *    ✅ color: var(--text-primary);
 * 
 * 4. For specific UI elements:
 *    - Headings: var(--text-primary)
 *    - Body text: var(--text-primary)
 *    - Helper text: var(--text-secondary)
 *    - Disabled text: var(--text-muted)
 *    - Labels on colored backgrounds: var(--text-light) or var(--text-dark)
 * 
 * 5. Add smooth transitions:
 *    transition: color var(--transition-fast);
 */

export const THEME_COLORS = {
  // Text colors - use these in CSS with var()
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  textLight: 'var(--text-light)',
  textDark: 'var(--text-dark)',

  // Background colors
  bgPrimary: 'var(--bg-primary)',
  bgSecondary: 'var(--bg-secondary)',

  // Accent colors (fixed)
  accentCyan: 'var(--accent-cyan)',
  accentPurple: 'var(--accent-purple)',
  accentPink: 'var(--accent-pink)',
  accentGreen: 'var(--accent-green)',
  accentOrange: 'var(--accent-orange)',
} as const;

export const THEME_UTILITIES = {
  // Utility classes
  textPrimaryTheme: 'text-primary-theme',
  textSecondaryTheme: 'text-secondary-theme',
  textMutedTheme: 'text-muted-theme',
  textLightTheme: 'text-light-theme',
  textDarkTheme: 'text-dark-theme',

  // Theme-aware gray utilities
  themeAwareGray: 'theme-aware-gray',
  themeAwareBlack: 'theme-aware-black',
  themeAwareLightGray: 'theme-aware-light-gray',
  themeAwareSubtleGray: 'theme-aware-subtle-gray',
  themeAwareDarkGray: 'theme-aware-dark-gray',
} as const;

/**
 * Hook for using theme-aware colors in components
 * @example
 * const { textPrimary, textSecondary } = useThemeColors();
 * // Use in inline styles: style={{ color: textPrimary }}
 */
export const useThemeColors = () => THEME_COLORS;
