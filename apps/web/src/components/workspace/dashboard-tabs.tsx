'use client';

import type { EventDetails } from '@xperience/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRisks } from '@/hooks/use-event-data';
import { OverviewPanel } from './overview/overview-panel';
import { ActivityPanel } from './panels/activity-panel';
import { RisksPanel } from './panels/risks-panel';
import { TasksPanel } from './panels/tasks-panel';
import { TimelinePanel } from './panels/timeline-panel';
import { VendorsPanel } from './panels/vendors-panel';

export function DashboardTabs({ event }: { event: EventDetails }) {
  const { data: risks = [] } = useRisks(event.id);
  const openRisks = risks.filter((r) => r.status === 'open').length;

  const tabs = [
    { value: 'overview', label: 'Overview', panel: <OverviewPanel event={event} /> },
    { value: 'timeline', label: 'Timeline', panel: <TimelinePanel event={event} /> },
    { value: 'tasks', label: 'Tasks', panel: <TasksPanel event={event} /> },
    { value: 'vendors', label: 'Vendors', panel: <VendorsPanel event={event} /> },
    {
      value: 'risks',
      label: openRisks > 0 ? `Risks (${openRisks})` : 'Risks',
      panel: <RisksPanel event={event} />,
    },
    { value: 'activity', label: 'Activity', panel: <ActivityPanel event={event} /> },
  ];

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      {/* Scrolls sideways on narrow screens instead of wrapping */}
      <div className="overflow-x-auto">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
