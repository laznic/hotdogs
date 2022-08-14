import React, { useRef, useEffect, useState } from 'react'
import tw from 'twin.macro'
import * as faceapi from '@vladmandic/face-api';
import takeLast from 'ramda/src/takeLast'
import update from 'ramda/src/update'
import append from 'ramda/src/append'

const MODEL_URL = '/models'

export default function VideoCard() {
  const videoElement = useRef(null)
  const mouthState = useRef(null)
  const hotDogBase = { bites: 0, finished: false }
  const [hotDogs, setHotDogs] = useState([hotDogBase])
  const currentDogIndex = useRef(0)

  async function onPlay () {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })
      const result = await faceapi.detectSingleFace(videoElement.current, options).withFaceLandmarks(true)

      if (result) {
        const mouth = result.landmarks.getMouth()
        const bottomLip = takeLast(3, mouth)
        const upperLip = takeLast(3, mouth.slice(0, mouth.length - 4))
  
        const bottomLipPositionAverage = bottomLip.reduce(sumYPositions, 0) / bottomLip.length
        const upperLipPositionAverage = upperLip.reduce(sumYPositions, 0) / upperLip.length

        const distanceBetweenLips = getDifference(upperLipPositionAverage, bottomLipPositionAverage)
        
        if (distanceBetweenLips <= 55 && distanceBetweenLips >= 12) {
          mouthState.current = 'open'
        } else {
          if (mouthState.current === 'open') {
            const bites = hotDogs[currentDogIndex.current].bites + 1
            const finished = bites === 3
            let updatedDogs = update(currentDogIndex.current, { bites, finished }, hotDogs)

            if (finished) {
              updatedDogs = append(hotDogBase, updatedDogs)
              currentDogIndex.current = currentDogIndex.current + 1
            }

            setHotDogs(updatedDogs)
            mouthState.current = 'closed'
          }
        }
      }
  }

  useAnimationFrame(() => onPlay(), hotDogs)

  async function loadModels () {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL)
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
  }

  useEffect(function loadVideo () {
    async function load() {
      loadModels()
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      videoElement.current.srcObject = stream
    }

    load()
  }, [])

  return (
    <Card>
      <video ref={videoElement} autoPlay muted playsInline />
      {hotDogs.map((hotDog: Record<string, unknown>, index: number) => <p key={index}>bites: {hotDog.bites} - finished: {hotDog.finished ? 'true' : 'false'}</p>)}
    </Card>
  )
}

const useAnimationFrame = (callback: () => void, deps: unknown) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef()
  /**
   * The callback function is automatically passed a timestamp indicating
   * the precise time requestAnimationFrame() was called.
   */

  React.useEffect(() => {
    const animate = () => {
      callback()
      requestRef.current = requestAnimationFrame(animate)
    }
  
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [deps]) // Make sure the effect runs only once
}

function sumYPositions(acc: number, curr: Record<string, number>) {
  return curr._y + acc
}

function getDifference(a: number, b: number) {
  return Math.abs(a - b);
}

const Card = tw.div`
  rounded-md
  border-neutral-200
  border
  p-4
  bg-white
`