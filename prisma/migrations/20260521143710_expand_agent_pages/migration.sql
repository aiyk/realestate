-- CreateEnum
CREATE TYPE "AgentReviewStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'FLAGGED');

-- CreateEnum
CREATE TYPE "ContactInquiryKind" AS ENUM ('MESSAGE', 'VIEWING_REQUEST');

-- CreateEnum
CREATE TYPE "ContactInquiryStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'SPAM');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'BOOKED', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('SEARCH', 'PROFILE', 'LISTING', 'SHARE', 'REFERRAL', 'DIRECT', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadKind" AS ENUM ('CONTACT_INQUIRY', 'VISIT_REQUEST', 'RESERVATION');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LEAD_NEW', 'LEAD_BOOKED', 'RESERVATION_NEW', 'RESERVATION_PAID', 'LISTING_APPROVED', 'LISTING_REJECTED', 'PAYOUT_PROCESSING', 'PAYOUT_PAID', 'MESSAGE_NEW', 'OPEN_HOUSE_REMINDER', 'PROFILE_VERIFIED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AnalyticsEventKind" AS ENUM ('LISTING_VIEW', 'LISTING_FAVORITED', 'LISTING_SHARED', 'LISTING_CONTACT_CLICK', 'LISTING_PHONE_REVEAL', 'LISTING_VIRTUAL_TOUR_OPEN');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('TITLE_DEED', 'SURVEY_PLAN', 'C_OF_O', 'DEED_OF_ASSIGNMENT', 'OTHER');

-- AlterTable
ALTER TABLE "AgentProfile" ADD COLUMN     "bankReverifyRequestedAt" TIMESTAMP(3),
ADD COLUMN     "businessNameLastChangedAt" TIMESTAMP(3),
ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "credentials" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "goalListingsSoldThisQuarter" INTEGER,
ADD COLUMN     "goalQuarterStartedAt" TIMESTAMP(3),
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "listingCountCache" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "performanceTier" TEXT,
ADD COLUMN     "ratingAvg" DECIMAL(3,2),
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "responseTimeMinutes" INTEGER,
ADD COLUMN     "soldCountCache" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT,
ADD COLUMN     "whatsappNumber" TEXT,
ADD COLUMN     "yearsOfExperience" INTEGER;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "duplicatedFromId" TEXT,
ADD COLUMN     "featuredUntil" TIMESTAMP(3),
ADD COLUMN     "inquiryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastViewedAt" TIMESTAMP(3),
ADD COLUMN     "priceLastChangedAt" TIMESTAMP(3),
ADD COLUMN     "priceReviewRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "virtualTourUrl" TEXT,
ADD COLUMN     "youtubeEmbedId" TEXT;

-- AlterTable
ALTER TABLE "ListingImage" ADD COLUMN     "caption" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "icsToken" TEXT;

-- CreateTable
CREATE TABLE "AgentSpecialty" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentServiceArea" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "radiusKm" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentFaq" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentReview" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "status" "AgentReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "agentReplyBody" TEXT,
    "agentRepliedAt" TIMESTAMP(3),
    "flagReason" TEXT,
    "flaggedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "listingId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "kind" "ContactInquiryKind" NOT NULL DEFAULT 'MESSAGE',
    "viewingAt" TIMESTAMP(3),
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "status" "ContactInquiryStatus" NOT NULL DEFAULT 'NEW',
    "convertedThreadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenHouse" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER,
    "notes" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenHouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitRequest" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT,
    "contactInquiryId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "status" "VisitStatus" NOT NULL DEFAULT 'REQUESTED',
    "slotStartsAt" TIMESTAMP(3),
    "slotEndsAt" TIMESTAMP(3),
    "openHouseId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "listingId" TEXT,
    "kind" "LeadKind" NOT NULL,
    "sourceContactInquiryId" TEXT,
    "sourceVisitRequestId" TEXT,
    "sourceReservationId" TEXT,
    "source" "LeadSource" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerPhone" TEXT,
    "buyerUserId" TEXT,
    "followUpAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "threadId" TEXT,
    "lostReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "actionUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentNotificationPref" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prefs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentNotificationPref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "kind" "AnalyticsEventKind" NOT NULL,
    "visitorHash" TEXT,
    "userId" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingDocument" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL,
    "title" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "mimeType" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPriceHistory" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "oldPriceNgn" DECIMAL(14,2) NOT NULL,
    "newPriceNgn" DECIMAL(14,2) NOT NULL,
    "changedById" TEXT NOT NULL,
    "triggeredReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentSpecialty_propertyType_idx" ON "AgentSpecialty"("propertyType");

-- CreateIndex
CREATE UNIQUE INDEX "AgentSpecialty_agentId_propertyType_key" ON "AgentSpecialty"("agentId", "propertyType");

-- CreateIndex
CREATE INDEX "AgentServiceArea_city_state_idx" ON "AgentServiceArea"("city", "state");

-- CreateIndex
CREATE INDEX "AgentServiceArea_state_idx" ON "AgentServiceArea"("state");

-- CreateIndex
CREATE UNIQUE INDEX "AgentServiceArea_agentId_city_state_key" ON "AgentServiceArea"("agentId", "city", "state");

