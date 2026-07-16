import { useState } from "react";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

const accommodationRates = {
  budget: 1500,
  standard: 3000,
  premium: 6000,
  luxury: 12000,
};

const transportRates = {
  bus: 800,
  train: 1200,
  flight: 5000,
  private: 3500,
};

const activityRates = {
  trekking: 2000,
  sightseeing: 1000,
  adventure: 3500,
  pilgrimage: 500,
};

export function TravelCalculator() {
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(5);
  const [accommodation, setAccommodation] = useState<keyof typeof accommodationRates>("standard");
  const [transport, setTransport] = useState<keyof typeof transportRates>("bus");
  const [activity, setActivity] = useState<keyof typeof activityRates>("trekking");
  const [mealsPerDay, setMealsPerDay] = useState(800);

  const accommodationCost = accommodationRates[accommodation] * days * travelers;
  const transportCost = transportRates[transport] * travelers * 2;
  const activityCost = activityRates[activity] * days * travelers;
  const mealsCost = mealsPerDay * days * travelers;
  const miscCost = Math.round((accommodationCost + transportCost + activityCost + mealsCost) * 0.1);
  const total = accommodationCost + transportCost + activityCost + mealsCost + miscCost;
  const perPerson = Math.round(total / travelers);

  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Travel Cost Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Travelers</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Days</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Accommodation</Label>
            <Select value={accommodation} onValueChange={(v) => setAccommodation(v as keyof typeof accommodationRates)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget (₹1,500/night)</SelectItem>
                <SelectItem value="standard">Standard (₹3,000/night)</SelectItem>
                <SelectItem value="premium">Premium (₹6,000/night)</SelectItem>
                <SelectItem value="luxury">Luxury (₹12,000/night)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Transport</Label>
            <Select value={transport} onValueChange={(v) => setTransport(v as keyof typeof transportRates)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="train">Train</SelectItem>
                <SelectItem value="flight">Flight</SelectItem>
                <SelectItem value="private">Private Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select value={activity} onValueChange={(v) => setActivity(v as keyof typeof activityRates)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trekking">Trekking</SelectItem>
                <SelectItem value="sightseeing">Sightseeing</SelectItem>
                <SelectItem value="adventure">Adventure Sports</SelectItem>
                <SelectItem value="pilgrimage">Pilgrimage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Meals per person/day (₹)</Label>
            <Input
              type="number"
              min={300}
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(Number(e.target.value) || 300)}
            />
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Accommodation</span>
              <span>{formatPrice(accommodationCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport (round trip)</span>
              <span>{formatPrice(transportCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Activities</span>
              <span>{formatPrice(activityCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Meals</span>
              <span>{formatPrice(mealsCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Misc (10%)</span>
              <span>{formatPrice(miscCost)}</span>
            </div>
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>Estimated Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {formatPrice(perPerson)} per person
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
