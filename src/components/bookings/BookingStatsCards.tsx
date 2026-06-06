import React from 'react';
import { CalendarDays, TrendingUp, CheckCircle, DollarSign } from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import { Booking } from '@/types/booking';
import { formatCurrency } from '@/utils/formatters';

interface BookingStatsCardsProps {
  bookings: Booking[];
  loading?: boolean;
}

export function BookingStatsCards({ bookings, loading = false }: BookingStatsCardsProps) {
  // 1. Total Bookings
  const totalBookings = bookings.length;

  // 2. Bookings this month
  const thisMonthBookings = bookings.filter((b) => {
    try {
      const date = new Date(b.eventDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    } catch {
      return false;
    }
  }).length;

  // 3. Confirmed Bookings count
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  // 4. Pending Revenue (excluding cancelled bookings)
  const pendingRevenue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.pendingAmount || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Bookings"
        value={totalBookings}
        icon={<CalendarDays />}
        description="All recorded reservations"
        loading={loading}
      />
      <StatCard
        title="Bookings This Month"
        value={thisMonthBookings}
        icon={<TrendingUp />}
        description="Event dates in current month"
        loading={loading}
      />
      <StatCard
        title="Confirmed Bookings"
        value={confirmedCount}
        icon={<CheckCircle />}
        description="Finalized dates locked"
        loading={loading}
      />
      <StatCard
        title="Pending Revenue"
        value={formatCurrency(pendingRevenue)}
        icon={<DollarSign />}
        description="Oustanding client collections"
        loading={loading}
      />
    </div>
  );
}
