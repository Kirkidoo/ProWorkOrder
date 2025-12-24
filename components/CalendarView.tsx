import React from 'react';
import { ServiceSchedule } from './ServiceSchedule';
import { Button } from './Button';
import { useApp } from '../context/AppContext';

export const CalendarView: React.FC = () => {
  const { setView } = useApp();
  const onBack = () => setView('OVERVIEW');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-rugged text-orange-500 uppercase">Shop Dashboard</h1>
        <Button variant="ghost" onClick={onBack}>Back to Overview</Button>
      </div>
      <ServiceSchedule />
    </div>
  );
};
