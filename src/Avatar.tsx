import React, {
  forwardRef,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Html, OrbitControls } from '@react-three/drei'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM, VRMLoaderPlugin, VRMHumanBoneName } from '@pixiv/three-vrm'
// import type * as VRMSchema from '@pixiv/types-vrm-0.0'
import { Group, Object3D, Vector3 } from 'three'
import { useControls } from 'leva'
import { random } from 'gsap'
import * as THREE from 'three'
interface AvatarProps {
  vrmpath: string
  person: Person
}

const Avatar = forwardRef(({ avatarId, person }: AvatarProps, ref) => {
  // static value
  const controls = {
    Head: 0,
    leftArm: 0.37,
    rightArm: -0.37
  }
  // const { ...controls } = useControls({
  //   Head: { value: 0, min: -0.4, max: 0.4 },
  //   leftArm: { value: 0.37, min: -0.4, max: 0.4 },
  //   rightArm: { value: -0.37, min: -0.4, max: 0.4 },
  //   // Neutral: { value: person.expression?.Neutral ?? 0., min: 0., max: 1. },
  //   // Angry: { value: person.expression?.Angry ?? 0., min: 0., max: 1. },
  //   // Relaxed: { value: person.expression?.Relaxed ?? 0., min: 0., max: 1. },
  //   // Happy: { value: person.expression?.Happy ?? 0., min: 0., max: 1. },
  //   // Sad: { value: person.expression?.Sad ?? 0., min: 0., max: 1. },
  //   // Surprised: { value: person.expression?.Surprised ?? 0., min: 0., max: 1. },
  //   // Extra: { value: 0, min: 0, max: 1 },
  // })

  const { scene, camera } = useThree()
  const [gltf, setGltf] = useState<GLTF>()
  const [progress, setProgress] = useState<number>(0)
  const avatar = useRef<VRM>()
  const [bonesStore, setBones] = useState<{ [part: string]: Object3D }>({})

  const seed = useMemo(() => {
    return Math.random()
  }, [])

  // const paths = [
  //   './ghostWhite.vrm',
  // ]
  // const path = vrmpath ?? paths[Math.floor(Math.random() * paths.length)]
  const path = './ghostWhite.vrm'

  useEffect(() => {
    if (!gltf) {
      // VRMUtils.removeUnnecessaryJoints(gltf.scene)

      const loader = new GLTFLoader()
      loader.register((parser) => {
        return new VRMLoaderPlugin(parser)
      })

      loader.load(
        path,
        (gltf) => {
          setGltf(gltf)
          const vrm: VRM = gltf.userData.vrm
          avatar.current = vrm
          vrm.lookAt.target = camera

          vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips).rotation.y =
            Math.PI
          const expressionNames = vrm.expressionManager.expressions.map(
            (expression) => expression.expressionName
          )
          // console.log(expressionNames)
          // VRMUtils.rotateVRM0(vrm)

          const bones = {
            head: vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head),
            neck: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Neck),
            hips: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Hips),
            spine: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Spine),
            upperChest: vrm.humanoid.getRawBoneNode(
              VRMHumanBoneName.UpperChest
            ),
            leftArm: vrm.humanoid.getNormalizedBoneNode(
              VRMHumanBoneName.LeftUpperArm
            ),
            rightArm: vrm.humanoid.getNormalizedBoneNode(
              VRMHumanBoneName.RightUpperArm
            ),
          }

          // bones.rightArm.rotation.z = -Math.PI / 4

          setBones(bones)
        },

        // called as loading progresses
        (xhr) => {
          setProgress((xhr.loaded / xhr.total) * 100)
          // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        // called when loading has errors
        (error) => {
          console.log('An error happened')
          console.log(error)
        }
      )
    }
  }, [scene, gltf, camera])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    
    if (avatar.current) {
      avatar.current.update(delta)

      avatar.current.lookAt?.lookAt(camera.position)

      const blinkDelay = 10 + Math.floor(seed * 3)
      const blinkFrequency = 2 + Math.floor(seed * 4)
      if (Math.round(t * blinkFrequency) % blinkDelay === 0) {
        avatar.current.expressionManager.setValue(
          'blink',
          1 - Math.abs(Math.sin(t * blinkFrequency * Math.PI))
        )
      }
      avatar.current.expressionManager.setValue(
        'neutral',
        person.expression?.Neutral ?? 0.0
      )
      avatar.current.expressionManager.setValue(
        'angry',
        person.expression?.Angry ?? 0.0
      )
      avatar.current.expressionManager.setValue(
        'relaxed',
        person.expression?.Relaxed ?? 0.0
      )
      avatar.current.expressionManager.setValue(
        'happy',
        person.expression?.Happy ?? 0.0
      )
      avatar.current.expressionManager.setValue(
        'sad',
        person.expression?.Sad ?? 0.0
      )
      avatar.current.expressionManager.setValue(
        'Surprised',
        person.expression?.Surprised ?? 0.0
      )
      // avatar.current.expressionManager.setValue('Extra', 0.0)
    }
    if (bonesStore.neck) {
      bonesStore.neck.rotation.y = (Math.PI / 100) * Math.sin((t / 4) * Math.PI)
      // const p = camera.position.clone()
      // const rel: Vector3 = p.clone().sub(avatar.current.scene.position)
      // p.x -=  2 * rel.x
      // p.z -=  2 * rel.z
      // console.log(camera.position);
      // console.log(p);
      // bonesStore.neck.lookAt(p);
      // bonesStore.neck.rotation.y += Math.PI
    }
    // if (bonesStore.spine) {
    //   bonesStore.spine.position.x = (Math.PI / 300) * Math.sin((t / 4) * Math.PI)
    //   bonesStore.spine.position.z = (Math.PI / 300) * Math.cos((t / 4) * Math.PI)
    // }

    if (bonesStore.upperChest) {
      bonesStore.upperChest.rotation.y =
        (Math.PI / 600) * Math.sin((t / 8) * Math.PI + seed * 10)
      bonesStore.spine.position.y =
        (Math.PI / 400) * Math.sin((t / 2) * Math.PI + seed * 10)
      bonesStore.spine.position.z =
        (Math.PI / 600) * Math.sin((t / 2) * Math.PI + seed * 10)
    }
    if (bonesStore.head) {
      // bonesStore.head.rotation.y -= controls.Head * Math.PI
      // bonesStore.head.lookAt(camera.position);
      // bonesStore.head.rotation.y -= controls.Head * Math.PI / 2
    }

    if (bonesStore.leftArm) {
      // bonesStore.leftArm.position.y = leftArm
      bonesStore.leftArm.rotation.z = controls.leftArm * Math.PI
    }
    if (bonesStore.rightArm) {
      bonesStore.rightArm.rotation.z = controls.rightArm * Math.PI
    }
  })

  const position = new THREE.Vector3(
    person.position?.x ?? 0,
    person.position?.y ?? 0,
    person.position?.z ?? 0
  )
  let rotation = new THREE.Euler().setFromVector3(
    new THREE.Vector3(
      person.rotation?.x ?? 0,
      person.rotation?.y ?? 0,
      person.rotation?.z ?? 0
    )
  )
  const quert = new THREE.Quaternion().setFromEuler(rotation)
  // quert.y = quert.y >= Math.PI ? quert.y - Math.PI : quert.y + Math.PI

  // console.log(gltf.scene)
  rotation = new THREE.Euler().setFromQuaternion(quert)

  return (
    <>
      <group
        position={[position.x, position.y - 0.4, position.z]}
        rotation={rotation}
        avatarId={avatarId}
        ref={ref}
      >
        <Html center occlude position={[0, 0.7, 0]}>
          <p style={{ fontSize: '5px', width: '100px' }}>{person.name}</p>
        </Html>
        <group rotation={[0, Math.PI, 0]}>
          {gltf ? (
            <Float
              speed={1 + seed} // Animation speed, defaults to 1
              rotationIntensity={1} // XYZ rotation intensity, defaults to 1
              floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
              floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
            >
              <>
                <primitive object={gltf.scene} />
              </>
            </Float>
          ) : (
            <Html center>{progress} % loaded</Html>
          )}
        </group>
      </group>
    </>
  )
})

export default Avatar
