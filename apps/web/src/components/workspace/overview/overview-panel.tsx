'use client';

import { CheckSquare, Handshake, ShieldAlert, Users } from 'lucide-react';
import type { EventDetails } from '@xperience/shared';
import { useGuestSegments, useRisks, useTasks, useVendors } from '@/hooks/use-event-data';
import { StatCard } from './stat-card';
import { TopRisks } from './top-risks';

export function OverviewPanel({ event }: { event: EventDetails }) {
  const { data: tasks = [] } = useTasks(event.id);
  const { data: vendors = [] } = useVendors(event.id);
  const { data: risks = [] } = useRisks(event.id);
  const { data: segments = [] } = useGuestSegments(event.id);

  const activeTasks = tasks.filter((t) => t.status !== 'cancelled');
  const doneTasks = activeTasks.filter((t) => t.status === 'done').length;
  const openRisks = risks.filter((r) => r.status === 'open');
  const urgentRisks = openRisks.filter((r) => r.severity === 'critical' || r.severity === 'high');
  const confirmedVendors = vendors.filter((v) => v.status === 'confirmed').length;
  const travellingGuests = segments.reduce((sum, g) => sum + g.count, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={CheckSquare}
          label="Tasks done"
          value={`${doneTasks}/${activeTasks.length}`}
          progress={activeTasks.length ? doneTasks / activeTasks.length : 0}
        />
        <StatCard
          icon={ShieldAlert}
          label="Open risks"
          value={openRisks.length}
          detail={urgentRisks.length > 0 ? `${urgentRisks.length} high or critical` : 'None urgent'}
        />
        <StatCard
          icon={Handshake}
          label="Vendors confirmed"
          value={`${confirmedVendors}/${vendors.length}`}
        />
        <StatCard
          icon={Users}
          label="Guests"
          value={event.headcount}
          detail={travellingGuests > 0 ? `${travellingGuests} in tracked groups` : undefined}
        />
      </div>
      <TopRisks risks={risks} />
    </div>
  );
}
