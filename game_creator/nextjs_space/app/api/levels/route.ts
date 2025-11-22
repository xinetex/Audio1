
/**
 * API Routes for Level CRUD Operations
 * EXTENSION POINT: Add versioning, collaborative editing, level validation
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get all levels (public or user's own)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'public';

    let levels;

    if (filter === 'my-levels' && session?.user?.id) {
      levels = await prisma.level.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      levels = await prisma.level.findMany({
        where: { isPublic: true },
        orderBy: { plays: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: 50,
      });
    }

    return NextResponse.json({ levels });
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

// Create a new level
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, levelData, isPublic } = body;

    if (!title || !levelData) {
      return NextResponse.json(
        { error: 'Title and level data are required' },
        { status: 400 }
      );
    }

    const level = await prisma.level.create({
      data: {
        userId: session.user.id,
        title,
        description: description || '',
        levelData,
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json({ level }, { status: 201 });
  } catch (error) {
    console.error('Error creating level:', error);
    return NextResponse.json(
      { error: 'Failed to create level' },
      { status: 500 }
    );
  }
}

// EXTENSION POINT: Add batch operations for importing multiple levels
