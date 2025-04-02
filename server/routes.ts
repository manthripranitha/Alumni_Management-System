import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertEventSchema, 
  insertJobSchema, 
  insertGallerySchema, 
  insertGalleryImageSchema, 
  insertDiscussionSchema, 
  insertReplySchema,
  insertEventRegistrationSchema
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user is an admin
function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // User routes
  app.get("/api/users", ensureAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords before sending
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get("/api/users/:id", ensureAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password before sending
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.put("/api/users/:id", ensureAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      // Only allow users to update their own profile unless they're an admin
      if (userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "You can only update your own profile" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password before sending
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.delete("/api/users/:id", ensureAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  
  app.post("/api/events", ensureAdmin, async (req, res) => {
    try {
      console.log("Received event creation request with body:", req.body);
      
      // Check if the request body has all required fields
      if (!req.body.title || !req.body.description || !req.body.date || !req.body.location) {
        console.log("Missing required fields in event creation request");
        return res.status(400).json({ 
          message: "Missing required fields",
          missing: {
            title: !req.body.title,
            description: !req.body.description,
            date: !req.body.date,
            location: !req.body.location
          }
        });
      }
      
      // Try to validate the data
      try {
        const validatedData = insertEventSchema.parse(req.body);
        console.log("Event data validated successfully:", validatedData);
        
        // Create the event
        const event = await storage.createEvent({
          ...validatedData,
          createdBy: req.user.id,
        });
        
        console.log("Event created successfully:", event);
        res.status(201).json(event);
      } catch (validationError) {
        console.error("Validation error during event creation:", validationError);
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({ message: "Validation error", errors: validationError.errors });
        }
        throw validationError; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error("Error during event creation:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  app.put("/api/events/:id", ensureAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  app.delete("/api/events/:id", ensureAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const deleted = await storage.deleteEvent(eventId);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // Event Registration routes
  app.get("/api/events/:eventId/registrations", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      // Only allow admins to see all registrations
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const registrations = await storage.getEventRegistrationsByEvent(eventId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });
  
  app.post("/api/events/:eventId/register", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user already registered
      const existingRegistrations = await storage.getEventRegistrationsByUser(req.user.id);
      const alreadyRegistered = existingRegistrations.some(reg => reg.eventId === eventId);
      if (alreadyRegistered) {
        return res.status(400).json({ message: "You are already registered for this event" });
      }
      
      const validatedData = insertEventRegistrationSchema.parse({
        eventId,
        userId: req.user.id
      });
      
      const registration = await storage.createEventRegistration(validatedData);
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register for event" });
    }
  });
  
  app.delete("/api/events/:eventId/unregister", ensureAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Find user's registration for this event
      const registrations = await storage.getEventRegistrationsByUser(req.user.id);
      const registration = registrations.find(reg => reg.eventId === eventId);
      
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      const deleted = await storage.deleteEventRegistration(registration.id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to unregister" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to unregister from event" });
    }
  });
  
  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(parseInt(req.params.id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });
  
  app.post("/api/jobs", ensureAdmin, async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob({
        ...validatedData,
        postedBy: req.user.id
      });
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });
  
  app.put("/api/jobs/:id", ensureAdmin, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
    }
  });
  
  app.delete("/api/jobs/:id", ensureAdmin, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const deleted = await storage.deleteJob(jobId);
      if (!deleted) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });
  
  // Gallery routes
  app.get("/api/galleries", async (req, res) => {
    try {
      const galleries = await storage.getGalleries();
      res.json(galleries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch galleries" });
    }
  });
  
  app.get("/api/galleries/:id", async (req, res) => {
    try {
      const gallery = await storage.getGallery(parseInt(req.params.id));
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });
  
  app.post("/api/galleries", ensureAdmin, async (req, res) => {
    try {
      const validatedData = insertGallerySchema.parse(req.body);
      const gallery = await storage.createGallery({
        ...validatedData,
        createdBy: req.user.id
      });
      res.status(201).json(gallery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gallery" });
    }
  });
  
  app.put("/api/galleries/:id", ensureAdmin, async (req, res) => {
    try {
      const galleryId = parseInt(req.params.id);
      const gallery = await storage.getGallery(galleryId);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      
      const updatedGallery = await storage.updateGallery(galleryId, req.body);
      res.json(updatedGallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to update gallery" });
    }
  });
  
  app.delete("/api/galleries/:id", ensureAdmin, async (req, res) => {
    try {
      const galleryId = parseInt(req.params.id);
      const deleted = await storage.deleteGallery(galleryId);
      if (!deleted) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery" });
    }
  });
  
  // Gallery Images routes
  app.get("/api/galleries/:galleryId/images", async (req, res) => {
    try {
      const galleryId = parseInt(req.params.galleryId);
      const images = await storage.getGalleryImagesByGallery(galleryId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });
  
  app.post("/api/galleries/:galleryId/images", ensureAdmin, async (req, res) => {
    try {
      const galleryId = parseInt(req.params.galleryId);
      
      // Check if gallery exists
      const gallery = await storage.getGallery(galleryId);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      
      const validatedData = insertGalleryImageSchema.parse({
        ...req.body,
        galleryId,
        uploadedBy: req.user.id
      });
      
      const image = await storage.createGalleryImage(validatedData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  
  app.delete("/api/gallery-images/:id", ensureAdmin, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const deleted = await storage.deleteGalleryImage(imageId);
      if (!deleted) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete image" });
    }
  });
  
  // Discussion routes
  app.get("/api/discussions", async (req, res) => {
    try {
      const discussions = await storage.getDiscussions();
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });
  
  app.get("/api/discussions/:id", async (req, res) => {
    try {
      const discussion = await storage.getDiscussion(parseInt(req.params.id));
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json(discussion);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussion" });
    }
  });
  
  app.post("/api/discussions", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDiscussionSchema.parse(req.body);
      const discussion = await storage.createDiscussion({
        ...validatedData,
        createdBy: req.user.id
      });
      res.status(201).json(discussion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create discussion" });
    }
  });
  
  app.put("/api/discussions/:id", ensureAuthenticated, async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(discussionId);
      
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      // Only allow creator or admin to update
      if (discussion.createdBy !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: You can only update your own discussions" });
      }
      
      const updatedDiscussion = await storage.updateDiscussion(discussionId, req.body);
      res.json(updatedDiscussion);
    } catch (error) {
      res.status(500).json({ message: "Failed to update discussion" });
    }
  });
  
  app.delete("/api/discussions/:id", ensureAuthenticated, async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(discussionId);
      
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      // Only allow creator or admin to delete
      if (discussion.createdBy !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own discussions" });
      }
      
      const deleted = await storage.deleteDiscussion(discussionId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete discussion" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete discussion" });
    }
  });
  
  // Reply routes
  app.get("/api/discussions/:discussionId/replies", async (req, res) => {
    try {
      const discussionId = parseInt(req.params.discussionId);
      const replies = await storage.getRepliesByDiscussion(discussionId);
      res.json(replies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });
  
  app.post("/api/discussions/:discussionId/replies", ensureAuthenticated, async (req, res) => {
    try {
      const discussionId = parseInt(req.params.discussionId);
      
      // Check if discussion exists and is not locked
      const discussion = await storage.getDiscussion(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      if (discussion.isLocked) {
        return res.status(403).json({ message: "Discussion is locked" });
      }
      
      const validatedData = insertReplySchema.parse({
        ...req.body,
        discussionId,
        createdBy: req.user.id
      });
      
      const reply = await storage.createReply(validatedData);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reply" });
    }
  });
  
  app.put("/api/replies/:id", ensureAuthenticated, async (req, res) => {
    try {
      const replyId = parseInt(req.params.id);
      const reply = await storage.getReply(replyId);
      
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      
      // Only allow creator or admin to update
      if (reply.createdBy !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: You can only update your own replies" });
      }
      
      // Check if discussion is locked
      const discussion = await storage.getDiscussion(reply.discussionId);
      if (discussion?.isLocked && !req.user.isAdmin) {
        return res.status(403).json({ message: "Discussion is locked" });
      }
      
      const updatedReply = await storage.updateReply(replyId, req.body);
      res.json(updatedReply);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reply" });
    }
  });
  
  app.delete("/api/replies/:id", ensureAuthenticated, async (req, res) => {
    try {
      const replyId = parseInt(req.params.id);
      const reply = await storage.getReply(replyId);
      
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      
      // Only allow creator or admin to delete
      if (reply.createdBy !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own replies" });
      }
      
      const deleted = await storage.deleteReply(replyId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete reply" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reply" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
