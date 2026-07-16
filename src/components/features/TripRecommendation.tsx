import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrips } from "@/hooks/useCMS";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/utils";
import type { Trip } from "@/types";

function scoreTrip(trip: Trip, interests: string[]): number {
  let score = 0;

  const interestKeywords = interests.map((i) => i.toLowerCase());

  for (const interest of interestKeywords) {
    if (trip.season.includes(interest) || trip.difficulty.includes(interest)) score += 3;
    if (trip.highlights.some((h) => h.toLowerCase().includes(interest))) score += 4;
    if (trip.title.toLowerCase().includes(interest)) score += 5;
    if (trip.location?.toLowerCase().includes(interest)) score += 2;
    if (interest === "adventure" && ["moderate", "difficult", "extreme"].includes(trip.difficulty)) score += 3;
    if (interest === "trekking" && trip.altitude) score += 3;
    if (interest === "photography" && trip.highlights.some((h) => /view|scenery|peak|flower/i.test(h))) score += 2;
    if (interest === "mountains" && trip.altitude) score += 4;
    if (interest === "family" && trip.difficulty === "easy") score += 4;
  }

  score += trip.rating * 2;
  if (trip.is_trending) score += 2;
  if (trip.is_popular) score += 1;
  if (trip.discount_price) score += 1;

  return score;
}

export function TripRecommendation() {
  const { data: trips, isLoading } = useTrips();
  const { profile } = useAuth();
  const interests = profile?.interests?.length ? profile.interests : [];

  const recommendations = trips
    ? [...trips]
        .map((trip) => ({
          trip,
          score: scoreTrip(trip, interests.length ? interests : ["trekking"]),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  if (!isLoading && recommendations.length === 0) return null;

  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended For You
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {interests.length
            ? `Based on your interests: ${interests.join(", ")}`
            : "Popular trips you might like"}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-500">Loading recommendations...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {recommendations.map(({ trip, score }) => {
              const cover =
                trip.trip_images?.find((i) => i.is_cover)?.image_url ||
                trip.trip_images?.[0]?.image_url;
              return (
                <div
                  key={trip.id}
                  className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  {cover && (
                    <img src={cover} alt={trip.title} className="h-32 w-full object-cover" />
                  )}
                  <div className="p-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{trip.title}</h4>
                    <p className="text-sm text-primary font-medium">
                      {formatPrice(trip.discount_price ?? trip.price)}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">Match score: {score}</p>
                    <Button size="sm" className="mt-2 w-full" asChild>
                      <Link to={`/trips/${trip.slug}`}>View Trip</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
