import { io } from 'socket.io-client'
import create, { State } from 'zustand'

const ENDPOINT = 'http://192.168.11.2:3040'

const useStore = create<State>((set, get) => ({
  socket: io(ENDPOINT, {
    transports: ['websocket'],
  }),
  clientId: null,
  setClientId: (id) => set(state => ({ clientId: id })),
  // increase: () => set(state => ({ count: state.count + 1 })),
  // decrease: () => set(state => ({ count: state.count - 1 }))
  connections: [],
  setConnections: (connection) => set((state) => {
    const conns = Object.entries(state.connections).filter(([key]) => key !== 'undefined')
      .reduce((obj, [key, value]) => {
        obj[key] = value
        return obj
      }, {})
    return {
      connections: {
        ...conns,
        [connection.id]: {
          position: connection.position,
          rotation: connection.rotation
        }
      }
    }
  }),
  delConnections: (id) => set((state) => {
    console.log('hoge', id)
      const newConnections = Object.fromEntries(
        Object.entries(state.connections).filter(([key]) => key !== id)
      )
      console.log('hoge', newConnections)
      return {
        connections: newConnections
      }
    }),
}))

export default useStore