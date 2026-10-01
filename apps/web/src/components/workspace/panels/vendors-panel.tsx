'use client';

import { Handshake, Mail, Phone } from 'lucide-react';
import { VENDOR_STATUSES } from '@xperience/shared';
import type { Category, EventDetails, Vendor } from '@xperience/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntityNames } from '@/hooks/use-entity-names';
import { useVendors } from '@/hooks/use-event-data';
import { useUpdateVendor } from '@/hooks/use-event-mutations';
import { humanize } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { EmptyState } from '../empty-state';
import { StatusSelect } from '../status-select';

function groupByCategory(vendors: Vendor[]): [Category, Vendor[]][] {
  const groups = new Map<Category, Vendor[]>();
  vendors.forEach((v) => groups.set(v.category, [...(groups.get(v.category) ?? []), v]));
  return [...groups.entries()];
}

export function VendorsPanel({ event }: { event: EventDetails }) {
  const { data: vendors = [] } = useVendors(event.id);
  const names = useEntityNames(event);
  const updateVendor = useUpdateVendor(event.id);

  if (vendors.length === 0) {
    return (
      <EmptyState
        icon={Handshake}
        title="No vendors yet"
        description="Mention vendors to the assistant as you shortlist or book them."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groupByCategory(vendors).map(([category, group]) => (
        <Card key={category} size="sm">
          <CardHeader>
            <CardTitle className="text-sm">{humanize(category)}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {group.map((vendor) => (
                <li key={vendor.id} className="space-y-1.5 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        (vendor.status === 'unavailable' || vendor.status === 'cancelled') &&
                          'text-muted-foreground line-through',
                      )}
                    >
                      {vendor.name}
                    </p>
                    <StatusSelect
                      label={`Status of ${vendor.name}`}
                      value={vendor.status}
                      options={VENDOR_STATUSES}
                      disabled={
                        updateVendor.isPending && updateVendor.variables.vendorId === vendor.id
                      }
                      onChange={(status) =>
                        updateVendor.mutate({ vendorId: vendor.id, input: { status } })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[
                      vendor.capacity !== null && `Capacity ${vendor.capacity}`,
                      vendor.cost !== null && `Cost ${vendor.cost.toLocaleString('en-IN')}`,
                      vendor.subEventIds.length > 0
                        ? `Covers ${vendor.subEventIds.map((id) => names.get(id)).join(', ')}`
                        : 'Covers all sub-events',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {(vendor.contact.phone || vendor.contact.email) && (
                    <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      {vendor.contact.phone && (
                        <a href={`tel:${vendor.contact.phone}`} className="flex items-center gap-1">
                          <Phone className="size-3" aria-hidden />
                          {vendor.contact.phone}
                        </a>
                      )}
                      {vendor.contact.email && (
                        <a
                          href={`mailto:${vendor.contact.email}`}
                          className="flex items-center gap-1"
                        >
                          <Mail className="size-3" aria-hidden />
                          {vendor.contact.email}
                        </a>
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
