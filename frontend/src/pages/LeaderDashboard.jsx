import React, { useMemo, useState, useEffect } from 'react';
import { schedulesAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TEAMS = ['Video Team', 'Photo Team', 'VJ Team', 'Lighting Team'];

const ROLES_BY_TEAM = {
  'Video Team': [
    'Operation Director',
    'Operation Assistant',
    'Switcher 1',
    'Switcher 2',
    'C1',
    'C2',
    'C3',
    'C4',
    'C5',
    'C6',
    'Live Comment',
    'Media Maintenance',
  ],
  'Photo Team': ['Lead', 'Assist'],
  'VJ Team': ['Lead', 'Assist', 'Trainee'],
  'Lighting Team': ['Lead', 'Assist', 'Trainee'],
};

const SERVICES_BY_DAY = {
  saturday: [
    { name: 'Fasting Service', times: ['9 AM'] },
    { name: 'The Arrow Service', times: ['2 PM'] },
  ],
  sunday: [
    { name: 'Main Service', times: ['9 AM', '12 PM', '3 PM'] },
    { name: 'Children Service', times: ['9 AM'] },
  ],
};

function getStartOfWeekWednesday(baseDate = new Date()) {
  const d = new Date(baseDate);
  d.setHours(0, 0, 0, 0);
  const dayIdx = d.getDay(); // 0=Sun .. 6=Sat, Wed=3
  const delta = (dayIdx - 3 + 7) % 7; // back to Wednesday
  const start = new Date(d);
  start.setDate(d.getDate() - delta);
  return start;
}

function getDateForCurrentWeekDay(whichDay) {
  const start = getStartOfWeekWednesday();
  const offset = whichDay === 'saturday' ? 3 : 4; // Sat=+3, Sun=+4 from Wednesday
  const result = new Date(start);
  result.setDate(start.getDate() + offset);
  return result.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function LeaderDashboard() {
  const { user } = useAuth();
  const [day, setDay] = useState('saturday');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [hasManualDate, setHasManualDate] = useState(false);
  const services = SERVICES_BY_DAY[day];
  const [serviceName, setServiceName] = useState(services[0].name);
  const timeOptions = useMemo(
    () => services.find((s) => s.name === serviceName)?.times ?? [],
    [services, serviceName]
  );
  const [time, setTime] = useState(timeOptions[0] ?? '9 AM');
  const [team, setTeam] = useState(user?.team || 'Photo Team');
  const [teamMembers, setTeamMembers] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // key: `${selectedDate}|${day}|${serviceName}|${time}|${team}` -> { role: string }
  const [scheduleData, setScheduleData] = useState({});

  const roles = ROLES_BY_TEAM[team];
  const scheduleKey = `${selectedDate}|${day}|${serviceName}|${time}|${team}`;

  // Format selected date for display
  const formattedDate = new Date(selectedDate).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Ensure structure exists for current selection
  const currentAssignments = scheduleData[scheduleKey] ?? roles.reduce((acc, role) => {
    acc[role] = '';
    return acc;
    }, {});

  // Fetch team members when team changes
  useEffect(() => {
    if (team && user?.role === 'team_leader') {
      fetchTeamMembers();
    }
  }, [team, user]);

  // Check for existing schedule data when schedule key changes
  useEffect(() => {
    if (scheduleKey) {
      checkExistingSchedule();
    }
  }, [scheduleKey]);

  const checkExistingSchedule = async () => {
    try {
      // Check if we already have data for this schedule key
      if (scheduleData[scheduleKey]) {
        return; // Data already exists
      }
      
      // Fetch all schedules and find the matching one
      const response = await schedulesAPI.getAll();
      if (response.success && response.schedules) {
        // Find schedule for current date, day, service, time, and team
        const existingSchedule = response.schedules.find(schedule => 
          schedule.date === selectedDate && 
          schedule.day === day && 
          schedule.service === serviceName &&
          schedule.time === time && 
          schedule.team === team
        );
        
        if (existingSchedule && existingSchedule.assignments) {
          // Load existing data
          setScheduleData(prev => ({
            ...prev,
            [scheduleKey]: existingSchedule.assignments
          }));
        }
      }
    } catch {
      // Ignore errors
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await authAPI.getTeamMembers(team);
      if (response.success) {
        setTeamMembers(response.teamMembers);
      }
    } catch {
      // Ignore errors
    }
  };

  const setRoleValue = (role, value) => {
    setScheduleData((prev) => ({
      ...prev,
      [scheduleKey]: {
        ...(prev[scheduleKey] ?? {}),
        [role]: value,
      },
    }));
  };

  const handleChangeDay = (nextDay) => {
    setDay(nextDay);
    // Only auto-set date if user hasn't manually chosen a date this session
    if (!hasManualDate) {
      const nextDateISO = getDateForCurrentWeekDay(nextDay);
      setSelectedDate(nextDateISO);
    }

    const nextServices = SERVICES_BY_DAY[nextDay];
    setServiceName(nextServices[0].name);
    setTime(nextServices[0].times[0]);
  };

  const handleChangeService = (name) => {
    setServiceName(name);
    const svc = services.find((s) => s.name === name);
    setTime(svc?.times?.[0] ?? '');
  };

  const handleTimeChange = (newTime) => {
    setTime(newTime);
  };

  const handleDateInput = (value) => {
    setSelectedDate(value);
    setHasManualDate(true);
  };

  const handleTeamChange = (newTeam) => {
    setTeam(newTeam);
  };

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess('');
    setIsSaving(true);

    try {
      const payload = {
        date: selectedDate,
        day,
        service: serviceName,
        time,
        team,
        assignments: scheduleData[scheduleKey] ?? {},
        notes: `Created by ${user?.name}`
      };

      const result = await schedulesAPI.create(payload);
      if (result?.success) {
        setSaveSuccess(`Schedule saved successfully for ${serviceName} at ${time} on ${formattedDate}!`);
        // Clear the form after successful save
        setScheduleData((prev) => ({ ...prev, [scheduleKey]: roles.reduce((acc, r) => ({ ...acc, [r]: '' }), {}) }));
      } else {
        setSaveError(result?.message || 'Failed to save schedule');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setScheduleData((prev) => ({ ...prev, [scheduleKey]: roles.reduce((acc, r) => ({ ...acc, [r]: '' }), {}) }));
  };

  const handleClearAll = () => {
    setScheduleData({});
  };

  // Filter team selection to only show user's team if they're a team leader
  const availableTeams = user?.role === 'team_leader' ? [user.team] : TEAMS;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-center text-white drop-shadow">Leader Schedule Editor</h1>
      
      {/* User Info */}
      <div className="bg-white/95 border border-[#0B4D8C]/20 rounded-2xl p-4 shadow-lg">
        <div className="text-center">
          <div className="text-[#0B4D8C] font-medium">Welcome, {user?.name}</div>
          <div className="text-sm text-gray-600">{user?.team} • Team Leader</div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white/95 border border-[#0B4D8C]/20 rounded-2xl p-5 shadow-lg">
        <div className="text-center mb-4">
          <div className="text-[#0B4D8C] font-medium mb-2">Selected Date</div>
          <div className="text-lg font-semibold text-[#0B192C]">{formattedDate}</div>
        </div>
        <div className="flex justify-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateInput(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4D8C]/40"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/95 border border-[#0B4D8C]/20 rounded-2xl p-5 shadow-lg">
        {/* Day toggle */}
        <div className="flex flex-wrap items-center gap-3 justify-center mb-4">
          {(['saturday', 'sunday']).map((d) => (
            <button
              key={d}
              onClick={() => handleChangeDay(d)}
              className={`px-4 py-2 rounded-full shadow text-sm md:text-base whitespace-nowrap ${
                day === d ? 'bg-white text-gray-900' : 'bg-white/80 text-gray-800 hover:bg-white'
              }`}
            >
              {d === 'saturday' ? 'Saturday' : 'Sunday'}
            </button>
          ))}
        </div>

        {/* Service selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {services.map((svc) => (
            <button
              key={svc.name}
              onClick={() => handleChangeService(svc.name)}
              className={`px-4 py-2 rounded-full border text-sm md:text-base transition ${
                serviceName === svc.name
                  ? 'bg-[#0B4D8C] text-white border-[#0B4D8C] shadow'
                  : 'bg-[#1693F2]/15 text-[#0B192C] border-[#1693F2]/30 hover:bg-[#1693F2]/25'
              }`}
            >
              {svc.name}
            </button>
          ))}
        </div>

        {/* Time selector */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {timeOptions.map((t) => (
            <button
              key={t}
              onClick={() => handleTimeChange(t)}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                time === t
                  ? 'bg-[#0B4D8C] text-white border-[#0B4D8C] shadow'
                  : 'bg-[#1693F2]/15 text-[#0B192C] border-[#1693F2]/30 hover:bg-[#1693F2]/25'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Team selector */}
        <div className="flex flex-wrap gap-3 justify-center">
          {availableTeams.map((t) => (
            <button
              key={t}
              onClick={() => handleTeamChange(t)}
              className={`px-4 py-1 rounded-full border text-sm transition ${
                team === t
                  ? 'bg-[#0B4D8C] text-white border-[#0B4D8C] shadow'
                  : 'bg-[#1693F2]/15 text-[#0B192C] border-[#1693F2]/30 hover:bg-[#1693F2]/25'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Team Members Info */}
      {teamMembers.length > 0 && (
        <div className="bg-white/95 border border-[#0B4D8C]/20 rounded-2xl p-4 shadow-lg">
          <div className="text-center mb-3">
            <div className="text-[#0B4D8C] font-medium">Available Team Members</div>
            <div className="text-sm text-gray-600">{teamMembers.length} members available</div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {teamMembers.map((member) => (
              <span key={member._id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {member.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Editor Card */}
      <div className="rounded-2xl bg-white/95 border border-[#0B4D8C]/20 shadow-lg p-6">
        <div className="text-center font-semibold text-[#0B192C] mb-1 text-lg">
          {serviceName} • {time} • {team}
        </div>
        <div className="text-center text-[#0B4D8C] mb-6">Enter names for each role</div>

        <div className="grid sm:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div key={role} className="flex items-center gap-3">
              <label className="w-40 text-sm text-gray-700">{role}</label>
              <input
                type="text"
                value={currentAssignments[role] ?? ''}
                onChange={(e) => setRoleValue(role, e.target.value)}
                placeholder="Their Name"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4D8C]/40"
              />
            </div>
          ))}
        </div>

        {/* Save feedback */}
        <div className="mt-4 min-h-[24px]">
          {saveError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              {saveSuccess}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 justify-end">
          <button onClick={handleClear} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Clear</button>
          <button onClick={handleClearAll} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Clear All</button>
          <button onClick={handleSave} disabled={isSaving} className={`px-4 py-2 rounded-md text-white ${isSaving ? 'bg-[#0B4D8C]/60' : 'bg-[#0B4D8C] hover:bg-[#0A3E75]'}`}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
