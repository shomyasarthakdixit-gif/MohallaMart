"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Star, MessageSquare, Loader2 } from "lucide-react";
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
          className={`h-5 w-5 ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${starValue <= ratingValue ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
          onClick={() => interactive && setRating(starValue)}
        />
      );
    });
  };

  return (
    <div className="space-y-8 mt-12 border-t border-border pt-10">
      <h3 className="text-3xl font-serif font-bold text-foreground">{title} <span className="text-muted-foreground font-sans text-xl font-normal ml-2">({reviews.length})</span></h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-surface p-6 rounded-3xl border border-border">
            <h4 className="font-semibold text-lg mb-6">Write a Review</h4>
            <form onSubmit={submitReview} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Rating</label>
                <div className="flex gap-1.5">
                  {renderStars(rating, true)}
                </div>
              </div>
              <div>
                <label htmlFor="review-comment" className="text-sm font-medium text-foreground block mb-2">Review (optional)</label>
                <textarea 
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full h-28 bg-background border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none resize-none transition-all placeholder:text-muted-foreground/50"
                  placeholder="Share your experience..."
                  aria-label="Review comment"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold">
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary/50" />
              <p className="font-medium">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-3xl border border-border flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">No reviews yet</p>
              <p className="text-muted-foreground">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 rounded-2xl border border-border bg-surface shadow-sm animate-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                        {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{review.user?.name || "Anonymous User"}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-foreground/90 mt-2 text-base leading-relaxed">{review.comment}</p>
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
