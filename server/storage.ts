import { 
  User, InsertUser, 
  Event, InsertEvent, 
  EventRegistration, InsertEventRegistration,
  Job, InsertJob,
  Gallery, InsertGallery,
  GalleryImage, InsertGalleryImage,
  Discussion, InsertDiscussion,
  Reply, InsertReply,
  // Import tables for database operations
  users, events, eventRegistrations, jobs, galleries, galleryImages, discussions, replies
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and, desc, gte, lt } from "drizzle-orm";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

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
  sessionStore: session.Store;
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
  
  sessionStore: session.Store;
  
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
    
    // Create a default alumni user
    this.createUser({
      username: "alumni",
      password: "alumni123", // This will be hashed in auth.ts
      email: "alumni@example.com",
      firstName: "Alumni",
      lastName: "User",
      isAdmin: false,
      graduationYear: 2020,
      degree: "B.Tech",
      phone: "+91 98765 43210",
      address: "Hyderabad, India",
      company: "Tech Company",
      position: "Software Engineer",
      bio: "Graduated from Vignan University in 2020"
    });
    
    // Create a few sample events
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    this.createEvent({
      title: "Annual Alumni Meet 2025",
      description: "Join us for the annual alumni gathering to reconnect with old friends and network with fellow alumni.",
      date: twoWeeksFromNow,
      location: "Vignan University Campus, Guntur",
      createdBy: 1
    });
    
    this.createEvent({
      title: "Career Development Workshop",
      description: "Learn about the latest career opportunities and development paths in various industries.",
      date: oneWeekFromNow,
      location: "Online via Zoom",
      createdBy: 1
    });
    
    this.createEvent({
      title: "Tech Talk: AI Revolution",
      description: "A discussion on how AI is transforming industries and what skills you need to stay relevant.",
      date: twoDaysAgo,
      location: "Seminar Hall, Vignan University",
      createdBy: 1
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
    // Ensure all nullable fields are properly initialized
    const user: User = { 
      ...insertUser, 
      id, 
      profileImage: null,
      phone: insertUser.phone ?? null,
      address: insertUser.address ?? null,
      city: insertUser.city ?? null,
      state: insertUser.state ?? null,
      country: insertUser.country ?? null,
      pincode: insertUser.pincode ?? null,
      dateOfBirth: insertUser.dateOfBirth ?? null,
      gender: insertUser.gender ?? null,
      bio: insertUser.bio ?? null,
      graduationYear: insertUser.graduationYear ?? null,
      degree: insertUser.degree ?? null,
      branch: insertUser.branch ?? null,
      collegeName: insertUser.collegeName ?? null,
      rollNumber: insertUser.rollNumber ?? null,
      achievements: insertUser.achievements ?? null,
      company: insertUser.company ?? null,
      position: insertUser.position ?? null,
      workExperience: insertUser.workExperience ?? null,
      industry: insertUser.industry ?? null,
      linkedinProfile: insertUser.linkedinProfile ?? null,
      skills: insertUser.skills ?? null,
      isProfileComplete: insertUser.isProfileComplete ?? false,
      isAdmin: insertUser.isAdmin !== undefined ? insertUser.isAdmin : false
    };
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
      postedAt: new Date(),
      expiresAt: insertJob.expiresAt ?? null
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
      createdAt: new Date(),
      description: insertGallery.description ?? null
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
      uploadedAt: new Date(),
      caption: insertImage.caption ?? null
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

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [insertedUser] = await db.insert(users).values(user).returning();
    return insertedUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    console.log("Creating event in database:", event);
    const [insertedEvent] = await db.insert(events).values(event).returning();
    console.log("Inserted event:", insertedEvent);
    return insertedEvent;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true;
  }

  // Event Registration operations
  async getEventRegistration(id: number): Promise<EventRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, id));
    return registration;
  }

  async getEventRegistrationsByEvent(eventId: number): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
  }

  async getEventRegistrationsByUser(userId: number): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.userId, userId));
  }

  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [insertedRegistration] = await db
      .insert(eventRegistrations)
      .values(registration)
      .returning();
    return insertedRegistration;
  }

  async deleteEventRegistration(id: number): Promise<boolean> {
    await db.delete(eventRegistrations).where(eq(eventRegistrations.id, id));
    return true;
  }

  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs);
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [insertedJob] = await db.insert(jobs).values(job).returning();
    return insertedJob;
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set(jobData)
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    await db.delete(jobs).where(eq(jobs.id, id));
    return true;
  }

  // Gallery operations
  async getGallery(id: number): Promise<Gallery | undefined> {
    const [gallery] = await db.select().from(galleries).where(eq(galleries.id, id));
    return gallery;
  }

  async getGalleries(): Promise<Gallery[]> {
    return await db.select().from(galleries);
  }

  async createGallery(gallery: InsertGallery): Promise<Gallery> {
    const [insertedGallery] = await db.insert(galleries).values(gallery).returning();
    return insertedGallery;
  }

  async updateGallery(id: number, galleryData: Partial<Gallery>): Promise<Gallery | undefined> {
    const [updatedGallery] = await db
      .update(galleries)
      .set(galleryData)
      .where(eq(galleries.id, id))
      .returning();
    return updatedGallery;
  }

  async deleteGallery(id: number): Promise<boolean> {
    await db.delete(galleries).where(eq(galleries.id, id));
    return true;
  }

  // Gallery Image operations
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    const [image] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
    return image;
  }

  async getGalleryImagesByGallery(galleryId: number): Promise<GalleryImage[]> {
    return await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.galleryId, galleryId));
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [insertedImage] = await db.insert(galleryImages).values(image).returning();
    return insertedImage;
  }

  async updateGalleryImage(id: number, imageData: Partial<GalleryImage>): Promise<GalleryImage | undefined> {
    const [updatedImage] = await db
      .update(galleryImages)
      .set(imageData)
      .where(eq(galleryImages.id, id))
      .returning();
    return updatedImage;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
    return true;
  }

  // Discussion operations
  async getDiscussion(id: number): Promise<Discussion | undefined> {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion;
  }

  async getDiscussions(): Promise<Discussion[]> {
    return await db.select().from(discussions);
  }

  async createDiscussion(discussion: InsertDiscussion): Promise<Discussion> {
    const [insertedDiscussion] = await db.insert(discussions).values(discussion).returning();
    return insertedDiscussion;
  }

  async updateDiscussion(id: number, discussionData: Partial<Discussion>): Promise<Discussion | undefined> {
    const [updatedDiscussion] = await db
      .update(discussions)
      .set(discussionData)
      .where(eq(discussions.id, id))
      .returning();
    return updatedDiscussion;
  }

  async deleteDiscussion(id: number): Promise<boolean> {
    await db.delete(discussions).where(eq(discussions.id, id));
    return true;
  }

  // Reply operations
  async getReply(id: number): Promise<Reply | undefined> {
    const [reply] = await db.select().from(replies).where(eq(replies.id, id));
    return reply;
  }

  async getRepliesByDiscussion(discussionId: number): Promise<Reply[]> {
    return await db
      .select()
      .from(replies)
      .where(eq(replies.discussionId, discussionId));
  }

  async createReply(reply: InsertReply): Promise<Reply> {
    const [insertedReply] = await db.insert(replies).values(reply).returning();
    return insertedReply;
  }

  async updateReply(id: number, replyData: Partial<Reply>): Promise<Reply | undefined> {
    const [updatedReply] = await db
      .update(replies)
      .set(replyData)
      .where(eq(replies.id, id))
      .returning();
    return updatedReply;
  }

  async deleteReply(id: number): Promise<boolean> {
    await db.delete(replies).where(eq(replies.id, id));
    return true;
  }
}

// Export the database storage implementation
export const storage = new DatabaseStorage();
