import React from 'react'
import { Outlet, NavLink, Link } from "react-router-dom";
import tw from 'twin.macro'
import BgPattern from '../../../assets/bg-pattern.svg'
import { useSupabase } from '../../../contexts/SupabaseContext';
import GitHubLogo from '../../../assets/github-logo.png'

export default function Layout() {
  const { client, session } = useSupabase()

  async function handleLogout () {
    await client.auth.signOut()
  }

  const activeClass = 'font-black border-b-2 border-red-600'

  return (
    <>
      <Background style={{ backgroundImage: `url(${BgPattern})` }} />
      <Nav>
        <NavLinks>
          <li>
            <NavLink className={({ isActive }) => isActive ? activeClass : ''} to="/">Home</NavLink>
          </li>
          <li>
            <NavLink className={({ isActive }) => isActive ? activeClass : ''} to="/leaderboard">Leaderboard</NavLink>
          </li>
        </NavLinks>
        {session && <button onClick={handleLogout}>Logout</button>}
      </Nav>

      <Main>
        <Outlet />
      </Main>

      <Footer>
        <a className="hover:opacity-100 opacity-25" href="https://github.com/laznic/hotdogs" target="_blank" rel="noopener noreferrer">
          <img src={GitHubLogo} alt="GitHub Logo" />
        </a>
      </Footer>
    </>
  );
}

const Background = tw.div`
  fixed
  w-full
  h-screen
  bottom-0
  bg-no-repeat
  top-8
  overflow-hidden
`

const Nav = tw.nav`
  fixed
  top-0
  flex
  justify-between
  p-4
  z-20
  left-0
  right-0
  container
  mx-auto
  after:block
  after:absolute
  after:w-full
  after:h-full
  after:opacity-75
  after:bg-orange-300
  after:-z-10
  after:top-0
  after:left-0
`
const NavLinks = tw.ul`
  flex
  items-center
  gap-8
`

const Main = tw.main`
  container
  mx-auto
  relative
  py-8
  z-10
`

const Footer = tw.footer`
  relative
  flex
  justify-center
  items-center
  z-20
`