import React, { useRef, useEffect, useState } from 'react'
import tw, { styled } from 'twin.macro'
import * as faceapi from '@vladmandic/face-api';
import takeLast from 'ramda/src/takeLast'
import update from 'ramda/src/update'
import append from 'ramda/src/append'
import { useSupabase } from '../../../contexts/SupabaseContext';
import { useParams } from 'react-router-dom';
import FaceBlock from './FaceBlock';

const MODEL_URL = '/models'

interface MyPlayerCardProps {
  setEmoji: (emoji: string) => void
  emoji: string
  gameStarted: boolean
}

export default function MyPlayerCard({ setEmoji, emoji, gameStarted }: MyPlayerCardProps) {
  const videoElement = useRef<HTMLVideoElement>(null)
  const mouthState = useRef('closed')
  const hotDogBase = { bites: 0, finished: false }
  const [hotDogs, setHotDogs] = useState([hotDogBase])
  const currentDogIndex = useRef(0)

  const { client } = useSupabase()
  const session = client.auth.session()
  const params = useParams()

  async function onPlay () {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })
      const result = await faceapi.detectSingleFace(videoElement.current as faceapi.TNetInput, options).withFaceLandmarks(true)

      if (result) {
        const mouth = result.landmarks.getMouth()
        const bottomLip = takeLast(3, mouth)
        const upperLip = takeLast(3, mouth.slice(0, mouth.length - 4))
  
        const bottomLipPositionAverage = bottomLip.reduce(sumYPositions, 0) / bottomLip.length
        const upperLipPositionAverage = upperLip.reduce(sumYPositions, 0) / upperLip.length

        const distanceBetweenLips = getDifference(upperLipPositionAverage, bottomLipPositionAverage)
        
        if (distanceBetweenLips <= 200 && distanceBetweenLips >= 12) {
          mouthState.current = 'open'
          setEmoji('😄')
        } else {
          if (mouthState.current === 'open') {
            setEmoji('😊')
            mouthState.current = 'closed'

            if (gameStarted) {
              const bites = hotDogs[currentDogIndex.current]?.bites + 1 || 0
              const finished = bites === 3
              let updatedDogs = update(currentDogIndex.current, { bites, finished }, hotDogs)
  
              if (finished) {
                updatedDogs = append(hotDogBase, updatedDogs)
                currentDogIndex.current = currentDogIndex.current + 1
              }
  
              setHotDogs(updatedDogs)
              await client.from('games_players').update({
                  hotdogs: updatedDogs 
                })
                .match({ user_id: session?.user?.id, game: params?.id })
              }
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

      if (videoElement.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
        videoElement.current.srcObject = stream
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (gameStarted) {
      setHotDogs([hotDogBase])
    }
  }, [gameStarted])

  return (
    <Card>
      <video ref={videoElement} autoPlay muted playsInline className="w-0 h-0" />
      <FaceBlock hotDogsEaten={hotDogs.length} emoji={emoji} currentHotDogBites={hotDogs[currentDogIndex.current]?.bites} />
    </Card>
  )
}

const useAnimationFrame = (callback: () => void, deps: unknown) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef()
  /**
   * The callback function is automatically passed a timestamp indicating
   * the precise time requestAnimationFrame() was called.
   */

  useEffect(() => {
    const animate = () => {
      callback()
      requestRef.current = requestAnimationFrame(animate)
    }
  
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [deps]) // Make sure the effect runs only once
}

function sumYPositions(acc: number, curr: Record<string, number>) {
  return curr._y + acc
}

function getDifference(a: number, b: number) {
  return Math.abs(a - b);
}

const Card = tw.div`
  bg-white
  border-neutral-200
  rounded-md
  border-b-2
  border-r-2
  p-4
  overflow-hidden
  shadow-2xl
`