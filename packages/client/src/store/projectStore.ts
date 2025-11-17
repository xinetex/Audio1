import { create } from 'zustand'
import type { VideoProject, KeyFrame, AudioAnalysis } from '@audiovisual-art-tool/shared'

interface ProjectStore {
  project: VideoProject | null
  audioFile: File | null
  currentTime: number
  selectedKeyFrame: KeyFrame | null
  
  setProject: (project: VideoProject) => void
  setAudioFile: (file: File) => void
  setAudioAnalysis: (analysis: AudioAnalysis) => void
  setCurrentTime: (time: number) => void
  addKeyFrame: (keyFrame: KeyFrame) => void
  updateKeyFrame: (id: string, updates: Partial<KeyFrame>) => void
  deleteKeyFrame: (id: string) => void
  selectKeyFrame: (id: string | null) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  project: null,
  audioFile: null,
  currentTime: 0,
  selectedKeyFrame: null,

  setProject: (project) => set({ project }),
  
  setAudioFile: (file) => set({ audioFile: file }),
  
  setAudioAnalysis: (analysis) =>
    set((state) =>
      state.project
        ? { project: { ...state.project, audioAnalysis: analysis } }
        : state
    ),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  addKeyFrame: (keyFrame) =>
    set((state) =>
      state.project
        ? {
            project: {
              ...state.project,
              keyFrames: [...state.project.keyFrames, keyFrame],
            },
          }
        : state
    ),
  
  updateKeyFrame: (id, updates) =>
    set((state) =>
      state.project
        ? {
            project: {
              ...state.project,
              keyFrames: state.project.keyFrames.map((kf) =>
                kf.id === id ? { ...kf, ...updates } : kf
              ),
            },
          }
        : state
    ),
  
  deleteKeyFrame: (id) =>
    set((state) =>
      state.project
        ? {
            project: {
              ...state.project,
              keyFrames: state.project.keyFrames.filter((kf) => kf.id !== id),
            },
            selectedKeyFrame:
              state.selectedKeyFrame?.id === id ? null : state.selectedKeyFrame,
          }
        : state
    ),
  
  selectKeyFrame: (id) =>
    set((state) => ({
      selectedKeyFrame: id
        ? state.project?.keyFrames.find((kf) => kf.id === id) || null
        : null,
    })),
}))
