import React from 'react'
import { Outlet, Link } from "react-router-dom";
import tw from 'twin.macro'
import BgPattern from '../../../assets/bg-pattern.svg'


export default function Layout() {
  return (
    <>
      <Background style={{ backgroundImage: `url(${BgPattern})` }} />
      <Wrapper>
        <Outlet />
      </Wrapper>
    </>
  );
}

const Background = tw.div`
  absolute
  w-full
  h-screen
  bg-no-repeat
  top-0

`
const Wrapper = tw.div`
  relative
  z-10
`