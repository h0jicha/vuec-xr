import React from 'react'
import Explanation from './Explanation'
import Bgm from './Bgm'
import { ARButton } from '@react-three/xr/dist'
import GlobalInfo from './GlobalInfo'

function HTMLInterface() {
  return (
    <>
      <div className='interface'>
        <GlobalInfo/>
        <Explanation />
        <ARButton />
        <Bgm />
      </div>
    </>
  )
}

export default HTMLInterface
