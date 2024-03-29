import { io } from 'socket.io-client'
import create, { State } from 'zustand'

const ENDPOINT = 'https://vuec-api.ddns.net'
// const ENDPOINT = 'http://127.0.0.1:3000'

const useStore = create<State>((set, get) => ({
  socket: io(ENDPOINT),
  myPersonId: null,
  setMyPersonId: (id) => set((state) => ({ myPersonId: id })),
  personDict: {},
  setPersonDict: (pDict: PersonDict) =>
    set((state) => {
      return {
        ...state,
        personDict: pDict
      }
    }),
  addPerson: (p: Person) =>
    set((state) => {
      return {
        personDict: {
          ...state.personDict,
          [p.id]: p
        }
      }
    }),
  updatePerson: (p: Person) =>
    set((state) => {
      return {
        personDict: {
          ...state.personDict,
          [p.id]: {
            ...state.personDict[p.id],
            ...p
          }
        }
      }
    }),
  delPerson: (id: string) =>
    set((state) => {
      const { [id]: deletedPerson, ...restPersonDict } = state.personDict
      return {
        personDict: restPersonDict
      }
    }),
}))

export default useStore
