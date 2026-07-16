import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useState } from "react";
import { CalendarCheck, IndianRupee, Users, Star, CloudUpload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/hooks/useAdmin";
import { syncWebsiteContentToSupabase } from "@/lib/sync-to-supabase";
import { isSupabaseConfigured } from "@/lib/supabase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncWebsiteContentToSupabase();
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    } catch (e) {
      toast.error((e as Error).message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const bookingsChartData = {
    labels: stats?.monthlyBookings.map((m) => m.month) ?? [],
    datasets: [
      {
        label: "Bookings",
        data: stats?.monthlyBookings.map((m) => m.count) ?? [],
        borderColor: "#e53935",
        backgroundColor: "rgba(229, 57, 53, 0.12)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#e53935",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueChartData = {
    labels: stats?.monthlyRevenue.map((m) => m.month) ?? [],
    datasets: [
      {
        label: "Revenue (₹)",
        data: stats?.monthlyRevenue.map((m) => m.amount) ?? [],
        backgroundColor: "#e53935",
        hoverBackgroundColor: "#c62828",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "#9ca3af" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af" },
      },
    },
  };

  return (
    <AdminPageShell
      title="Dashboard"
      description="Overview of your travel business"
      action={
        isSupabaseConfigured ? (
          <Button className="h-11 rounded-lg" onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudUpload className="h-4 w-4" />
            )}
            {syncing ? "Syncing..." : "Sync to Supabase"}
          </Button>
        ) : undefined
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={isLoading ? "—" : (stats?.totalBookings ?? 0)}
          icon={CalendarCheck}
          trend={{ value: `${stats?.pendingBookings ?? 0} pending`, positive: false }}
        />
        <StatCard
          title="Total Revenue"
          value={isLoading ? "—" : formatCurrency(stats?.totalRevenue ?? 0)}
          icon={IndianRupee}
          trend={{ value: "+12% vs last month", positive: true }}
        />
        <StatCard
          title="Total Users"
          value={isLoading ? "—" : (stats?.totalUsers ?? 0)}
          icon={Users}
          subtitle="Registered customers"
        />
        <StatCard
          title="Pending Reviews"
          value={isLoading ? "—" : (stats?.pendingReviews ?? 0)}
          icon={Star}
          subtitle="Awaiting moderation"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={bookingsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={revenueChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  );
}
