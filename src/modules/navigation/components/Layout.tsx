import React from 'react'
import { Outlet, Link } from "react-router-dom";
import tw from 'twin.macro'

export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}

const Nav = tw.nav``
const NavLinks = tw.ul`
  flex
  items-center
`
const Logo = tw(Link)`
  lg:text-5xl
  text-4xl
`