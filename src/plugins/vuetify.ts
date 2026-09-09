import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'clamLight',
    themes: {
      clamLight: {
        dark: false,
        colors: {
          background: '#FAFAFA',
          surface: '#FFFFFF',
          primary: '#2A5DB0',
          secondary: '#D9782E',
          accent: '#0F3460',
          success: '#2E7D32',
          warning: '#ED6C02',
          error: '#D32F2F',
          info: '#0288D1',
          'notebook-bg': '#FBF7EA',
        },
      },
      clamDark: {
        dark: true,
        colors: {
          background: '#0F0F1A',
          surface: '#1A1A2E',
          primary: '#7FA6E8',
          secondary: '#E8946A',
          'notebook-bg': '#14141F',
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: 'lg' },
    VCard: { rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
  },
})
