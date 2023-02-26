import {
  Environment,
  useKeyboardControls,
  PointerLockControls,
} from '@react-three/drei'
import { Perf } from 'r3f-perf'

import { useMemo, useEffect, useState, useRef, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { UECSite } from './UECSite'
// import Avatar from './vrmutils/Avatar'
import Avatar from './Avatar'
import Ocean from './Ocean'
import { useControls } from 'leva'
import { useXR } from '@react-three/xr'
import React from 'react'

import useStore from './store/useStore'

import { gsap } from 'gsap'
import Dictaphone from './Dictaphone'
import { Quaternion, Vector3, Euler } from 'three'

interface PersonDict {
  [personId: string]: Person
}

const EPSILON_ANGLE = 0.001

export default function Experience(props) {
  // const [hitSound] = useState(() => new Audio('./hit.mp3'))
  // const cube = useRef(null)
  // const avatar = useRef(null)
  const avatarGroup = useRef(null)

  const controls = useRef(null)

  const { speed } = useControls({ speed: 3.0 })
  const { showEnv } = useControls({ showEnv: true })

  const xr = useXR()
  const { camera } = useThree()

  const moveForward = useKeyboardControls((state) => state.forward)
  const moveBackward = useKeyboardControls((state) => state.backward)
  const moveLeft = useKeyboardControls((state) => state.leftward)
  const moveRight = useKeyboardControls((state) => state.rightward)

  const socket = useStore((state) => state.socket)
  const myPersonId = useStore((state) => state.myPersonId)
  const setMyPersonId = useStore((state) => state.setMyPersonId)
  const connections = useStore((state) => state.connections)
  const setConnections = useStore((state) => state.setConnections)
  const addConnections = useStore((state) => state.addConnections)
  const delConnections = useStore((state) => state.delConnections)

  const [personDict, setPersonDict] = useState<PersonDict>({})

  // カメラの回転を判定するため
  const lastCameraRotationRef = useRef<Quaternion>(
    new Quaternion().setFromEuler(camera.rotation)
  )

  // const [connections, setConnections] = useState(null)

  // console.log(connections)

  // カメラの座標をサーバーに送信する関数
  const sendPose = (position: Vector3, rotation: Euler) => {
    if (!myPersonId) {
      return //
    }
    const p = {
      x: position.x,
      y: position.y,
      z: position.z,
    }
    const r = {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
    }
    console.log('sendopose', p, r);
    
    socket.emit('send-pose', {position: p, rotation: r})
  }

  useEffect(() => {
    socket.on('receive_id', async (id) => {
      console.log('[myPersonId]', id)
      if (!id) {
        socket.emit('check_id')
      }
      // id取得完了
      setMyPersonId(id)

      // 接続済みアバターの初期設定
      socket.on('current_connections', (conns) => {
        console.log('[connections]', conns)
        setConnections(conns)

        // person情報更新
        socket.on('update-person', (p: Person) => {
          setPersonDict({
            ...personDict,
            [p.id]: p,
          })
          console.log('[update person]', p)
        })

        // 誰かの入室時
        socket.on('someone-connected', (p: Person) => {
          console.log('入室:', p.id)
          addConnections(p.id)
          setPersonDict({
            ...personDict,
            [p.id]: p,
          })
        })

        // 誰かの退室時
        socket.on('someone-disconnected', (id) => {
          console.log('退室:', id)
          delConnections(id)
          const newPersonDict: PersonDict = Object.keys(personDict).reduce(
            (acc, key) => {
              if (key !== id) {
                acc[key] = personDict[key]
              }
              return acc
            },
            {}
          )
          setPersonDict(newPersonDict)
        })
      })
      socket.emit('current_connections')
    })
    socket.emit('check_id')
  }, [])

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()

    const hasMoved = moveForward || moveBackward || moveLeft || moveRight

    // 前フレームからカメラが回転したかを判定する
    const currentCameraRotation = camera.quaternion.clone()
    const angleDelta = currentCameraRotation.angleTo(
      lastCameraRotationRef.current
    )
    if (angleDelta > EPSILON_ANGLE) {
      console.log('Camera has rotated!')
    }
    const hasRotated = angleDelta > EPSILON_ANGLE

    if (hasMoved || hasRotated) {
      // 毎フレームやっていいのか🤔
      // positionとrotation方がいいのでは
      sendPose(camera.position, camera.rotation)
    }

    // controls
    if (controls && controls.current.isLocked) {
      if (xr.session) {
        controls.current.unlock()
      }

      const velocity = { x: speed, y: speed, z: speed }
      if (moveForward) {
        controls.current.moveForward(velocity.z * delta)
      }
      if (moveBackward) {
        controls.current.moveForward(-velocity.z * delta)
      }
      if (moveLeft) {
        controls.current.moveRight(-velocity.x * delta)
      }
      if (moveRight) {
        controls.current.moveRight(velocity.x * delta)
      }
    }

    lastCameraRotationRef.current = currentCameraRotation.clone()
  })

  return (
    <>
      {/* Debug */}
      <Perf position='top-left' />
      <axesHelper scale={10} />
      {/* <gridHelper scale={1} /> */}

      {/* Controls */}
      {/* <OrbitControls makeDefault maxPolarAngle={Math.PI * 0.5} /> */}
      <PointerLockControls ref={controls} makeDefault />

      {/* Environment */}
      <directionalLight castShadow position={[1, 2, 3]} intensity={5} />
      <ambientLight intensity={0.4} />
      <Environment
        files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rustig_koppie_puresky_4k.hdr'
        // files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/drakensberg_solitary_mountain_puresky_4k.hdr'
        background={showEnv}
      />

      {/* Meshes */}
      <UECSite scale={1} position={[-74, 0, 55]}></UECSite>
      <group ref={avatarGroup}>
        {personDict && // todo: ここのイテレーションが処理のカク月になっている気がするので、なくしたい
          Object.entries(personDict).map((arr) => {
            const [personId, person] = arr
            console.log(arr)
            return <Avatar key={personId} avatarId={personId} person={person} />
          })}
      </group>
    </>
  )
}
