import { Child } from '@/types/child'
import { StateCreator, create } from 'zustand'

type ChildrenState = {
  children?: Child[]
  update: (by: Child[]) => void
}

export const createStoreChildren: StateCreator<ChildrenState> = (set) => ({
  update: (children) => set(() => ({ children }))
})

export const useStoreChildren = create<ChildrenState>(createStoreChildren)
