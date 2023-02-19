import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import Explanation from './Explanation'
import Bgm from './Bgm'
import { ARButton } from '@react-three/xr/dist'
import XRExperience from './XRExperience'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
  <>
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
        { name: 'esc', keys: ['Esc'] },
        { name: 'enter', keys: ['Enter'] },
        { name: 'tab', keys: ['Tab'] },
        { name: 'shift', keys: ['Shift'] },
        { name: 'ctrl', keys: ['Control'] },
      ]}
    >
      <Canvas
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 100,
          position: [Math.random() * 10 - 5, 1.3, Math.random() * 10 - 5],
          rotation: [0, Math.random() * 2 * Math.PI, 0]
          // position: [90, 1.4, 90],
        }}
      >
        <XRExperience/>
      </Canvas>
      <Explanation/>
      <ARButton />
      <Bgm />
    </KeyboardControls>
  </>
)
