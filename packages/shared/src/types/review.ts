export type ReviewStatus = 'visible' | 'hidden';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminReview extends Review {
  productName: string;
}

export interface CreateReviewInput {
  rating: number;
  text: string;
}

export interface UpdateReviewInput {
  rating?: number;
  text?: string;
}

export interface ProductRatingSummary {
  average: number;
  count: number;
}
