import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Chat } from '@/models/Chat';

// GET /api/chats - Get all chats
export async function GET() {
  try {
    await connectDB();
    
    const chats = await Chat.find({}, { name: 1, createdAt: 1, updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .limit(50);
    
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

// POST /api/chats - Create a new chat
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name = 'New Chat', messages = [] } = await request.json();
    
    const chat = new Chat({
      name,
      messages
    });
    
    const savedChat = await chat.save();
    
    return NextResponse.json(savedChat, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}
