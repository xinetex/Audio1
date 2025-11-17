import axios from 'axios'
import type {
  AudioAnalysis,
  VideoProject,
  ProjectSettings,
  GenerateImageRequest,
  GenerateImageResponse,
  ComposeVideoRequest,
  ComposeVideoResponse,
} from '@audiovisual-art-tool/shared'

const API_BASE = import.meta.env.DEV ? '/api' : 'http://localhost:3001/api'

export const api = {
  async uploadAudio(file: File) {
    const formData = new FormData()
    formData.append('audio', file)

    const response = await axios.post(`${API_BASE}/audio/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async analyzeAudio(filename: string): Promise<AudioAnalysis> {
    const response = await axios.post(`${API_BASE}/audio/analyze`, { filename })
    return response.data
  },

  async createProject(data: {
    name: string
    audioFile: string
    settings: ProjectSettings
  }): Promise<VideoProject> {
    const response = await axios.post(`${API_BASE}/project/create`, data)
    return response.data
  },

  async getProject(id: string): Promise<VideoProject> {
    const response = await axios.get(`${API_BASE}/project/${id}`)
    return response.data
  },

  async generateImage(
    request: GenerateImageRequest
  ): Promise<GenerateImageResponse> {
    const response = await axios.post(`${API_BASE}/image/generate`, request)
    return response.data
  },

  async composeVideo(
    request: ComposeVideoRequest
  ): Promise<ComposeVideoResponse> {
    const response = await axios.post(`${API_BASE}/video/compose`, request)
    return response.data
  },
}
