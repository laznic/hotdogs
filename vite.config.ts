import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import macrosPlugin from 'vite-plugin-babel-macros'

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    jsxFactory: 'jsx',
    jsxInject: 'import { jsx } from "@emotion/react"',
  },
  plugins: [react({
    babel: {
      plugins: [
        'babel-plugin-macros',
        [
          '@emotion/babel-plugin-jsx-pragmatic',
          {
            export: 'jsx',
            import: '__cssprop',
            module: '@emotion/react',
          },
        ],
        [
          '@babel/plugin-transform-react-jsx',
          { pragma: '__cssprop' },
          'twin.macro',
        ],
      ],
    }
  })]
})
