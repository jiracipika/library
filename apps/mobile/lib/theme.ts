export const colors = {
  // iOS system accent colors
  blue: '#007AFF',
  green: '#34C759',
  orange: '#FF9500',
  red: '#FF3B30',
  purple: '#AF52DE',
  indigo: '#5856D6',
  yellow: '#FFCC00',
  teal: '#30B0C7',

  // Backgrounds
  bg: '#F2F2F7',
  card: '#FFFFFF',
  cardGrouped: '#FFFFFF',

  // Labels
  label: '#000000',
  label2: 'rgba(60,60,67,0.6)',
  label3: '#8E8E93',
  label4: '#C7C7CC',

  // System
  separator: 'rgba(60,60,67,0.12)',
  fill: 'rgba(120,120,128,0.12)',
  fill2: 'rgba(120,120,128,0.08)',
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;
