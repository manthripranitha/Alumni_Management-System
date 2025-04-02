import { 
  User, InsertUser, 
  Event, InsertEvent, 
  EventRegistration, InsertEventRegistration,
  Job, InsertJob,
  Gallery, InsertGallery,
  GalleryImage, InsertGalleryImage,
  Discussion, InsertDiscussion,
  Reply, InsertReply
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event Registration operations
  getEventRegistration(id: number): Promise<EventRegistration | undefined>;
  getEventRegistrationsByEvent(eventId: number): Promise<EventRegistration[]>;
  getEventRegistrationsByUser(userId: number): Promise<EventRegistration[]>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  deleteEventRegistration(id: number): Promise<boolean>;
  
  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getJobs(): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;
  
  // Gallery operations
  getGallery(id: number): Promise<Gallery | undefined>;
  getGalleries(): Promise<Gallery[]>;
  createGallery(gallery: InsertGallery): Promise<Gallery>;
  updateGallery(id: number, gallery: Partial<Gallery>): Promise<Gallery | undefined>;
  deleteGallery(id: number): Promise<boolean>;
  
  // Gallery Image operations
  getGalleryImage(id: number): Promise<GalleryImage | undefined>;
  getGalleryImagesByGallery(galleryId: number): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, image: Partial<GalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: number): Promise<boolean>;
  
  // Discussion operations
  getDiscussion(id: number): Promise<Discussion | undefined>;
  getDiscussions(): Promise<Discussion[]>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  updateDiscussion(id: number, discussion: Partial<Discussion>): Promise<Discussion | undefined>;
  deleteDiscussion(id: number): Promise<boolean>;
  
  // Reply operations
  getReply(id: number): Promise<Reply | undefined>;
  getRepliesByDiscussion(discussionId: number): Promise<Reply[]>;
  createReply(reply: InsertReply): Promise<Reply>;
  updateReply(id: number, reply: Partial<Reply>): Promise<Reply | undefined>;
  deleteReply(id: number): Promise<boolean>;

  // Session store
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private eventRegistrations: Map<number, EventRegistration>;
  private jobs: Map<number, Job>;
  private galleries: Map<number, Gallery>;
  private galleryImages: Map<number, GalleryImage>;
  private discussions: Map<number, Discussion>;
  private replies: Map<number, Reply>;
  
  sessionStore: session.SessionStore;
  
  // Current IDs for auto-increment
  private currentUserId: number;
  private currentEventId: number;
  private currentEventRegistrationId: number;
  private currentJobId: number;
  private currentGalleryId: number;
  private currentGalleryImageId: number;
  private currentDiscussionId: number;
  private currentReplyId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventRegistrations = new Map();
    this.jobs = new Map();
    this.galleries = new Map();
    this.galleryImages = new Map();
    this.discussions = new Map();
    this.replies = new Map();
    
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentEventRegistrationId = 1;
    this.currentJobId = 1;
    this.currentGalleryId = 1;
    this.currentGalleryImageId = 1;
    this.currentDiscussionId = 1;
    this.currentReplyId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // This will be hashed in auth.ts
      email: "admin@vignan.ac.in",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      graduationYear: null,
      degree: null,
      phone: null,
      address: null,
      company: "Vignan University",
      position: "System Administrator",
      bio: null
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, profileImage: null };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { ...insertEvent, id, image: null };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Event Registration operations
  async getEventRegistration(id: number): Promise<EventRegistration | undefined> {
    return this.eventRegistrations.get(id);
  }
  
  async getEventRegistrationsByEvent(eventId: number): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values()).filter(
      (registration) => registration.eventId === eventId
    );
  }
  
  async getEventRegistrationsByUser(userId: number): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values()).filter(
      (registration) => registration.userId === userId
    );
  }
  
  async createEventRegistration(insertRegistration: InsertEventRegistration): Promise<EventRegistration> {
    const id = this.currentEventRegistrationId++;
    const registration: EventRegistration = { 
      ...insertRegistration, 
      id, 
      registeredAt: new Date() 
    };
    this.eventRegistrations.set(id, registration);
    return registration;
  }
  
  async deleteEventRegistration(id: number): Promise<boolean> {
    return this.eventRegistrations.delete(id);
  }
  
  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
  
  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }
  
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const job: Job = { 
      ...insertJob, 
      id, 
      postedAt: new Date() 
    };
    this.jobs.set(id, job);
    return job;
  }
  
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...jobData };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }
  
  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }
  
  // Gallery operations
  async getGallery(id: number): Promise<Gallery | undefined> {
    return this.galleries.get(id);
  }
  
  async getGalleries(): Promise<Gallery[]> {
    return Array.from(this.galleries.values());
  }
  
  async createGallery(insertGallery: InsertGallery): Promise<Gallery> {
    const id = this.currentGalleryId++;
    const gallery: Gallery = { 
      ...insertGallery, 
      id, 
      createdAt: new Date() 
    };
    this.galleries.set(id, gallery);
    return gallery;
  }
  
  async updateGallery(id: number, galleryData: Partial<Gallery>): Promise<Gallery | undefined> {
    const gallery = this.galleries.get(id);
    if (!gallery) return undefined;
    
    const updatedGallery = { ...gallery, ...galleryData };
    this.galleries.set(id, updatedGallery);
    return updatedGallery;
  }
  
  async deleteGallery(id: number): Promise<boolean> {
    return this.galleries.delete(id);
  }
  
  // Gallery Image operations
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    return this.galleryImages.get(id);
  }
  
  async getGalleryImagesByGallery(galleryId: number): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values()).filter(
      (image) => image.galleryId === galleryId
    );
  }
  
  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const id = this.currentGalleryImageId++;
    const image: GalleryImage = { 
      ...insertImage, 
      id, 
      uploadedAt: new Date() 
    };
    this.galleryImages.set(id, image);
    return image;
  }
  
  async updateGalleryImage(id: number, imageData: Partial<GalleryImage>): Promise<GalleryImage | undefined> {
    const image = this.galleryImages.get(id);
    if (!image) return undefined;
    
    const updatedImage = { ...image, ...imageData };
    this.galleryImages.set(id, updatedImage);
    return updatedImage;
  }
  
  async deleteGalleryImage(id: number): Promise<boolean> {
    return this.galleryImages.delete(id);
  }
  
  // Discussion operations
  async getDiscussion(id: number): Promise<Discussion | undefined> {
    return this.discussions.get(id);
  }
  
  async getDiscussions(): Promise<Discussion[]> {
    return Array.from(this.discussions.values());
  }
  
  async createDiscussion(insertDiscussion: InsertDiscussion): Promise<Discussion> {
    const id = this.currentDiscussionId++;
    const discussion: Discussion = { 
      ...insertDiscussion, 
      id, 
      createdAt: new Date(),
      isLocked: false 
    };
    this.discussions.set(id, discussion);
    return discussion;
  }
  
  async updateDiscussion(id: number, discussionData: Partial<Discussion>): Promise<Discussion | undefined> {
    const discussion = this.discussions.get(id);
    if (!discussion) return undefined;
    
    const updatedDiscussion = { ...discussion, ...discussionData };
    this.discussions.set(id, updatedDiscussion);
    return updatedDiscussion;
  }
  
  async deleteDiscussion(id: number): Promise<boolean> {
    return this.discussions.delete(id);
  }
  
  // Reply operations
  async getReply(id: number): Promise<Reply | undefined> {
    return this.replies.get(id);
  }
  
  async getRepliesByDiscussion(discussionId: number): Promise<Reply[]> {
    return Array.from(this.replies.values()).filter(
      (reply) => reply.discussionId === discussionId
    );
  }
  
  async createReply(insertReply: InsertReply): Promise<Reply> {
    const id = this.currentReplyId++;
    const reply: Reply = { 
      ...insertReply, 
      id, 
      createdAt: new Date() 
    };
    this.replies.set(id, reply);
    return reply;
  }
  
  async updateReply(id: number, replyData: Partial<Reply>): Promise<Reply | undefined> {
    const reply = this.replies.get(id);
    if (!reply) return undefined;
    
    const updatedReply = { ...reply, ...replyData };
    this.replies.set(id, updatedReply);
    return updatedReply;
  }
  
  async deleteReply(id: number): Promise<boolean> {
    return this.replies.delete(id);
  }
}

export const storage = new MemStorage();
