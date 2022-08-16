import React, { useRef, useEffect, useState } from 'react'
import tw from 'twin.macro'
import FaceBlock from './FaceBlock';

interface OtherPlayerCardProps {
  hotDogs: { bites: number, finished: boolean }[]
}

export default function OtherPlayerCard({ hotDogs }: OtherPlayerCardProps) {
  return (
    <Card>
      <FaceBlock hotDogsEaten={hotDogs?.length || 1} emoji={''} />
    </Card>
  )
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
  even:rotate-6
  odd:-rotate-2
  sm:even:translate-y-8
  sm:odd:-translate-y-4
  h-fit
  max-w-xs
`