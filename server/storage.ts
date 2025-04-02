import { 
  User, InsertUser, 
  Event, InsertEvent, 
  EventRegistration, InsertEventRegistration,
  Job, InsertJob,
  Gallery, InsertGallery,
  GalleryImage, InsertGalleryImage,
  Discussion, InsertDiscussion,
  Reply, InsertReply,
  Document, InsertDocument,
  Message, InsertMessage,
  DiscussionParticipant, InsertDiscussionParticipant,
  ReplyReadStatus, InsertReplyReadStatus,
  UniversityInfo, InsertUniversityInfo
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
  findUsersByName(searchTerm: string): Promise<User[]>; // Search users by name
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // University Info operations
  getUniversityInfo(): Promise<UniversityInfo | undefined>;
  updateUniversityInfo(info: Partial<UniversityInfo>, updatedBy: number): Promise<UniversityInfo | undefined>;
  
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
  
  // Discussion Participant operations
  getDiscussionParticipant(discussionId: number, userId: number): Promise<DiscussionParticipant | undefined>;
  getDiscussionParticipants(discussionId: number): Promise<DiscussionParticipant[]>;
  addDiscussionParticipant(participant: InsertDiscussionParticipant): Promise<DiscussionParticipant>;
  updateLastSeen(discussionId: number, userId: number): Promise<DiscussionParticipant | undefined>;
  
  // Reply operations
  getReply(id: number): Promise<Reply | undefined>;
  getRepliesByDiscussion(discussionId: number): Promise<Reply[]>;
  createReply(reply: InsertReply): Promise<Reply>;
  updateReply(id: number, reply: Partial<Reply>): Promise<Reply | undefined>;
  deleteReply(id: number): Promise<boolean>;
  addReaction(replyId: number, userId: number, reaction: string): Promise<Reply | undefined>;
  removeReaction(replyId: number, userId: number, reaction: string): Promise<Reply | undefined>;
  
  // Reply Read Status operations
  getReplyReadStatus(replyId: number, userId: number): Promise<ReplyReadStatus | undefined>;
  markReplyAsRead(replyId: number, userId: number): Promise<ReplyReadStatus>;
  getUnreadRepliesCount(discussionId: number, userId: number): Promise<number>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocuments(): Promise<Document[]>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversation(userId1: number, userId2: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;

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
  private documents: Map<number, Document>;
  private messages: Map<number, Message>;
  private universityInfo: UniversityInfo | undefined;
  
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
  private currentDocumentId: number;
  private currentMessageId: number;

  private discussionParticipants: Map<number, DiscussionParticipant>;
  private replyReadStatus: Map<number, ReplyReadStatus>;
  private currentDiscussionParticipantId: number;
  private currentReplyReadStatusId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventRegistrations = new Map();
    this.jobs = new Map();
    this.galleries = new Map();
    this.galleryImages = new Map();
    this.discussions = new Map();
    this.replies = new Map();
    this.documents = new Map();
    this.messages = new Map();
    this.discussionParticipants = new Map();
    this.replyReadStatus = new Map();
    
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentEventRegistrationId = 1;
    this.currentJobId = 1;
    this.currentGalleryId = 1;
    this.currentGalleryImageId = 1;
    this.currentDiscussionId = 1;
    this.currentReplyId = 1;
    this.currentDocumentId = 1;
    this.currentMessageId = 1;
    this.currentDiscussionParticipantId = 1;
    this.currentReplyReadStatusId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // Using plain text password for default users
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
      password: "alumni123", // Using plain text password for default users
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
    
    // Initialize University Info
    this.universityInfo = {
      id: 1,
      name: "Vignan University",
      address: "Vadlamudi, Chebrolu Mandal, Guntur District, Andhra Pradesh 522213, India",
      phone: "+91 863 234 5678",
      email: "info@vignan.ac.in",
      website: "https://www.vignan.ac.in",
      linkedinUrl: "https://www.linkedin.com/school/vignan-university/",
      facebookUrl: "https://www.facebook.com/vignanuniversity/",
      twitterUrl: "https://twitter.com/vignanuniversity",
      instagramUrl: "https://www.instagram.com/vignanuniversity/",
      youtubeUrl: "https://www.youtube.com/c/vignanuniversity",
      description: "Vignan University is a leading institution for engineering and technology education in Andhra Pradesh, India.",
      visionStatement: "To evolve into a center of excellence in education and research, producing globally competitive and socially responsible professionals.",
      missionStatement: "To provide quality education through innovation in teaching, research and industry engagement.",
      updatedAt: new Date(),
      updatedBy: 1
    };
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
      
      // Social Media & Professional Profiles
      linkedinProfile: insertUser.linkedinProfile ?? null,
      instagramUsername: insertUser.instagramUsername ?? null,
      whatsappNumber: insertUser.whatsappNumber ?? null,
      codechefProfile: insertUser.codechefProfile ?? null,
      hackerRankProfile: insertUser.hackerRankProfile ?? null,
      hackerEarthProfile: insertUser.hackerEarthProfile ?? null,
      leetcodeProfile: insertUser.leetcodeProfile ?? null,
      otherProfiles: insertUser.otherProfiles ?? null,
      
      // Skills
      skills: insertUser.skills ?? null,
      specialSkills: insertUser.specialSkills ?? null,
      
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
    const now = new Date();
    
    // Create the discussion with required fields
    const discussion = {
      id,
      title: insertDiscussion.title,
      content: insertDiscussion.content,
      createdBy: insertDiscussion.createdBy,
      createdAt: now,
      lastActivityAt: now,
      participantIds: [insertDiscussion.createdBy.toString()],
      isLocked: false
    } as Discussion;
    
    this.discussions.set(id, discussion);
    
    // Add the creator as a participant
    await this.addDiscussionParticipant({
      discussionId: id,
      userId: insertDiscussion.createdBy
    });
    
    return discussion;
  }
  
  // Discussion Participant operations
  async getDiscussionParticipant(discussionId: number, userId: number): Promise<DiscussionParticipant | undefined> {
    return Array.from(this.discussionParticipants.values()).find(
      (participant) => participant.discussionId === discussionId && participant.userId === userId
    );
  }
  
  async getDiscussionParticipants(discussionId: number): Promise<DiscussionParticipant[]> {
    return Array.from(this.discussionParticipants.values()).filter(
      (participant) => participant.discussionId === discussionId
    );
  }
  
  async addDiscussionParticipant(participant: InsertDiscussionParticipant): Promise<DiscussionParticipant> {
    // Check if already a participant
    const existingParticipant = await this.getDiscussionParticipant(
      participant.discussionId, 
      participant.userId
    );
    
    if (existingParticipant) {
      return this.updateLastSeen(participant.discussionId, participant.userId) as Promise<DiscussionParticipant>;
    }
    
    const id = this.currentDiscussionParticipantId++;
    const now = new Date();
    const newParticipant: DiscussionParticipant = {
      ...participant,
      id,
      lastSeenAt: now,
      joinedAt: now
    };
    
    this.discussionParticipants.set(id, newParticipant);
    
    // Update the discussion's participant list
    const discussion = await this.getDiscussion(participant.discussionId);
    if (discussion) {
      const participantIds = [...discussion.participantIds];
      if (!participantIds.includes(participant.userId.toString())) {
        participantIds.push(participant.userId.toString());
        await this.updateDiscussion(discussion.id, { participantIds });
      }
    }
    
    return newParticipant;
  }
  
  async updateLastSeen(discussionId: number, userId: number): Promise<DiscussionParticipant | undefined> {
    const participant = await this.getDiscussionParticipant(discussionId, userId);
    if (!participant) return undefined;
    
    const updatedParticipant = { 
      ...participant, 
      lastSeenAt: new Date() 
    };
    
    this.discussionParticipants.set(participant.id, updatedParticipant);
    return updatedParticipant;
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
    const now = new Date();
    // Initially create with empty reactions object and mark as unread
    const reply: Reply = { 
      ...insertReply, 
      id, 
      createdAt: now,
      isRead: false,
      reactions: {} as unknown as Record<string, number[]>
    };
    this.replies.set(id, reply);
    
    // Update the discussion's last activity time
    const discussion = await this.getDiscussion(insertReply.discussionId);
    if (discussion) {
      await this.updateDiscussion(discussion.id, { lastActivityAt: now });
    }
    
    // Add the user as a participant if they aren't already
    await this.addDiscussionParticipant({
      discussionId: insertReply.discussionId,
      userId: insertReply.createdBy
    });
    
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
  
  async addReaction(replyId: number, userId: number, reaction: string): Promise<Reply | undefined> {
    const reply = await this.getReply(replyId);
    if (!reply) return undefined;
    
    // Create a new reactions object using type assertion
    const reactions = { ...(reply.reactions as Record<string, number[]>) };
    
    if (!reactions[reaction]) {
      reactions[reaction] = [];
    }
    
    if (!reactions[reaction].includes(userId)) {
      reactions[reaction].push(userId);
    }
    
    return this.updateReply(replyId, { reactions });
  }
  
  async removeReaction(replyId: number, userId: number, reaction: string): Promise<Reply | undefined> {
    const reply = await this.getReply(replyId);
    if (!reply) return undefined;
    
    // Create a new reactions object using type assertion
    const reactions = { ...(reply.reactions as Record<string, number[]>) };
    
    if (reactions[reaction]) {
      reactions[reaction] = reactions[reaction].filter((id: number) => id !== userId);
      if (reactions[reaction].length === 0) {
        delete reactions[reaction];
      }
    }
    
    return this.updateReply(replyId, { reactions });
  }
  
  // Reply Read Status operations
  async getReplyReadStatus(replyId: number, userId: number): Promise<ReplyReadStatus | undefined> {
    return Array.from(this.replyReadStatus.values()).find(
      (status) => status.replyId === replyId && status.userId === userId
    );
  }
  
  async markReplyAsRead(replyId: number, userId: number): Promise<ReplyReadStatus> {
    // Check if already marked as read
    const existingStatus = await this.getReplyReadStatus(replyId, userId);
    if (existingStatus) {
      return existingStatus;
    }
    
    const id = this.currentReplyReadStatusId++;
    const status: ReplyReadStatus = {
      id,
      replyId,
      userId,
      readAt: new Date()
    };
    
    this.replyReadStatus.set(id, status);
    
    // Mark the reply as read
    const reply = await this.getReply(replyId);
    if (reply) {
      await this.updateReply(replyId, { isRead: true });
    }
    
    return status;
  }
  
  async getUnreadRepliesCount(discussionId: number, userId: number): Promise<number> {
    const replies = await this.getRepliesByDiscussion(discussionId);
    
    // Filter replies not created by the user and that haven't been read by the user
    const unreadReplies = replies.filter(reply => {
      if (reply.createdBy === userId) return false; // Skip user's own replies
      
      // Check if there's a read status for this user
      const hasReadStatus = Array.from(this.replyReadStatus.values()).some(
        status => status.replyId === reply.id && status.userId === userId
      );
      
      return !hasReadStatus; // Unread if no read status exists
    });
    
    return unreadReplies.length;
  }
  
  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      ...insertDocument, 
      id, 
      status: "pending",
      adminFeedback: null,
      uploadedAt: new Date(),
      updatedAt: null,
      description: insertDocument.description ?? null
    };
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { 
      ...document, 
      ...documentData,
      updatedAt: new Date()
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }
  
  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) => 
          (message.senderId === userId1 && message.receiverId === userId2) ||
          (message.senderId === userId2 && message.receiverId === userId1)
      )
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      isRead: false,
      sentAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }
  
  // User search operations
  async findUsersByName(searchTerm: string): Promise<User[]> {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return Array.from(this.users.values()).filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(lowerSearchTerm) || 
             user.firstName.toLowerCase().includes(lowerSearchTerm) || 
             user.lastName.toLowerCase().includes(lowerSearchTerm);
    });
  }
  
  // University Info operations
  async getUniversityInfo(): Promise<UniversityInfo | undefined> {
    return this.universityInfo;
  }
  
  async updateUniversityInfo(info: Partial<UniversityInfo>, updatedBy: number): Promise<UniversityInfo | undefined> {
    if (!this.universityInfo) return undefined;
    
    this.universityInfo = {
      ...this.universityInfo,
      ...info,
      updatedAt: new Date(),
      updatedBy
    };
    
    return this.universityInfo;
  }
}

export const storage = new MemStorage();
