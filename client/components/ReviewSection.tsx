"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    avatarUrl: string;
  };
}

interface ReviewSectionProps {
  productId?: string;
  shopId?: string;
  title?: string;
}

export function ReviewSection({ productId, shopId, title = "Reviews" }: ReviewSectionProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const queryKey = ["reviews", { productId, shopId }];

  const { data: reviews = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productId) params.append("productId", productId);
      if (shopId) params.append("shopId", shopId);
      
      const res = await api.get(`/reviews?${params.toString()}`);
      return res.data.reviews as Review[];
    }
  });

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    setIsSubmitting(true);
    try {
      await api.post("/reviews", {
        shopId,
        productId,
        rating,
        comment
      });
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      console.error("Failed to submit review", error);
      alert("Failed to submit review. Please make sure you are logged in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (ratingValue: number, interactive = false) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      return (
        <Star
          key={index}
          className={`h-5 w-5 ${interactive ? 'cursor-pointer' : ''} ${starValue <= ratingValue ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
          onClick={() => interactive && setRating(starValue)}
        />
      );
    });
  };

  return (
    <div className="space-y-8 mt-12 border-t border-border/50 pt-10">
      <h3 className="text-2xl font-bold">{title} ({reviews.length})</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
            <h4 className="font-semibold mb-4">Write a Review</h4>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Rating</label>
                <div className="flex gap-1">
                  {renderStars(rating, true)}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Review (optional)</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full h-24 bg-background border border-border/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Share your experience..."
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl font-bold">
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-border/50 border-dashed">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 rounded-2xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                        {review.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold">{review.user?.name || "Anonymous User"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
