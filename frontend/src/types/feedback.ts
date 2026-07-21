// HU-10. The date the dashboard should ask about (GET /feedback/pending), or null.
export interface PendingFeedback {
  dateId: string;
  partnerName: string | null;
  venueName: string;
  scheduledAt: string;
}

// POST /feedback body. rating/amountSpent only apply when occurred is true; the
// backend drops them otherwise.
export interface CreateFeedbackPayload {
  dateId: string;
  occurred: boolean;
  rating?: number;
  comments?: string;
  noShowReason?: string;
  amountSpent?: number;
}
