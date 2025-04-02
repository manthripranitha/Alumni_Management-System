import { Link } from "wouter";
import { formatDistance } from "date-fns";
import { MessageSquare, Lock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface DiscussionProps {
  discussion: {
    id: number;
    title: string;
    content: string;
    createdBy: {
      id: number;
      firstName: string;
      lastName: string;
      profileImage?: string | null;
    };
    createdAt: Date;
    isLocked: boolean;
    replyCount: number;
  };
  onLockToggle?: () => void;
  onDelete?: () => void;
}

export function DiscussionCard({ discussion, onLockToggle, onDelete }: DiscussionProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const isAuthor = user?.id === discussion.createdBy.id;
  const canModerate = isAdmin || isAuthor;
  const createdAt = new Date(discussion.createdAt);
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link href={`/forum/${discussion.id}`}>
              <a className="hover:underline">
                <CardTitle className="text-xl">{discussion.title}</CardTitle>
              </a>
            </Link>
            <div className="flex items-center mt-1">
              <CardDescription>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {discussion.replyCount} {discussion.replyCount === 1 ? 'reply' : 'replies'}
                </span>
              </CardDescription>
              <span className="mx-2">•</span>
              <CardDescription>
                {formatDistance(createdAt, new Date(), { addSuffix: true })}
              </CardDescription>
              {discussion.isLocked && (
                <>
                  <span className="mx-2">•</span>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="flex items-center mb-3">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={discussion.createdBy.profileImage || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {discussion.createdBy.firstName.charAt(0)}
              {discussion.createdBy.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">
            {discussion.createdBy.firstName} {discussion.createdBy.lastName}
          </span>
        </div>
        
        <p className="text-sm text-gray-700 line-clamp-3">{discussion.content}</p>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <Link href={`/forum/${discussion.id}`}>
          <a className="text-primary hover:text-primary-dark font-medium text-sm">View Discussion</a>
        </Link>
        
        {canModerate && (
          <div className="flex space-x-2">
            {isAdmin && onLockToggle && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLockToggle}
                className={discussion.isLocked ? "text-amber-600" : "text-gray-600"}
              >
                <Lock className="h-4 w-4 mr-1" />
                {discussion.isLocked ? "Unlock" : "Lock"}
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDelete}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export function DiscussionDetailCard({ discussion, onLockToggle, onDelete }: DiscussionProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const isAuthor = user?.id === discussion.createdBy.id;
  const canModerate = isAdmin || isAuthor;
  const createdAt = new Date(discussion.createdAt);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{discussion.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <span>Started {formatDistance(createdAt, new Date(), { addSuffix: true })}</span>
              {discussion.isLocked && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Locked
                </Badge>
              )}
            </CardDescription>
          </div>
          
          {canModerate && (
            <div className="flex space-x-2">
              {isAdmin && onLockToggle && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onLockToggle}
                  className={discussion.isLocked ? "text-amber-600" : "text-gray-600"}
                >
                  <Lock className="h-4 w-4 mr-1" />
                  {discussion.isLocked ? "Unlock" : "Lock"}
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onDelete}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={discussion.createdBy.profileImage || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {discussion.createdBy.firstName.charAt(0)}
              {discussion.createdBy.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="font-medium">
                {discussion.createdBy.firstName} {discussion.createdBy.lastName}
              </h3>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                {formatDistance(createdAt, new Date(), { addSuffix: true })}
              </span>
            </div>
            
            <div className="mt-2 text-gray-700 whitespace-pre-line">
              {discussion.content}
            </div>
          </div>
        </div>
        
        {discussion.isLocked && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-amber-800">
                This discussion has been locked. No new replies can be added.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReplyCard({ 
  reply,
  onDelete 
}: { 
  reply: {
    id: number;
    content: string;
    createdBy: {
      id: number;
      firstName: string;
      lastName: string;
      profileImage?: string | null;
    };
    createdAt: Date;
  };
  onDelete?: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const isAuthor = user?.id === reply.createdBy.id;
  const canDelete = isAdmin || isAuthor;
  const createdAt = new Date(reply.createdAt);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={reply.createdBy.profileImage || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {reply.createdBy.firstName.charAt(0)}
              {reply.createdBy.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="font-medium">
                  {reply.createdBy.firstName} {reply.createdBy.lastName}
                </h3>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {formatDistance(createdAt, new Date(), { addSuffix: true })}
                </span>
              </div>
              
              {canDelete && onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDelete}
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </div>
            
            <div className="mt-2 text-gray-700 whitespace-pre-line">
              {reply.content}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
