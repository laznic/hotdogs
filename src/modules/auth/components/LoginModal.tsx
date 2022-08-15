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
      <LoginButton>Login via Twitter</LoginButton>
    </Wrapper>
  ) 
}

const Wrapper = tw.div`
  bg-rose-50
  rounded-xl
  shadow-2xl
  p-8
  w-fit
  mx-auto
  flex
  items-center
  justify-center
  border
  border-white
`

const LoginButton = tw.button`
  px-4
  py-2
  rounded
  bg-sky-500
  text-white
  hocus:bg-sky-600
`