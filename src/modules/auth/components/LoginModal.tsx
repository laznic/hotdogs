import tw from 'twin.macro'
import { useSupabase } from '../../../contexts/SupabaseContext'

export default function LoginModal () {
  const { client } = useSupabase()

  async function handleLogin () {
    await client.auth.signIn({
        provider: 'twitter'
     })
  }

  return (
    <Wrapper>
      <LoginButton onClick={handleLogin}>Login via Twitter to create a game</LoginButton>
    </Wrapper>
  ) 
}

const Wrapper = tw.div`
  text-center
`

const LoginButton = tw.button`
  bg-sky-500
  rounded-lg
  shadow-xl
  px-8
  py-5
  w-fit
  mx-auto
  flex
  items-center
  justify-center
  border
  border-sky-400
  text-white
  font-bold
  hocus:-translate-y-1
  hocus:shadow-2xl
  transition-all
`