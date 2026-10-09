import React from 'react';
import { priorityClass, priorityLabel } from '../lib/ui';

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={`priority-badge ${priorityClass(priority)}`}
      title={`${priorityLabel(priority)} priority`}
    >
      {priorityLabel(priority)}
    </span>
  );
}
