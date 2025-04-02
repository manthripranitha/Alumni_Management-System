import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User models (Admin and Alumni)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profileImage: text("profile_image"),
  
  // Personal Data
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  pincode: text("pincode"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  bio: text("bio"),
  
  // Educational Data
  graduationYear: integer("graduation_year"),
  degree: text("degree"),
  branch: text("branch"),
  collegeName: text("college_name"),
  rollNumber: text("roll_number"),
  achievements: text("achievements"),
  
  // Professional Data
  company: text("company"),
  position: text("position"),
  workExperience: integer("work_experience"),
  industry: text("industry"),
  
  // Social Media & Professional Profiles
  linkedinProfile: text("linkedin_profile"),
  instagramUsername: text("instagram_username"),
  whatsappNumber: text("whatsapp_number"),
  codechefProfile: text("codechef_profile"),
  hackerRankProfile: text("hackerrank_profile"),
  hackerEarthProfile: text("hackerearth_profile"),
  leetcodeProfile: text("leetcode_profile"),
  otherProfiles: text("other_profiles"),
  
  // Skills & Job Acquisition
  skills: text("skills"),
  specialSkills: text("special_skills"), // Skills that helped them get a job easily
  
  // Admin status
  isAdmin: boolean("is_admin").notNull().default(false),
  
  // Profile completion status
  isProfileComplete: boolean("is_profile_complete").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  profileImage: true,
});

// Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  image: text("image"),
  createdBy: integer("created_by").notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  image: true,
});

// Event Registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  registeredAt: true,
});

// Jobs
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  applicationProcess: text("application_process").notNull(),
  postedBy: integer("posted_by").notNull(),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  postedAt: true,
});

// Gallery
export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertGallerySchema = createInsertSchema(galleries).omit({
  id: true,
  createdAt: true,
});

// Gallery Images
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  galleryId: integer("gallery_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  uploadedBy: integer("uploaded_by").notNull(),
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  uploadedAt: true,
});

// Forum Discussions
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isLocked: boolean("is_locked").notNull().default(false),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  participantIds: text("participant_ids").array().default([]).notNull(),
});

export const insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true,
  createdAt: true,
  isLocked: true,
  lastActivityAt: true,
  participantIds: true,
});

// Forum Replies
export const replies = pgTable("replies", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull(),
  content: text("content").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  reactions: json("reactions").default({}).notNull(),
});

export const insertReplySchema = createInsertSchema(replies).omit({
  id: true,
  createdAt: true,
  isRead: true,
  reactions: true,
});

// Reply Read Status
export const replyReadStatus = pgTable("reply_read_status", {
  id: serial("id").primaryKey(),
  replyId: integer("reply_id").notNull(),
  userId: integer("user_id").notNull(),
  readAt: timestamp("read_at").notNull().defaultNow(),
});

export const insertReplyReadStatusSchema = createInsertSchema(replyReadStatus).omit({
  id: true,
  readAt: true,
});

// Discussion Participants
export const discussionParticipants = pgTable("discussion_participants", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull(),
  userId: integer("user_id").notNull(),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertDiscussionParticipantSchema = createInsertSchema(discussionParticipants).omit({
  id: true,
  lastSeenAt: true,
  joinedAt: true,
});

// Document Upload System
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  documentType: text("document_type").notNull(), // resume, certificate, marksheet, etc.
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // pdf, jpg, jpeg, etc.
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  adminFeedback: text("admin_feedback"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  status: true,
  adminFeedback: true,
  uploadedAt: true,
  updatedAt: true,
});

// Direct Messaging System
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  sentAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Gallery = typeof galleries.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;

export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;

export type Reply = typeof replies.$inferSelect;
export type InsertReply = z.infer<typeof insertReplySchema>;

export type ReplyReadStatus = typeof replyReadStatus.$inferSelect;
export type InsertReplyReadStatus = z.infer<typeof insertReplyReadStatusSchema>;

export type DiscussionParticipant = typeof discussionParticipants.$inferSelect;
export type InsertDiscussionParticipant = z.infer<typeof insertDiscussionParticipantSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// University Contact & Social Media Information
export const universityInfo = pgTable("university_info", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Vignan University"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  
  // Social Media Links
  linkedinUrl: text("linkedin_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  
  // Additional Info
  description: text("description"),
  visionStatement: text("vision_statement"),
  missionStatement: text("mission_statement"),
  
  // Last Updated
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").notNull(),
});

export const insertUniversityInfoSchema = createInsertSchema(universityInfo).omit({
  id: true,
  updatedAt: true,
});

export type UniversityInfo = typeof universityInfo.$inferSelect;
export type InsertUniversityInfo = z.infer<typeof insertUniversityInfoSchema>;
