import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { useWebSocket } from "@/hooks/use-websocket";
import { IChatMessage, cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronUp, MessageSquare, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CommunityFeedProps {
  className?: string;
}

export function CommunityFeed({ className }: CommunityFeedProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useUser();
  const { sendChatMessage } = useWebSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (event: CustomEvent<IChatMessage>) => {
      setMessages((prev) => [...prev, event.detail]);
    };

    window.addEventListener(
      "new-chat-message",
      handleNewMessage as EventListener
    );
    return () => {
      window.removeEventListener(
        "new-chat-message",
        handleNewMessage as EventListener
      );
    };
  }, []);

  const handleSendMessage = () => {
    if (!user || !newMessage.trim()) return;

    const message: Omit<IChatMessage, "_id"> = {
      userId: user.id,
      username: user.username,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    sendChatMessage(message);
    setNewMessage("");
  };

  return (
    <Card
      className={cn(
        "fixed bottom-4 left-4 w-80 shadow-lg transition-all duration-300",
        className
      )}
      style={{
        transform: isCollapsed
          ? "translateY(calc(100% - 40px))"
          : "translateY(0)",
        height: "500px",
      }}
    >
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <CardTitle className="text-sm">Community Chat</CardTitle>
          </div>
          <ChevronUp
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isCollapsed ? "rotate-180" : ""
            )}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 h-[calc(100%-60px)] flex flex-col">
        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                isOwn={message.userId === user?.id}
              />
            ))}
          </div>
        </ScrollArea>

        {user ? (
          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            Please log in to participate in the chat
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ChatMessageProps {
  message: IChatMessage;
  isOwn: boolean;
}

function ChatMessage({ message, isOwn }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn("flex flex-col", isOwn && "items-end")}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{message.username}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), "h:mm a")}
          </span>
        </div>
        <div
          className={cn(
            "p-2 rounded-lg bg-gray-100 text-sm",
            isOwn ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
