import React from 'react'
import { Global } from '@emotion/react'
import tw, { css, GlobalStyles as BaseStyles } from 'twin.macro'

const customStyles = css`
  html, body, #root {
    height: 100%;
  }
  body {
    ${tw`antialiased bg-gradient-to-b from-orange-300 to-rose-300 h-100vh bg-fixed`}
  }
`

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <Global styles={customStyles} />
  </>
)

export default GlobalStyles