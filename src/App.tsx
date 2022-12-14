import { useRoutes } from 'react-router-dom'
import routes from './modules/navigation/routes'

function App() {
  const element = useRoutes(routes)

  return element
}

export default App