-- CreateIndex
CREATE INDEX "AgentFaq_agentId_sortOrder_idx" ON "AgentFaq"("agentId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AgentReview_reservationId_key" ON "AgentReview"("reservationId");

-- CreateIndex
CREATE INDEX "AgentReview_agentId_status_createdAt_idx" ON "AgentReview"("agentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AgentReview_rating_idx" ON "AgentReview"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "AgentReview_agentId_authorId_reservationId_key" ON "AgentReview"("agentId", "authorId", "reservationId");

-- CreateIndex
CREATE INDEX "ContactInquiry_agentId_createdAt_idx" ON "ContactInquiry"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "ContactInquiry_ipHash_createdAt_idx" ON "ContactInquiry"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "ContactInquiry_email_createdAt_idx" ON "ContactInquiry"("email", "createdAt");

-- CreateIndex
CREATE INDEX "ContactInquiry_status_idx" ON "ContactInquiry"("status");

-- CreateIndex
CREATE INDEX "OpenHouse_listingId_startsAt_idx" ON "OpenHouse"("listingId", "startsAt");

-- CreateIndex
CREATE INDEX "OpenHouse_startsAt_idx" ON "OpenHouse"("startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisitRequest_contactInquiryId_key" ON "VisitRequest"("contactInquiryId");

-- CreateIndex
CREATE INDEX "VisitRequest_listingId_status_idx" ON "VisitRequest"("listingId", "status");

-- CreateIndex
CREATE INDEX "VisitRequest_buyerId_status_idx" ON "VisitRequest"("buyerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_sourceContactInquiryId_key" ON "Lead"("sourceContactInquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_sourceVisitRequestId_key" ON "Lead"("sourceVisitRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_sourceReservationId_key" ON "Lead"("sourceReservationId");

-- CreateIndex
CREATE INDEX "Lead_agentId_status_followUpAt_idx" ON "Lead"("agentId", "status", "followUpAt");

-- CreateIndex
CREATE INDEX "Lead_agentId_createdAt_idx" ON "Lead"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_listingId_status_idx" ON "Lead"("listingId", "status");

-- CreateIndex
CREATE INDEX "LeadNote_leadId_createdAt_idx" ON "LeadNote"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentNotificationPref_userId_key" ON "AgentNotificationPref"("userId");

-- CreateIndex
CREATE INDEX "ListingAnalyticsEvent_listingId_kind_createdAt_idx" ON "ListingAnalyticsEvent"("listingId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "ListingAnalyticsEvent_listingId_createdAt_idx" ON "ListingAnalyticsEvent"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "ListingDocument_listingId_kind_idx" ON "ListingDocument"("listingId", "kind");

-- CreateIndex
CREATE INDEX "ListingPriceHistory_listingId_createdAt_idx" ON "ListingPriceHistory"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentProfile_status_ratingAvg_idx" ON "AgentProfile"("status", "ratingAvg");

-- CreateIndex
CREATE INDEX "AgentProfile_status_soldCountCache_idx" ON "AgentProfile"("status", "soldCountCache");

-- CreateIndex
CREATE INDEX "AgentProfile_status_listingCountCache_idx" ON "AgentProfile"("status", "listingCountCache");

-- CreateIndex
CREATE INDEX "Listing_isFeatured_featuredUntil_idx" ON "Listing"("isFeatured", "featuredUntil");

-- CreateIndex
CREATE INDEX "Listing_agentId_archivedAt_idx" ON "Listing"("agentId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_icsToken_key" ON "User"("icsToken");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_duplicatedFromId_fkey" FOREIGN KEY ("duplicatedFromId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSpecialty" ADD CONSTRAINT "AgentSpecialty_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentServiceArea" ADD CONSTRAINT "AgentServiceArea_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentFaq" ADD CONSTRAINT "AgentFaq_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentReview" ADD CONSTRAINT "AgentReview_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentReview" ADD CONSTRAINT "AgentReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentReview" ADD CONSTRAINT "AgentReview_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInquiry" ADD CONSTRAINT "ContactInquiry_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInquiry" ADD CONSTRAINT "ContactInquiry_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenHouse" ADD CONSTRAINT "OpenHouse_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitRequest" ADD CONSTRAINT "VisitRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitRequest" ADD CONSTRAINT "VisitRequest_contactInquiryId_fkey" FOREIGN KEY ("contactInquiryId") REFERENCES "ContactInquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitRequest" ADD CONSTRAINT "VisitRequest_openHouseId_fkey" FOREIGN KEY ("openHouseId") REFERENCES "OpenHouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sourceContactInquiryId_fkey" FOREIGN KEY ("sourceContactInquiryId") REFERENCES "ContactInquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sourceVisitRequestId_fkey" FOREIGN KEY ("sourceVisitRequestId") REFERENCES "VisitRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sourceReservationId_fkey" FOREIGN KEY ("sourceReservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentNotificationPref" ADD CONSTRAINT "AgentNotificationPref_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAnalyticsEvent" ADD CONSTRAINT "ListingAnalyticsEvent_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAnalyticsEvent" ADD CONSTRAINT "ListingAnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingDocument" ADD CONSTRAINT "ListingDocument_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingDocument" ADD CONSTRAINT "ListingDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPriceHistory" ADD CONSTRAINT "ListingPriceHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPriceHistory" ADD CONSTRAINT "ListingPriceHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

