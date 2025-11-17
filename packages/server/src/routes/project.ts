import { Router } from 'express';
import type { VideoProject, KeyFrame, ProjectSettings } from '@audiovisual-art-tool/shared';

const router = Router();

// In-memory storage (replace with database in production)
const projects = new Map<string, VideoProject>();

router.post('/create', (req, res) => {
  try {
    const { name, audioFile, settings } = req.body as {
      name: string;
      audioFile: string;
      settings: ProjectSettings;
    };

    const project: VideoProject = {
      id: `project-${Date.now()}`,
      name,
      audioFile,
      keyFrames: [],
      settings,
      status: 'idle',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    projects.set(project.id, project);
    res.json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/:id', (req, res) => {
  const project = projects.get(req.params.id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(project);
});

router.put('/:id/keyframes', (req, res) => {
  const project = projects.get(req.params.id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const { keyFrames } = req.body as { keyFrames: KeyFrame[] };
  project.keyFrames = keyFrames;
  project.updatedAt = new Date();

  projects.set(project.id, project);
  res.json(project);
});

router.put('/:id/status', (req, res) => {
  const project = projects.get(req.params.id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const { status } = req.body;
  project.status = status;
  project.updatedAt = new Date();

  projects.set(project.id, project);
  res.json(project);
});

router.get('/', (_req, res) => {
  res.json(Array.from(projects.values()));
});

export { router as projectRouter };
