import React from 'react'
import VideoCard from "./VideoCard";

export default function Room() {
  return (
    <>
      <p>room</p>
      <section className="grid grid-cols-4">
        <VideoCard />
      </section>
    </>
  )
}