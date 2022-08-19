import { useRoutes } from 'react-router-dom'
import routes from './modules/navigation/routes'
import tw from 'twin.macro'

function App() {
  const element = useRoutes(routes)

  return (
    <Main>
      {element}
    </Main>
  )
}

const Main = tw.main`
  container
  mx-auto
  relative
  py-8
`

export default App
