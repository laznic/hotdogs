import React from 'react'
import tw from 'twin.macro'
import { useRef } from 'react';
import { useEffect } from 'react';

export default function VideoCard() {
  const videoElement = useRef(null)

  useEffect(function loadVideo () {
    async function load() {
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

const Card = tw.div`
  rounded-md
  border-neutral-200
  border
  p-4
  bg-white
`