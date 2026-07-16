import { useMemo } from "react";
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  destination: string;
  className?: string;
}

interface MockWeather {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  icon: "sun" | "cloud" | "rain" | "snow" | "wind";
  forecast: { day: string; high: number; low: number; icon: "sun" | "cloud" | "rain" }[];
}

const weatherData: Record<string, MockWeather> = {
  dehradun: { temp: 28, condition: "Partly Cloudy", humidity: 65, wind: 12, icon: "cloud", forecast: [
    { day: "Mon", high: 30, low: 22, icon: "sun" },
    { day: "Tue", high: 29, low: 21, icon: "cloud" },
    { day: "Wed", high: 27, low: 20, icon: "rain" },
    { day: "Thu", high: 28, low: 21, icon: "sun" },
    { day: "Fri", high: 31, low: 23, icon: "sun" },
  ]},
  ladakh: { temp: 15, condition: "Clear & Dry", humidity: 25, wind: 18, icon: "sun", forecast: [
    { day: "Mon", high: 18, low: 5, icon: "sun" },
    { day: "Tue", high: 16, low: 4, icon: "sun" },
    { day: "Wed", high: 14, low: 3, icon: "cloud" },
    { day: "Thu", high: 17, low: 6, icon: "sun" },
    { day: "Fri", high: 19, low: 7, icon: "sun" },
  ]},
  auli: { temp: 8, condition: "Snowy", humidity: 70, wind: 15, icon: "snow", forecast: [
    { day: "Mon", high: 10, low: -2, icon: "snow" as "rain" },
    { day: "Tue", high: 8, low: -4, icon: "cloud" },
    { day: "Wed", high: 6, low: -5, icon: "rain" },
    { day: "Thu", high: 9, low: -1, icon: "sun" },
    { day: "Fri", high: 11, low: 0, icon: "sun" },
  ]},
  default: { temp: 24, condition: "Pleasant", humidity: 55, wind: 10, icon: "sun", forecast: [
    { day: "Mon", high: 26, low: 18, icon: "sun" },
    { day: "Tue", high: 25, low: 17, icon: "cloud" },
    { day: "Wed", high: 23, low: 16, icon: "rain" },
    { day: "Thu", high: 24, low: 17, icon: "sun" },
    { day: "Fri", high: 27, low: 19, icon: "sun" },
  ]},
};

function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  const props = { className: cn("h-5 w-5", className) };
  switch (icon) {
    case "rain": return <CloudRain {...props} />;
    case "snow": return <Snowflake {...props} />;
    case "cloud": return <Cloud {...props} />;
    case "wind": return <Wind {...props} />;
    default: return <Sun {...props} />;
  }
}

export function WeatherWidget({ destination, className }: WeatherWidgetProps) {
  const weather = useMemo(() => {
    const key = destination.toLowerCase().replace(/\s+/g, "-").split(",")[0];
    const slug = Object.keys(weatherData).find((k) => key.includes(k)) ?? "default";
    return weatherData[slug] ?? weatherData.default;
  }, [destination]);

  return (
    <Card className={cn("dark:border-gray-800 dark:bg-gray-900", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Weather in</p>
            <h3 className="font-bold text-gray-900 dark:text-white">{destination}</h3>
          </div>
          <WeatherIcon icon={weather.icon} className="h-10 w-10 text-yellow-500" />
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{weather.temp}°C</span>
          <span className="mb-1 text-gray-500">{weather.condition}</span>
        </div>

        <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5" />
            {weather.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind className="h-3.5 w-3.5" />
            {weather.wind} km/h
          </span>
        </div>

        <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          {weather.forecast.map((day) => (
            <div key={day.day} className="text-center">
              <p className="text-xs text-gray-500">{day.day}</p>
              <WeatherIcon icon={day.icon} className="mx-auto my-1 h-4 w-4 text-gray-400" />
              <p className="text-xs font-medium text-gray-900 dark:text-white">{day.high}°</p>
              <p className="text-xs text-gray-400">{day.low}°</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
