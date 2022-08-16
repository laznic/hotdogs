import React, { useRef, useEffect, useState } from 'react'
import tw, { styled } from 'twin.macro'
import FaceBlock from './FaceBlock';

interface OtherPlayerCardProps {
  hotDogs: { bites: number, finished: boolean }[],
  ready: boolean
}

export default function OtherPlayerCard({ hotDogs, ready }: OtherPlayerCardProps) {
  return (
    <Card ready={ready}>
      <FaceBlock hotDogsEaten={hotDogs?.length || 1} emoji={''} />
    </Card>
  )
}

const Card = styled.div(({ ready }: { ready: boolean }) => [
  tw`
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
  `,
  ready && tw`ring-8 ring-violet-500 border-transparent border-4 after:content-['Ready'] after:inline-flex after:text-violet-500 after:translate-y-2 text-center text-xl font-black`
])