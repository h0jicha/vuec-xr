import { io } from 'socket.io-client'
import create, { State } from 'zustand'

// const ENDPOINT = 'https://vuecxr.ddns.net'
const ENDPOINT = 'http://192.168.11.3:3000'

const useStore = create<State>((set, get) => ({
  socket: io(ENDPOINT),
  myPersonId: null,
  setMyPersonId: (id) => set(state => ({ myPersonId: id })),
  // increase: () => set(state => ({ count: state.count + 1 })),
  // decrease: () => set(state => ({ count: state.count - 1 }))
  connections: [],
  setConnections: (conns) => set((state) => {
    // const conns = Object.entries(state.connections).filter(([key]) => key !== 'undefined')
    //   .reduce((obj, [key, value]) => {
    //     obj[key] = value
    //     return obj
    //   }, {})
    return {
      connections: conns
    }
  }),
  addConnections: (id) => set((state) => {
    // const conns = Object.entries(state.connections).filter(([key]) => key !== 'undefined')
    //   .reduce((obj, [key, value]) => {
    //     obj[key] = value
    //     return obj
    //   }, {})
    // console.log(id)
    if (state.connections[id]) {
      return state
    } else {
      return {
        connections: [...state.connections]
      }
    }
  }),
  delConnections: (id) => set((state) => {
    console.log('hoge', id)
      delete state.connections[id]
      console.log('hoge', state.connections)
      return state
    }),
}))

export default useStore