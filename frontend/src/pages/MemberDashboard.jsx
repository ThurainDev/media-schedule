import React, { useState, useEffect, useMemo } from 'react'
import ServiceCard from '../components/ServiceCard'
import { schedulesAPI } from '../services/api'

export default function MemberDashboard() {
  const [day, setDay] = useState('saturday');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helpers for Wednesday-start week
  const getStartOfWeekWednesday = (baseDate = new Date()) => {
    const d = new Date(baseDate);
    d.setHours(0, 0, 0, 0);
    const dayIdx = d.getDay(); // 0=Sun .. 6=Sat, Wed=3
    const delta = (dayIdx - 3 + 7) % 7; // distance back to Wednesday
    const start = new Date(d);
    start.setDate(d.getDate() - delta);
    return start;
  };

  const getDateForCurrentWeekDay = (whichDay) => {
    const start = getStartOfWeekWednesday();
    // Offsets from Wednesday-start: Sat=+3, Sun=+4
    const offset = whichDay === 'saturday' ? 3 : 4;
    const result = new Date(start);
    result.setDate(start.getDate() + offset);
    return result;
  };

  const toLocalYMD = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedDayDate = getDateForCurrentWeekDay(day);
  const selectedDayYMD = toLocalYMD(selectedDayDate);

  // Format date for display
  const formattedDate = selectedDayDate.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const saturday = {
    left: [{ name: 'Fasting Service', time: 'Time - 9 AM' }],
    right: [{ name: 'The Arrow Service', time: 'Time - 2 PM' }],
  };

  const sunday = {
    left: [
      { name: 'Main Service', time: ['Time - 9 AM', 'Time - 12 PM', 'Time - 3 PM'] },
    ],
    right: [
      { name: 'Children Service', time: 'Time - 9 AM' }
    ],
  };

  const services = day === 'sunday' ? sunday : saturday;

  const baseBtn = 'px-4 py-2 md:px-6 md:py-2 rounded-full shadow font-medium transition text-sm md:text-base whitespace-nowrap';

  // Fetch schedules from MongoDB
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await schedulesAPI.getAll();
        if (response.success) {
          setSchedules(response.schedules);
        } else {
          setError('Failed to fetch schedules');
        }
      } catch (err) {
        setError('Error connecting to server. Please check if backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Filter schedules by exact selected date and day
  const schedulesForSelected = useMemo(() => {
    return schedules.filter((schedule) => {
      if (schedule.day !== day) return false;
      const sDate = new Date(schedule.date);
      const sYMD = toLocalYMD(sDate);
      return sYMD === selectedDayYMD;
    });
  }, [schedules, day, selectedDayYMD]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold text-center text-white drop-shadow mb-1">
          Media Team Schedule
        </h1>
        <div className="flex justify-center">
          <div className="text-white text-lg">Loading schedules...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold text-center text-white drop-shadow mb-1">
          Media Team Schedule
        </h1>
        <div className="flex justify-center">
          <div className="text-red-300 text-lg bg-red-900/20 px-4 py-2 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-center text-white drop-shadow mb-1">Media Team Schedule</h1>

      <div className="flex justify-center gap-3 md:gap-4">
        <button
          onClick={() => setDay('saturday')}
          className={`${baseBtn} ${
            day === 'saturday' ? 'bg-white text-gray-900' : 'bg-white/80 text-gray-800 hover:bg-white'
          }`}
        >
          Saturday Schedule
        </button>
        <button
          onClick={() => setDay('sunday')}
          className={`${baseBtn} ${
            day === 'sunday' ? 'bg-white text-gray-900' : 'bg-white/80 text-gray-800 hover:bg-white'
          }`}
        >
          Sunday Schedule
        </button>
      </div>

      {/* Date under buttons - actual this week's selected day */}
      <div className="text-center text-white/90">{formattedDate}</div>

      {/* Only render cards if there are schedules for the selected date */}
      {schedulesForSelected.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column services */}
          <div className="space-y-6">
            {services.left.map((svc, idx) => (
              <ServiceCard 
                key={`L-${idx}`} 
                serviceName={svc.name} 
                timeLabel={svc.time}
                schedules={schedulesForSelected}
              />
            ))}
          </div>

          {/* Right column services */}
          <div className="space-y-6">
            {services.right.map((svc, idx) => (
              <ServiceCard 
                key={`R-${idx}`} 
                serviceName={svc.name} 
                timeLabel={svc.time}
                schedules={schedulesForSelected}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
