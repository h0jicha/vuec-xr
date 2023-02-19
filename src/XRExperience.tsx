import { XR } from '@react-three/xr/dist'
import Experience from './Experience'
import React from 'react'

export default function XRExperience() {

  return (
    <>
      <XR
        onSessionStart={(event) => {
          document.getElementById('root')!.hidden = true

          // ずれを調整
          console.log(event)

          // HACK: ARView用のDOM要素が用意されるまで待つ
          setTimeout(() => {
            const divElements = document.querySelectorAll('body > div');
            divElements.forEach((div) => {
              console.log(div)
              div.style.position = 'fixed';
            }, 1000);
          })
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
