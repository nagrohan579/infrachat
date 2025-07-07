import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Chat } from '@/models/Chat';
import { Types } from 'mongoose';

// GET /api/chats/[id] - Get a specific chat
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }
    
    const chat = await Chat.findById(id);
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

// PUT /api/chats/[id] - Update a chat (name or messages)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }
    
    const updates = await request.json();
    
    const chat = await Chat.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

// DELETE /api/chats/[id] - Delete a chat
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }
    
    const chat = await Chat.findByIdAndDelete(id);
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
