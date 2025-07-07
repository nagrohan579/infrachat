"use client"

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Chat {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatHistoryProps {
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onChatNameUpdate: (chatId: string, newName: string) => void;
  onChatDelete: (chatId: string) => void;
}

export function ChatHistory({
  currentChatId,
  onChatSelect,
  onNewChat,
  onChatNameUpdate,
  onChatDelete
}: ChatHistoryProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const chatData = await response.json();
        setChats(chatData);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatNameEdit = (chat: Chat) => {
    setEditingChatId(chat._id);
    setEditingName(chat.name);
  };

  const handleChatNameSave = async () => {
    if (!editingChatId || !editingName.trim()) return;

    try {
      const response = await fetch(`/api/chats/${editingChatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() })
      });

      if (response.ok) {
        onChatNameUpdate(editingChatId, editingName.trim());
        setChats(chats.map(chat => 
          chat._id === editingChatId 
            ? { ...chat, name: editingName.trim() }
            : chat
        ));
      }
    } catch (error) {
      console.error('Error updating chat name:', error);
    } finally {
      setEditingChatId(null);
      setEditingName("");
    }
  };

  const handleChatDelete = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setChats(chats.filter(chat => chat._id !== chatId));
        onChatDelete(chatId);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Refresh chats when a new chat is created
  useEffect(() => {
    if (currentChatId && !chats.find(chat => chat._id === currentChatId)) {
      fetchChats();
    }
  }, [currentChatId]);

  return (
    <div className={`bg-muted/50 border-r flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="font-semibold text-lg">Chat History</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={onNewChat}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading chats...
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No chats yet. Start a new conversation!
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`group p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                      currentChatId === chat._id ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                    onClick={() => onChatSelect(chat._id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      
                      {editingChatId === chat._id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleChatNameSave}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleChatNameSave();
                            }
                          }}
                          className="h-6 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="flex-1 text-sm font-medium truncate">
                          {chat.name}
                        </span>
                      )}

                      {/* Only show edit/delete buttons for current chat */}
                      {currentChatId === chat._id && editingChatId !== chat._id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatNameEdit(chat);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatDelete(chat._id);
                            }}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {formatDate(chat.updatedAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </>
      )}

      {/* Collapsed state - just show new chat button */}
      {isCollapsed && (
        <div className="p-2">
          <Button
            onClick={onNewChat}
            size="sm"
            variant="outline"
            className="w-full p-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
