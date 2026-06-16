// Type surface for the Tailwind preset. Kept structural (not dependent on
// `tailwindcss` types) so consumers without Tailwind installed still typecheck.
type TokenScale = Record<string, string | Record<string, string>>;

interface VoidframePreset {
  theme: {
    extend: {
      colors: Record<string, TokenScale | string>;
      spacing: Record<string, string>;
      fontFamily: Record<string, string>;
      fontSize: Record<string, string>;
      lineHeight: Record<string, string>;
      letterSpacing: Record<string, string>;
      borderRadius: Record<string, string>;
      borderWidth: Record<string, string>;
      transitionProperty: Record<string, string>;
      screens: Record<string, string>;
    };
  };
}

declare const preset: VoidframePreset;
export default preset;
