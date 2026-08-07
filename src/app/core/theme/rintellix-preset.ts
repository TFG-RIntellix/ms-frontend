import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const RintellixPreset = definePreset(Aura, {
  primitive: {
    rintellixred: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#F30005',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#9F1239',
      900: '#881337',
      950: '#4c0519'
    },
    rintellixslate: {
      0: '#ffffff',
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617'
    },
    rintellixblue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554'
    }
  },
  semantic: {
    primary: {
      50: '{rintellixred.50}',
      100: '{rintellixred.100}',
      200: '{rintellixred.200}',
      300: '{rintellixred.300}',
      400: '{rintellixred.400}',
      500: '{rintellixred.500}',
      600: '{rintellixred.600}',
      700: '{rintellixred.700}',
      800: '{rintellixred.800}',
      900: '{rintellixred.900}',
      950: '{rintellixred.950}'
    },
    colorScheme: {
      light: {
        surface: {
          0: '{rintellixslate.0}',
          50: '{rintellixslate.50}',
          100: '{rintellixslate.100}',
          200: '{rintellixslate.200}',
          300: '{rintellixslate.300}',
          400: '{rintellixslate.400}',
          500: '{rintellixslate.500}',
          600: '{rintellixslate.600}',
          700: '{rintellixslate.700}',
          800: '{rintellixslate.800}',
          900: '{rintellixslate.900}',
          950: '{rintellixslate.950}'
        },
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}'
        },
        highlight: {
          background: '{rintellixblue.100}',
          focusBackground: '{rintellixblue.200}',
          color: '{rintellixblue.900}',
          focusColor: '{rintellixblue.900}'
        },
        content: {
          background: '{surface.0}',
          hoverBackground: '{surface.100}',
          borderColor: '{surface.200}',
          color: '{surface.900}',
          hoverColor: '{surface.900}'
        },
        overlay: {
          background: '{surface.0}',
          borderColor: '{surface.200}',
          color: '{surface.900}'
        }
      }
    }
  }
});
