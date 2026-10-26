import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

/**
 * Dynamic Orbit Swoosh TMS Logo
 * Inspired by professional sports/tech branding:
 * - Deep dark circular badge
 * - Dual aerodynamic glowing swooshes (Neon Crimson Red top arc & Electric Cyan bottom arc)
 * - Bold, italic, athletic 'TMS' lettering with neon cyan gradient & sharp depth
 */
export const TMSLogoIcon = ({ size = 38 }) => {
  if (Platform.OS === 'web') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', flexShrink: 0 }}
      >
        <defs>
          {/* Deep Dark Badge Gradient */}
          <radialGradient id="tmsBadgeBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="75%" stopColor="#0B0F17" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>

          {/* Neon Red/Crimson Swoosh Gradient */}
          <linearGradient id="tmsRedSwoosh" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FF1E56" />
            <stop offset="50%" stopColor="#FF3366" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>

          {/* Electric Cyan Swoosh Gradient */}
          <linearGradient id="tmsCyanSwoosh" x1="0%" y1="50%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor="#0077B6" />
          </linearGradient>

          {/* TMS Text Gradient */}
          <linearGradient id="tmsTextGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#E0F7FA" />
            <stop offset="70%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0091EA" />
          </linearGradient>

          {/* Ambient Glow Filter */}
          <filter id="tmsRedGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="tmsCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="tmsShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Circular Badge Background */}
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="url(#tmsBadgeBg)"
          stroke="#1F2937"
          strokeWidth="1.5"
        />

        {/* Outer Subtle Neon Halo */}
        <circle
          cx="50"
          cy="50"
          r="45.5"
          fill="none"
          stroke="url(#tmsCyanSwoosh)"
          strokeWidth="0.8"
          strokeOpacity="0.3"
        />

        {/* Top-Left Red Aerodynamic Swoosh (Upper Orbit) */}
        <path
          d="M 17 50 C 17 31 31 16 52 16 C 70 16 83 26 86 38 C 81 29 70 21 52 21 C 36 21 24 33 22 50 C 21 53 19 53 17 50 Z"
          fill="url(#tmsRedSwoosh)"
          filter="url(#tmsRedGlow)"
        />
        <path
          d="M 17 50 C 17 31 31 16 52 16 C 70 16 83 26 86 38 C 81 29 70 21 52 21 C 36 21 24 33 22 50 C 21 53 19 53 17 50 Z"
          fill="url(#tmsRedSwoosh)"
        />

        {/* Bottom-Right Cyan Aerodynamic Swoosh (Lower Orbit) */}
        <path
          d="M 83 50 C 83 69 69 84 48 84 C 30 84 17 74 14 62 C 19 71 30 79 48 79 C 64 79 76 67 78 50 C 79 47 81 47 83 50 Z"
          fill="url(#tmsCyanSwoosh)"
          filter="url(#tmsCyanGlow)"
        />
        <path
          d="M 83 50 C 83 69 69 84 48 84 C 30 84 17 74 14 62 C 19 71 30 79 48 79 C 64 79 76 67 78 50 C 79 47 81 47 83 50 Z"
          fill="url(#tmsCyanSwoosh)"
        />

        {/* Center Dynamic 'TMS' Lettering */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="url(#tmsTextGradient)"
          fontSize="24"
          fontWeight="950"
          fontStyle="italic"
          fontFamily="'Arial Black', 'Impact', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="1.2"
          filter="url(#tmsShadow)"
        >
          TMS
        </text>

        {/* Subtle Lens Flare Sparkle on the 'T' top edge */}
        <circle cx="34" cy="42" r="1.5" fill="#FFFFFF" opacity="0.9" />
        <path d="M 34 38 L 34 46 M 30 42 L 38 42" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.7" />
      </svg>
    );
  }

  // Native Fallback
  return (
    <View style={[styles.fallbackContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.fallbackText, { fontSize: size * 0.36 }]}>TMS</Text>
    </View>
  );
};

/**
 * Clean Brand Presentation (Logo + TMS Title + Subtitle)
 */
export const TMSBrand = ({
  size = 'normal',
  showTag = true,
  subtitle = 'Ticket Management System',
  titleStyle,
  tagStyle,
}) => {
  const iconSize = size === 'large' ? 44 : size === 'small' ? 32 : 38;
  const titleFontSize = size === 'large' ? 22 : size === 'small' ? 16 : 19;

  return (
    <View style={styles.brandRow}>
      <TMSLogoIcon size={iconSize} />
      <View style={styles.brandTextCol}>
        <Text style={[styles.brandTitle, { fontSize: titleFontSize }, titleStyle]}>TMS</Text>
        {showTag && (
          <Text style={[styles.brandTag, tagStyle]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandTag: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 1,
  },
  fallbackContainer: {
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
  },
  fallbackText: {
    color: '#00E5FF',
    fontWeight: '900',
    fontStyle: 'italic',
  },
});

export default TMSLogoIcon;
