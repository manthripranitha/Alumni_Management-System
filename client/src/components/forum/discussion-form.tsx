import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertDiscussionSchema, insertReplySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";

// Extend the discussion schema for client-side validation
const discussionFormSchema = insertDiscussionSchema
  .extend({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
  });

type DiscussionFormValues = z.infer<typeof discussionFormSchema>;

interface DiscussionFormProps {
  onSubmit: (values: DiscussionFormValues) => void;
  isSubmitting: boolean;
}

export function DiscussionForm({ onSubmit, isSubmitting }: DiscussionFormProps) {
  const form = useForm<DiscussionFormValues>({
    resolver: zodResolver(discussionFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  function handleSubmit(values: DiscussionFormValues) {
    onSubmit({
      ...values,
      title: values.title.trim(),
      content: values.content.trim(),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start a New Discussion</CardTitle>
        <CardDescription>
          Share your thoughts, questions, or experiences with the alumni community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discussion Title</FormLabel>
                  <FormControl>
                    <Input placeholder="What would you like to discuss?" {...field} />
                  </FormControl>
                  <FormDescription>
                    Be specific and concise to attract more responses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide details to start the discussion" 
                      className="min-h-[200px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Start Discussion
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Extend the reply schema for client-side validation
const replyFormSchema = insertReplySchema
  .extend({
    content: z.string().min(5, "Reply must be at least 5 characters"),
  })
  .omit({ discussionId: true, createdBy: true });

type ReplyFormValues = z.infer<typeof replyFormSchema>;

interface ReplyFormProps {
  discussionId: number;
  onSubmit: (values: ReplyFormValues) => void;
  isSubmitting: boolean;
  isLocked?: boolean;
}

export function ReplyForm({ discussionId, onSubmit, isSubmitting, isLocked = false }: ReplyFormProps) {
  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      content: "",
    },
  });

  function handleSubmit(values: ReplyFormValues) {
    onSubmit({
      ...values,
      content: values.content.trim(),
    });
    form.reset();
  }

  if (isLocked) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <CardTitle className="text-lg mb-2">Add Your Reply</CardTitle>
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your reply here..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post Reply
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
