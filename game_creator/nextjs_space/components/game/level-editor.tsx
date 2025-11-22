
'use client';

/**
 * Level Editor Component
 * Interactive canvas for creating and editing game levels
 * EXTENSION POINT: Add grid snapping, copy/paste, undo/redo, multi-select
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Grid3x3,
  Square,
  Circle,
  Flag,
  Coins,
  Play,
  Save,
  Trash2,
  Settings,
} from 'lucide-react';
import { EntityType, GameEntity, LevelData } from '@/lib/game-engine/types';
import { createPlatform, createEnemy, createCollectible, createGoal } from '@/lib/game-engine/entities';

interface LevelEditorProps {
  initialLevelData?: LevelData;
  onSave?: (levelData: LevelData) => void;
  onPlay?: (levelData: LevelData) => void;
}

export function LevelEditor({ initialLevelData, onSave, onPlay }: LevelEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<EntityType | null>(EntityType.PLATFORM);
  const [entities, setEntities] = useState<GameEntity[]>(initialLevelData?.entities || []);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const [config, setConfig] = useState(
    initialLevelData?.configuration || {
      gravity: 0.8,
      friction: 0.85,
      playerSpeed: 5,
      playerJumpPower: 15,
      playerLives: 3,
      backgroundColor: '#87CEEB',
      platformColor: '#795548',
      playerColor: '#4CAF50',
      enemyColor: '#F44336',
      collectibleColor: '#FFC107',
    }
  );

  // Render the editor canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 50;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw all entities
    entities.forEach((entity) => {
      const isSelected = entity.id === selectedEntity;
      ctx.fillStyle = entity.color || '#000000';

      // Draw selection highlight
      if (isSelected) {
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          entity.position.x - 2,
          entity.position.y - 2,
          entity.size.x + 4,
          entity.size.y + 4
        );
      }

      // Draw entity
      ctx.fillRect(entity.position.x, entity.position.y, entity.size.x, entity.size.y);

      // Draw entity icon/label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        entity.type.charAt(0).toUpperCase(),
        entity.position.x + entity.size.x / 2,
        entity.position.y + entity.size.y / 2 + 4
      );
    });

    // Draw preview when dragging
    if (isDragging && dragStart && selectedTool) {
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        dragStart.x,
        dragStart.y,
        100,
        selectedTool === EntityType.PLATFORM ? 50 : 30
      );
      ctx.setLineDash([]);
    }
  }, [entities, selectedEntity, isDragging, dragStart, selectedTool, showGrid, config.backgroundColor]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const snapToGrid = (value: number, gridSize: number = 10) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    // Check if clicking on existing entity
    const clickedEntity = entities.find(
      (entity) =>
        coords.x >= entity.position.x &&
        coords.x <= entity.position.x + entity.size.x &&
        coords.y >= entity.position.y &&
        coords.y <= entity.position.y + entity.size.y
    );

    if (clickedEntity) {
      setSelectedEntity(clickedEntity.id);
      return;
    }

    // Start drawing new entity
    if (selectedTool) {
      setIsDragging(true);
      setDragStart({ x: snapToGrid(coords.x), y: snapToGrid(coords.y) });
      setSelectedEntity(null);
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || !selectedTool) return;

    const coords = getCanvasCoordinates(e);
    const snappedX = snapToGrid(dragStart.x);
    const snappedY = snapToGrid(dragStart.y);

    let newEntity: GameEntity | null = null;

    switch (selectedTool) {
      case EntityType.PLATFORM:
        newEntity = createPlatform(
          { x: snappedX, y: snappedY },
          { x: 100, y: 50 },
          config.platformColor
        );
        break;
      case EntityType.ENEMY:
        newEntity = createEnemy({ x: snappedX, y: snappedY }, config);
        break;
      case EntityType.COLLECTIBLE:
        newEntity = createCollectible({ x: snappedX, y: snappedY }, config);
        break;
      case EntityType.GOAL:
        newEntity = createGoal({ x: snappedX, y: snappedY });
        break;
      case EntityType.SPAWN:
        // Remove existing spawn points
        const filteredEntities = entities.filter((e) => e.type !== EntityType.SPAWN);
        newEntity = {
          id: 'spawn',
          type: EntityType.SPAWN,
          position: { x: snappedX, y: snappedY },
          size: { x: 30, y: 30 },
          color: config.playerColor,
        };
        setEntities([...filteredEntities, newEntity]);
        setIsDragging(false);
        setDragStart(null);
        return;
    }

    if (newEntity) {
      setEntities([...entities, newEntity]);
    }

    setIsDragging(false);
    setDragStart(null);
  };

  const handleDeleteSelected = () => {
    if (selectedEntity) {
      setEntities(entities.filter((e) => e.id !== selectedEntity));
      setSelectedEntity(null);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all entities?')) {
      setEntities([]);
      setSelectedEntity(null);
    }
  };

  const handleSave = () => {
    const levelData: LevelData = {
      title: initialLevelData?.title || 'Untitled Level',
      description: initialLevelData?.description,
      configuration: config,
      entities,
    };
    onSave?.(levelData);
  };

  const handlePlay = () => {
    // Check if level has spawn and goal
    const hasSpawn = entities.some((e) => e.type === EntityType.SPAWN);
    const hasGoal = entities.some((e) => e.type === EntityType.GOAL);

    if (!hasSpawn) {
      alert('Please add a spawn point before playing');
      return;
    }

    if (!hasGoal) {
      alert('Please add a goal flag before playing');
      return;
    }

    const levelData: LevelData = {
      title: initialLevelData?.title || 'Test Level',
      configuration: config,
      entities,
    };
    onPlay?.(levelData);
  };

  const tools = [
    { type: EntityType.SPAWN, icon: Circle, label: 'Spawn', color: 'text-green-600' },
    { type: EntityType.PLATFORM, icon: Square, label: 'Platform', color: 'text-brown-600' },
    { type: EntityType.ENEMY, icon: Grid3x3, label: 'Enemy', color: 'text-red-600' },
    { type: EntityType.COLLECTIBLE, icon: Coins, label: 'Coin', color: 'text-yellow-600' },
    { type: EntityType.GOAL, icon: Flag, label: 'Goal', color: 'text-blue-600' },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tools:</span>
            {tools.map((tool) => (
              <Button
                key={tool.type}
                variant={selectedTool === tool.type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTool(tool.type)}
                className="gap-2"
              >
                <tool.icon className={`h-4 w-4 ${selectedTool === tool.type ? '' : tool.color}`} />
                {tool.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={!selectedEntity}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button variant="default" size="sm" onClick={handlePlay} className="gap-2">
              <Play className="h-4 w-4" />
              Play
            </Button>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="flex-1 p-4 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className="border border-gray-300 rounded cursor-crosshair bg-white"
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
        />
      </Card>

      {/* Info Panel */}
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">
          <p><strong>Entities:</strong> {entities.length}</p>
          <p><strong>Selected Tool:</strong> {selectedTool || 'None'}</p>
          {selectedEntity && (
            <p><strong>Selected Entity:</strong> {entities.find(e => e.id === selectedEntity)?.type}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
