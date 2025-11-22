
'use client';

/**
 * Customization Panel Component
 * UI controls for adjusting game settings and properties
 * EXTENSION POINT: Add theme presets, advanced physics tuning, visual effects
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Zap, Heart } from 'lucide-react';
import { GameConfiguration } from '@/lib/game-engine/types';

interface CustomizationPanelProps {
  config: GameConfiguration;
  onChange: (config: GameConfiguration) => void;
}

export function CustomizationPanel({ config, onChange }: CustomizationPanelProps) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleChange = (key: keyof GameConfiguration, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="space-y-4">
      {/* Physics Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Physics Settings
          </CardTitle>
          <CardDescription>Adjust gravity and movement physics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gravity">
              Gravity: {localConfig.gravity.toFixed(2)}
            </Label>
            <Input
              id="gravity"
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={localConfig.gravity}
              onChange={(e) => handleChange('gravity', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="friction">
              Friction: {localConfig.friction.toFixed(2)}
            </Label>
            <Input
              id="friction"
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={localConfig.friction}
              onChange={(e) => handleChange('friction', parseFloat(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Player Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Player Settings
          </CardTitle>
          <CardDescription>Customize player abilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerSpeed">
              Speed: {localConfig.playerSpeed}
            </Label>
            <Input
              id="playerSpeed"
              type="range"
              min="2"
              max="10"
              step="1"
              value={localConfig.playerSpeed}
              onChange={(e) => handleChange('playerSpeed', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="playerJumpPower">
              Jump Power: {localConfig.playerJumpPower}
            </Label>
            <Input
              id="playerJumpPower"
              type="range"
              min="5"
              max="25"
              step="1"
              value={localConfig.playerJumpPower}
              onChange={(e) => handleChange('playerJumpPower', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="playerLives">
              Lives: {localConfig.playerLives}
            </Label>
            <Input
              id="playerLives"
              type="range"
              min="1"
              max="10"
              step="1"
              value={localConfig.playerLives}
              onChange={(e) => handleChange('playerLives', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Visual Settings
          </CardTitle>
          <CardDescription>Customize colors and appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={localConfig.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={localConfig.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="platformColor">Platform Color</Label>
            <div className="flex gap-2">
              <Input
                id="platformColor"
                type="color"
                value={localConfig.platformColor}
                onChange={(e) => handleChange('platformColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={localConfig.platformColor}
                onChange={(e) => handleChange('platformColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="playerColor">Player Color</Label>
            <div className="flex gap-2">
              <Input
                id="playerColor"
                type="color"
                value={localConfig.playerColor}
                onChange={(e) => handleChange('playerColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={localConfig.playerColor}
                onChange={(e) => handleChange('playerColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="enemyColor">Enemy Color</Label>
            <div className="flex gap-2">
              <Input
                id="enemyColor"
                type="color"
                value={localConfig.enemyColor}
                onChange={(e) => handleChange('enemyColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={localConfig.enemyColor}
                onChange={(e) => handleChange('enemyColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="collectibleColor">Collectible Color</Label>
            <div className="flex gap-2">
              <Input
                id="collectibleColor"
                type="color"
                value={localConfig.collectibleColor}
                onChange={(e) => handleChange('collectibleColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={localConfig.collectibleColor}
                onChange={(e) => handleChange('collectibleColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EXTENSION POINT: Add theme presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Theme Presets
          </CardTitle>
          <CardDescription>Quick theme templates (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" disabled>
              Classic
            </Button>
            <Button variant="outline" size="sm" disabled>
              Dark Mode
            </Button>
            <Button variant="outline" size="sm" disabled>
              Neon
            </Button>
            <Button variant="outline" size="sm" disabled>
              Retro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
