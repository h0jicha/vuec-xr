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

import { gsap } from "gsap";


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

  const socket = useStore(state => state.socket)
  const clientId = useStore(state => state.clientId)
  const setClientId = useStore(state => state.setClientId)
  const connections = useStore(state => state.connections)
  const setConnections = useStore(state => state.setConnections)
  const delConnections = useStore(state => state.delConnections)

  // const [connections, setConnections] = useState(null)

  console.log(connections)

  // カメラの座標をサーバーに送信する関数
  const sendPosition = (position) => {
    if (!clientId) {
      return //
    }
    const positionData = {
      x: position.x,
      y: position.y,
      z: position.z
    }
    socket.emit('send_position', positionData)
  }
  // カメラの回転をサーバーに送信する関数
  const sendRotation = (rotation) => {
    if (!clientId) {
      return //
    }
    const rotationData = {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z
    }
    socket.emit('send_rotation', rotationData)
  }

  useEffect(() => {
    socket.on('receive_id', async (id) => {
      console.log('clientId: ' + id)
      if (!id) {
        socket.emit('check_id')
      }
      // id取得完了
      setClientId(id)

      // 接続済みアバターの初期設定
      socket.on('current_connections', (conns) => {
        console.log('入室:', conns)
        setConnections(conns)
      })
      socket.emit('current_connections')

      // 他クライアントの座標回転受け取り
      socket.on('receive_client_info', (clientInfo) => {
        setConnections(clientInfo)

        // viewもここで変更しちゃう
        if (avatarGroup && avatarGroup.current && clientInfo.id != clientId){
          const a = avatarGroup.current.children.find((avatar) => {
            return avatar.avatarId === clientInfo.id
          })
          if (a) {
            // position
            const pos = {x: a.position.x, y: a.position.y, z: a.position.z }
            gsap.to(pos, {
              ease: 'power1.inOut',
              x: clientInfo.position.x,
              y: clientInfo.position.y -0.,
              z: clientInfo.position.z,
              duration: 1.0,
              onUpdate: () => {
                a.position.set(pos.x, pos.y, pos.z)
              }
            });

            // rotation
            const rot = {x: a.rotation.x, y: a.rotation.y, z: a.rotation.z }
            gsap.to(rot, {
              ease: 'power1.inOut',
              y: -clientInfo.rotation.y,
              duration: 1.0,
              onUpdate: () => {
                a.rotation.set(0, rot.y, 0)
              },
            });
          }
        }
      })

      // 定期的に座標を投げることにしてる
      setInterval(() => {
        sendPosition(camera.position)
        sendRotation(camera.rotation)
      }, 1000)

      // 誰かの退室時
      socket.on('delete_connection', (id) => {
        console.log('退室:', id)
        delConnections(id)
        const avatar = avatarGroup.current.children.find((avatar) => avatar.avatarId === id)
        console.log(avatar)
        avatarGroup.current.remove(avatar)
      })
    });

    socket.emit('check_id')
  }, [clientId])

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()

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
  })

  return (
    <>
      <Perf position='top-left' />
      {/* <axesHelper scale={100} />
      <gridHelper scale={1} /> */}

      {/* <OrbitControls makeDefault maxPolarAngle={Math.PI * 0.5} /> */}
      <PointerLockControls ref={controls} makeDefault />

      <directionalLight castShadow position={[1, 2, 3]} intensity={5} />
      <ambientLight intensity={0.4} />

      {showEnv ? <Environment
        files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rustig_koppie_puresky_4k.hdr'
        // files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/drakensberg_solitary_mountain_puresky_4k.hdr'
        background
      />
      :
      <Environment
        files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rustig_koppie_puresky_4k.hdr'
        // files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/drakensberg_solitary_mountain_puresky_4k.hdr'
      />}

      {/* <Avatar path='whiteGhost.vrm' ref={avatar} /> */}
      <group ref={avatarGroup}>        
      {connections && Object.entries(connections).map(entry => {
          const [id, content] = entry
          return <Avatar key={id} avatarId={id}/>
        })}
      </group>
          <UECSite scale={1} position={[-74, 0, 55]}></UECSite>
    </>
  )
}
