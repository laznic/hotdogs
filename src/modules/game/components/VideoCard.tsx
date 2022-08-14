import React, { useRef, useEffect } from 'react'
import tw from 'twin.macro'
import * as faceapi from '@vladmandic/face-api';
import takeLast from 'ramda/src/takeLast'

const MODEL_URL = '/models'

export default function VideoCard() {
  const videoElement = useRef(null)
  const requestAnimationRef = useRef(null)

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
        
        if (distanceBetweenLips >= 15) console.log('mouth open')
        else console.log('mouth closed')
      }

  }

  useAnimationFrame(() => onPlay())

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
    </Card>
  )
}

const useAnimationFrame = callback => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef();
  const previousTimeRef = React.useRef();
  /**
   * The callback function is automatically passed a timestamp indicating
   * the precise time requestAnimationFrame() was called.
   */

  React.useEffect(() => {
    const animate = time => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Make sure the effect runs only once
};

function sumYPositions(acc: number, curr: Record<string, number>) {
  return curr.y + acc
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