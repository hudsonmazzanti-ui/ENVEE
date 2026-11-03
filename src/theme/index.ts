import { Platform } from 'react-native';

export const C = {
  bg: '#FFFFFF',
  canvas: '#FAF8F5', // very light warm grey
  surface: '#F3F0EB',
  line: '#E7E2DB',
  text: '#141414',
  text2: '#5F5A54',
  text3: '#9A948C',
  accent: '#0F5B45', // deep emerald
  accentPressed: '#0B4636',
  accentSoft: '#E6EFEB',
  white: '#FFFFFF',
  danger: '#B4442C',
};

export const F = {
  display: 'CormorantGaramond_500Medium',
  displayRegular: 'CormorantGaramond_400Regular',
  displayItalic: 'CormorantGaramond_400Regular_Italic',
  wordmark: 'CormorantGaramond_600SemiBold',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
};

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, gutter: 20 };

export const R = { sm: 6, md: 12, lg: 18, pill: 999 };

export const shadow = Platform.select({
  web: { boxShadow: '0 8px 24px rgba(20,20,20,0.08)' } as object,
  default: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});

export const money = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
