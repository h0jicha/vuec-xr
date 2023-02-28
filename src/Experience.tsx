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
import useControlsStore from './store/useControlsStore'

import { gsap } from 'gsap'
import Dictaphone from './Dictaphone'
import { Quaternion, Vector3, Euler, Group } from 'three'

const EPSILON_ANGLE = 0.001

export default function Experience(props) {
  // const [hitSound] = useState(() => new Audio('./hit.mp3'))
  // const cube = useRef(null)
  // const avatar = useRef(null)
  const avatarGroup = useRef<Group>(null)

  const { speed } = useControls({ speed: 5.0 })
  const { ARViewSetting } = useControls({ ARViewSetting: false })
  useControls({ 操作説明: `
  - PC: マウスでカメラ操作+キーで移動
  - スマホ: ARView（実験的）
  ` })

  const xr = useXR()
  const { camera, canvas } = useThree()

  /**
   * Controls
   */
  // PointerLockControls
  const pointerLockControlsRef = useRef<typeof PointerLockControls>(null)
  const pointerLocked = useControlsStore<boolean>(
    (state) => state.pointerLocked
  )

  // KeyboardControls
  const keyboardControlsEnabled = useControlsStore(
    (state) => state.keyboardControlsEnabled
  )
  const moveForward = useKeyboardControls((state) => state.forward)
  const moveBackward = useKeyboardControls((state) => state.backward)
  const moveLeft = useKeyboardControls((state) => state.leftward)
  const moveRight = useKeyboardControls((state) => state.rightward)

  // Debug mode
  const { debugMode } = useControls({ debugMode: false })

  /**
   * Other States
   */
  const socket = useStore((state) => state.socket)
  const myPersonId = useStore((state) => state.myPersonId)
  const setMyPersonId = useStore((state) => state.setMyPersonId)
  const connections = useStore((state) => state.connections)
  const setConnections = useStore((state) => state.setConnections)
  const addConnections = useStore((state) => state.addConnections)
  const delConnections = useStore((state) => state.delConnections)
  const personDict = useStore<PersonDict>((state) => state.personDict)
  const setPersonDict = useStore<(PersonDict: PersonDict) => void>(
    (state) => state.setPersonDict
  )

  // const [personDict, setPersonDict] = useState<PersonDict>({})

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
    console.log('[send-pose]', p, r)

    socket.emit('send-pose', { position: p, rotation: r })
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
    if (
      keyboardControlsEnabled &&
      pointerLockControlsRef.current &&
      pointerLockControlsRef.current.isLocked
    ) {
      if (xr.session) {
        pointerLockControlsRef.current.unlock()
      }

      // console.log(moveForward, moveBackward, moveLeft, moveRight);

      const velocity = { x: speed, y: speed, z: speed }
      if (moveForward) {
        pointerLockControlsRef.current.moveForward(velocity.z * delta)
      }
      if (moveBackward) {
        pointerLockControlsRef.current.moveForward(-velocity.z * delta)
      }
      if (moveLeft) {
        pointerLockControlsRef.current.moveRight(-velocity.x * delta)
      }
      if (moveRight) {
        pointerLockControlsRef.current.moveRight(velocity.x * delta)
      }
    }

    lastCameraRotationRef.current = currentCameraRotation.clone()
  })

  return (
    <>
      {/* Debug */}
      {debugMode ?? <>
        <Perf position='top-left' />
        <axesHelper scale={10} />
        <gridHelper scale={1} />
        </>
      }

      {/* Controls */}
      {/* <OrbitControls makeDefault maxPolarAngle={Math.PI * 0.5} /> */}
      <PointerLockControls
        ref={pointerLockControlsRef}
        args={[camera, canvas]}
        enabled={pointerLocked}
      />

      {/* Environment */}
      <directionalLight castShadow position={[1, 2, 3]} intensity={5} />
      <ambientLight intensity={0.4} />
      <Environment
        files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rustig_koppie_puresky_4k.hdr'
        // files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/drakensberg_solitary_mountain_puresky_4k.hdr'
        background={!ARViewSetting}
      />

      {/* Meshes */}
      <UECSite scale={1} position={[-74, 0, 55]}></UECSite>
      <group ref={avatarGroup}>
        {personDict && // todo: ここのイテレーションが処理のカク月になっている気がするので、なくしたい
          Object.entries(personDict).map((arr) => {
            const [personId, person] = arr
            console.log(arr)
            if (personId !== myPersonId) {
              return (
                <Avatar key={personId} avatarId={personId} person={person} />
              )
            }
          })}
      </group>
    </>
  )
}
