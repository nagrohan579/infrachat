"use client"

import { useState, useEffect } from "react";
import { Cloud, Zap, Shield, Code } from "lucide-react";
import { ChatInterface } from "@/components/chat-interface";
import { ChatHistory } from "@/components/chat-history";
import { ThemeToggle } from "@/components/theme-toggle";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function Home() {
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const handleStartChat = () => {
    setIsChatMode(true);
  };

  const handleBackToHome = () => {
    setIsChatMode(false);
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleChatSelect = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const chat = await response.json();
        // Convert timestamp strings to Date objects
        const messagesWithDates = (chat.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
        setCurrentChatId(chatId);
        setIsChatMode(true);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Chat', messages: [] })
      });
      
      if (response.ok) {
        const newChat = await response.json();
        setCurrentChatId(newChat._id);
        setMessages([]);
        setIsChatMode(true);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleChatNameUpdate = (chatId: string, newName: string) => {
    // This is handled by the ChatHistory component
  };

  const handleChatDelete = (chatId: string) => {
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
      setIsChatMode(false);
    }
  };

  // Save messages to current chat when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const saveMessages = async () => {
        try {
          console.log('Saving messages to database:', messages.length, 'messages');
          await fetch(`/api/chats/${currentChatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
          });
        } catch (error) {
          console.error('Error saving messages:', error);
        }
      };
      
      // Reduce debounce time to save more frequently
      const timeoutId = setTimeout(saveMessages, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId]);

  if (isChatMode) {
    // Full screen chat mode with sidebar
    return (
      <div className="h-screen bg-background flex transition-all duration-700 ease-in-out animate-fade-in">
        {/* Chat History Sidebar */}
        <ChatHistory
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onChatNameUpdate={handleChatNameUpdate}
          onChatDelete={handleChatDelete}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 z-50 animate-slide-down">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  InfraChat
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBackToHome}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Home
                </button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col animate-fade-in-up overflow-hidden">
            <ChatInterface 
              onStartChat={handleStartChat} 
              isFullScreen={true} 
              messages={messages}
              setMessages={setMessages}
              currentChatId={currentChatId}
            />
          </div>
        </div>
      </div>
    );
  }

  // Welcome mode - also with sidebar
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      {/* Chat History Sidebar */}
      <ChatHistory
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onChatNameUpdate={handleChatNameUpdate}
        onChatDelete={handleChatDelete}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Cloud className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                InfraChat
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center">
          {/* Welcome Section */}
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Cloud Infrastructure Assistant
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto text-lg">
              Chat with AI to provision and manage cloud infrastructure using Terraform. 
              Build, scale, and optimize your cloud resources with natural language.
            </p>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
              <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Instant Provisioning</h3>
                <p className="text-muted-foreground text-center">
                  Deploy infrastructure in minutes with AI-generated Terraform configurations
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Security First</h3>
                <p className="text-muted-foreground text-center">
                  Built-in security best practices and compliance standards
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Code Generation</h3>
                <p className="text-muted-foreground text-center">
                  Generate production-ready Terraform code from simple descriptions
                </p>
              </div>
            </div>

            {/* Chat Input Area */}
            <div className="max-w-4xl mx-auto">
              <ChatInterface 
                onStartChat={handleNewChat} 
                isFullScreen={false} 
                messages={messages}
                setMessages={setMessages}
                currentChatId={currentChatId}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>Built with Next.js, shadcn/ui, and Terraform integration</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
