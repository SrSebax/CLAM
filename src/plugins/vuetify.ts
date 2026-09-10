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
          background: '#FFF0F6',
          surface: '#FFFFFF',
          primary: '#FF1493',
          secondary: '#9B30FF',
          accent: '#00CFFF',
          success: '#2E7D32',
          warning: '#ED6C02',
          error: '#D32F2F',
          info: '#0288D1',
          'page-bg': '#FFE4F1',
        },
      },
      clamDark: {
        dark: true,
        colors: {
          background: '#1a0f2e',
          surface: '#2a1a40',
          primary: '#FF69B4',
          secondary: '#BA55D3',
          'page-bg': '#150a24',
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: 'pill' },
    VCard: { rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
  },
})
