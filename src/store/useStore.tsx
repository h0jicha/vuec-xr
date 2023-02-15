import { io } from 'socket.io-client'
import create from 'zustand'

const ENDPOINT = 'http://192.168.11.2:3040'

const useStore = create(set => ({
  socket: io(ENDPOINT, {
    transports: ['websocket'],
  }),
  clientId: null,
  setClientId: (id) => set(state => ({ clientId: id }))
  // increase: () => set(state => ({ count: state.count + 1 })),
  // decrease: () => set(state => ({ count: state.count - 1 }))
}))

export default useStore