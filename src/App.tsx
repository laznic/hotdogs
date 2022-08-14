import { useRoutes } from 'react-router-dom'
import routes from './modules/navigation/routes'
import * as faceapi from 'face-api.js';
import { useEffect } from 'react';

const MODEL_URL = '/models'

function App() {
  const element = useRoutes(routes)

  useEffect(() => {
    async function loadModels () {
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
      await faceapi.loadFaceLandmarkTinyModel(MODEL_URL)
      await faceapi.loadFaceLandmarkModel(MODEL_URL)
      await faceapi.loadFaceRecognitionModel(MODEL_URL)
      await faceapi.loadFaceExpressionModel(MODEL_URL)
      console.log(faceapi.nets)
    }

    loadModels()
  }, [])

  return (
    <div>
      {element}
    </div>
  )
}

export default App
