
/**
 * Database Seeding Script
 * Creates test users and sample levels
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create test admin user
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create sample level
  const sampleLevelData = {
    configuration: {
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
    },
    entities: [
      {
        id: 'spawn',
        type: 'spawn',
        position: { x: 100, y: 400 },
        size: { x: 30, y: 30 },
        color: '#4CAF50',
      },
      {
        id: 'platform-ground',
        type: 'platform',
        position: { x: 0, y: 500 },
        size: { x: 1200, y: 50 },
        color: '#795548',
        friction: 0.85,
      },
      {
        id: 'platform-1',
        type: 'platform',
        position: { x: 200, y: 400 },
        size: { x: 150, y: 30 },
        color: '#795548',
        friction: 0.85,
      },
      {
        id: 'platform-2',
        type: 'platform',
        position: { x: 450, y: 350 },
        size: { x: 150, y: 30 },
        color: '#795548',
        friction: 0.85,
      },
      {
        id: 'platform-3',
        type: 'platform',
        position: { x: 700, y: 300 },
        size: { x: 150, y: 30 },
        color: '#795548',
        friction: 0.85,
      },
      {
        id: 'enemy-1',
        type: 'enemy',
        position: { x: 400, y: 450 },
        size: { x: 30, y: 30 },
        color: '#F44336',
        physics: {
          velocity: { x: 2, y: 0 },
          acceleration: { x: 0, y: 0 },
          gravity: 0.8,
          friction: 0.85,
        },
        patrolRange: 200,
        patrolStart: 400,
        damage: 25,
        aiPattern: 'patrol',
      },
      {
        id: 'collectible-1',
        type: 'collectible',
        position: { x: 250, y: 370 },
        size: { x: 20, y: 20 },
        color: '#FFC107',
        points: 10,
        collected: false,
      },
      {
        id: 'collectible-2',
        type: 'collectible',
        position: { x: 500, y: 320 },
        size: { x: 20, y: 20 },
        color: '#FFC107',
        points: 10,
        collected: false,
      },
      {
        id: 'collectible-3',
        type: 'collectible',
        position: { x: 750, y: 270 },
        size: { x: 20, y: 20 },
        color: '#FFC107',
        points: 10,
        collected: false,
      },
      {
        id: 'goal',
        type: 'goal',
        position: { x: 900, y: 250 },
        size: { x: 40, y: 60 },
        color: '#2196F3',
      },
    ],
  };

  await prisma.level.upsert({
    where: { id: 'sample-level-1' },
    update: {},
    create: {
      id: 'sample-level-1',
      userId: adminUser.id,
      title: 'Tutorial Level',
      description: 'A simple introductory level to learn the basics',
      levelData: sampleLevelData,
      isPublic: true,
    },
  });

  console.log('Created sample level');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
