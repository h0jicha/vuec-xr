import React, { useRef, useMemo } from 'react'
import { extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'

import { Water } from 'three-stdlib'

extend({ Water })

function Ocean(props) {
  const ref = useRef(null)
  const gl = useThree((state) => state.gl)
  const waterNormals = useLoader(
    THREE.TextureLoader,
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg',
  )

  // const { waterColor, sunColor } = useControls({
  //   // waterColor: '#17288b',
  //   waterColor: '#9EF7FC',
  //   sunColor: '#eb8934',
  // })
  const waterColor = '#17288b'
  const sunColor = '#eb8934'

  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
  const geom = useMemo(() => new THREE.PlaneGeometry(30000, 30000), [])
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: sunColor,
      waterColor: waterColor,
      distortionScale: 40,
      fog: false,
      format: gl.encoding,
    }),
    [waterNormals, waterColor, sunColor],
  )
  useFrame((state, delta) => (ref.current.material.uniforms.time.value += delta))
  return (
    <group {...props}>
      <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} position={[0, 0, 0]} />
    </group>
  )
}

export default Ocean
