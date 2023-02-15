import React, { forwardRef, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM, VRMLoaderPlugin, VRMHumanBoneName } from '@pixiv/three-vrm'
// import type * as VRMSchema from '@pixiv/types-vrm-0.0'
import { Group, Object3D, Vector3 } from 'three'
import { useControls } from 'leva'

/**
 * avatarId コンポーネントを一意に識別するためのid
 */
const Avatar = forwardRef(({ path = '/Arona220601_03.vrm', position = [0, 0, 0], avatarId}, ref) => {
  const { ...controls } = useControls({
    Head: { value: 0, min: -0.4, max: 0.4 },
    leftArm: { value: 0.37, min: -0.4, max: 0.4 },
    rightArm: { value: -0.37, min: -0.4, max: 0.4 },
    Neutral: { value: 0, min: 0, max: 1 },
    Angry: { value: 0, min: 0, max: 1 },
    Relaxed: { value: 0, min: 0, max: 1 },
    Happy: { value: 0, min: 0, max: 1 },
    Sad: { value: 0, min: 0, max: 1 },
    Surprised: { value: 0, min: 0, max: 1 },
    Extra: { value: 0, min: 0, max: 1 },
  })
  const { scene, camera } = useThree()
  // const gltf = useGLTF('/three-vrm-girl.vrm')
  const [gltf, setGltf] = useState<GLTF>()
  const [progress, setProgress] = useState<number>(0)
  const avatar = useRef<VRM>()
  const [bonesStore, setBones] = useState<{ [part: string]: Object3D }>({})

  const seed = useMemo(() => {
    return Math.random()
  }, [])

  // const avatarGroup = useRef<Group>()
  // const [avatarPosition, setAvatarPosition] = useState<Vector3>(new Vector3(0,0,0))

  // const loader = new GLTFLoader()
  // loader.register((parser) => new VRMLoaderPlugin(parser)) // here we are installing VRMLoaderPlugin

  useEffect(() => {
    if (!gltf) {
      // VRMUtils.removeUnnecessaryJoints(gltf.scene)

      // VRM.from(gltf as GLTF).then((vrm) => {

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

          // 初期位置設定
          // const p = camera.position.clone()
          // p.z += -1.0
          // p.y -= 1.2
          // vrm.scene.position.x = p.x
          // vrm.scene.position.y = p.y
          // vrm.scene.position.z = p.z

          // vrm.scene.castShadow = true
          // vrm.scene.receiveShadow = true

          vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips).rotation.y = Math.PI
          // console.log(vrm.blendShapeProxy.exp  ressions)
          // console.log(vrm.expressionManager.expressions)
          const expressionNames = vrm.expressionManager.expressions.map((expression) => expression.expressionName)
          console.log(expressionNames)
          // VRMUtils.rotateVRM0(vrm)

          const bones = {
            head: vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head),
            neck: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Neck),
            hips: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Hips),
            spine: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Spine),
            upperChest: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.UpperChest),
            leftArm: vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm),
            rightArm: vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm),
          }

          // bones.rightArm.rotation.z = -Math.PI / 4

          setBones(bones)
        },

        // called as loading progresses
        (xhr) => {
          setProgress((xhr.loaded / xhr.total) * 100)
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        // called when loading has errors
        (error) => {
          console.log('An error happened')
          console.log(error)
        },
      )
    }
  }, [scene, gltf, camera])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()

    // const p = camera.position.clone()
    // p.x -= - 0.5
    // p.y -= 1.2
    // setAvatarPosition(p)

    if (avatar.current) {
      avatar.current.update(delta)

      avatar.current.lookAt?.lookAt(camera.position)
      // avatar.current.scene.rotation.y = Math.PI * Math.sin(clock.getElapsedTime())
      // const p = camera.position.clone()
      // p.z += - 1.0
      // p.y -= 1.2
      // avatar.current.scene.position.x = p.x
      // avatar.current.scene.position.y = p.y
      // avatar.current.scene.position.z = p.z

      const blinkDelay = 10
      const blinkFrequency = 3
      if (Math.round(t * blinkFrequency) % blinkDelay === 0) {
        avatar.current.expressionManager.setValue('blink', 1 - Math.abs(Math.sin(t * blinkFrequency * Math.PI)))
      }
      avatar.current.expressionManager.setValue('neutral', controls.Neutral)
      avatar.current.expressionManager.setValue('angry', controls.Angry)
      avatar.current.expressionManager.setValue('relaxed', controls.Relaxed)
      avatar.current.expressionManager.setValue('happy', controls.Happy)
      avatar.current.expressionManager.setValue('sad', controls.Sad)
      avatar.current.expressionManager.setValue('Surprised', controls.Surprised)
      avatar.current.expressionManager.setValue('Extra', controls.Extra)
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
      bonesStore.upperChest.rotation.y = (Math.PI / 600) * Math.sin((t / 8) * Math.PI + seed * 10)
      bonesStore.spine.position.y = (Math.PI / 400) * Math.sin((t / 2) * Math.PI + seed * 10)
      bonesStore.spine.position.z = (Math.PI / 600) * Math.sin((t / 2) * Math.PI + seed * 10)
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
  return (
    <group position={position} ref={ref} avatarId={avatarId}>
      {gltf ? (
        <>
          <primitive object={gltf.scene} />
        </>
      ) : (
        <Html center>{progress} % loaded</Html>
      )}
    </group>
  )
})

export default Avatar