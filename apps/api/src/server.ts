import { APP_NAME } from '@xperience/shared';
import { operationSchema } from '@xperience/shared';

console.log(`${APP_NAME} API workspace is wired up`);

const samples: unknown[] = [
  { op: 'updateVendor', target: 'V2', patch: { capacity: 150 } },
  { op: 'addTask', data: { title: 'Arrange airport transfers', category: 'transportation' } },
  { op: 'deleteTask', target: 'T1' },
  { op: 'addTask', data: { title: '', category: 'food' } },
];

for (const sample of samples) {
  const result = operationSchema.safeParse(sample);
  console.log(result.success ? 'OK  ' : 'FAIL', JSON.stringify(sample));
  if (!result.success) console.log('     ', result.error.issues.map((i) => i.message).join('; '));
}