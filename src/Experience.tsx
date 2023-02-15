import {
  useGLTF,
  OrbitControls,
  Environment,
  Html,
  useProgress,
  useKeyboardControls,
  PointerLockControls,
} from '@react-three/drei'
import { Perf } from 'r3f-perf'
import {
  InstancedRigidBodies,
  CylinderCollider,
  BallCollider,
  CuboidCollider,
  Debug,
  RigidBody,
  Physics,
} from '@react-three/rapier'
import { useMemo, useEffect, useState, useRef, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { UECSite } from './UECSite'
import Player from './Player.js'
// import Avatar from './vrmutils/Avatar'
import Avatar from './Avatar'
import Ocean from './Ocean'
import { useControls } from 'leva'
import { useXR } from '@react-three/xr'
import { log } from 'console'
import React from 'react'

import { io, Socket } from 'socket.io-client'
import useStore from './store/useStore'

export default function Experience(props) {
  // const [hitSound] = useState(() => new Audio('./hit.mp3'))
  const cube = useRef(null)
  const avatar = useRef(null)
  const avatarGroup = useRef(null)

  const controls = useRef(null)

  const { speed } = useControls({ speed: 10.0 })

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
        console.log(conns)
        setConnections(conns)
      })
      socket.emit('current_connections')

      // 他クライアントの座標回転受け取り
      socket.on('receive_client_info', (clientInfo) => {
        // console.log(clientInfo)
        setConnections(clientInfo)

        // viewもここで変更しちゃう
        if (avatarGroup && avatarGroup.current && clientInfo.id != clientId){
          const a = avatarGroup.current.children.find((avatar) => {
            return avatar.avatarId === clientInfo.id
          })
          if (a) {
            a.position.set(clientInfo.position.x, 0/*clientInfo.position.y - 1.2*/, clientInfo.position.z + 1.0)
            a.rotation.set(0, clientInfo.rotation.y + Math.PI * 1.0, 0)
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
    // https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html
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

  const cubeJump = () => {
    const mass = cube.current.mass()

    cube.current.applyImpulse({ x: 0, y: 5 * mass, z: 0 })
    cube.current.applyTorqueImpulse({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
    })
  }

  // const hamburger = useGLTF('./hamburger.glb')

  const cubesCount = 100
  const cubes = useRef()
  const cubeTransforms = useMemo(() => {
    const positions = []
    const rotations = []
    const scales = []

    for (let i = 0; i < cubesCount; i++) {
      positions.push([
        (Math.random() - 0.5) * 80 * 3,
        6 + i * 0.2,
        (Math.random() - 0.5) * 80 * 3,
      ])
      rotations.push([Math.random(), Math.random(), Math.random()])

      const scale = 0.2 + Math.random() * 0.8
      scales.push([scale, scale, scale])
    }

    return { positions, rotations, scales }
  }, [])

  return (
    <>
      <Perf position='top-left' />
      <axesHelper scale={100} />
      <gridHelper scale={1} />

      {/* <OrbitControls makeDefault maxPolarAngle={Math.PI * 0.5} /> */}
      {/* https://threejs.org/docs/#examples/en/controls/PointerLockControls */}
      <PointerLockControls ref={controls} makeDefault />

      <directionalLight castShadow position={[1, 2, 3]} intensity={5} />
      <ambientLight intensity={0.4} />

      <Environment
        // files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rustig_koppie_puresky_4k.hdr'
        files='https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/drakensberg_solitary_mountain_puresky_4k.hdr'
        background
      />

      <Avatar path='sampleF.vrm' ref={avatar} />
      <group ref={avatarGroup}>        
      {connections && Object.entries(connections).map(entry => {
          const [id, content] = entry
          // let position, rotation = null
          // if (id && content.position && content.rotation) {
          //   position = [content.position.x, content.position.y - 1.2, content.position.z + 1.0]
          //   rotation = [0, content.rotation.y + Math.PI, 0]
          // }
          return <Avatar key={id} avatarId={id}/>
        })}
      </group>
      <Avatar path='transparent.vrm' position={[1, 0, 0]} />
      <Avatar path='transparent.vrm' position={[2, 0, 0]} />
      <Avatar path='transparent.vrm' position={[3, 0, 0]} />

      <Physics gravity={[0, -9.81, 0]}>
        <RigidBody type='fixed' colliders={'trimesh'} position={[0, 0, 0]}>
          {/* <Suspense fallback={null}> */}
          <UECSite scale={1} position={[90, 0, 90]}></UECSite>
          {/* </Suspense> */}
        </RigidBody>

        <InstancedRigidBodies
          type='fixed'
          positions={cubeTransforms.positions}
          rotations={cubeTransforms.rotations}
          scales={cubeTransforms.scales}
        >
          <instancedMesh
            ref={cubes}
            castShadow
            receiveShadow
            args={[null, null, cubesCount]}
          >
            <boxGeometry />
            <meshStandardMaterial color='tomato' />
          </instancedMesh>
        </InstancedRigidBodies>
      </Physics>
    </>
  )
}
