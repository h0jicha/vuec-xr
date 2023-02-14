import { XR } from '@react-three/xr/dist'
import Experience from './Experience'
import React from 'react'

export default function XRExperience() {

  return (
    <>
      <XR
        onSessionStart={(event) => {
          document.getElementById('root')!.hidden = true
          console.log(event.nativeEvent.target)
        }}
        onSessionEnd={(event) => {
          document.getElementById('root')!.hidden = false
        }}
      >
        <Experience />
      </XR>
    </>
  )
}
