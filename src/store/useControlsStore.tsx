import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ControlsState {
  pointerLocked: boolean
  setPointerLocked: (pointerLocked: boolean) => void
  keyboardControlsEnabled: boolean
  setKeyboardControlsEnabled: (keyboardControlsEnabled: boolean) => void
}

const useControlsStore = create<ControlsState>()(
  devtools(
      (set) => ({
        pointerLocked: true,
        setPointerLocked: (pointerLocked) => set((state) => ({ pointerLocked: pointerLocked })),
        keyboardControlsEnabled: true,
        setKeyboardControlsEnabled: (keyboardControlsEnabled) => set((state) => ({ keyboardControlsEnabled: keyboardControlsEnabled })),
      }),
      {
        name: 'controls-storage',
      }
  )
)

export default useControlsStore