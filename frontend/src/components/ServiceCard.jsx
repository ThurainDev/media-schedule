import React, { useState } from 'react';

export default function ServiceCard({ serviceName, timeLabel, schedules = [] }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const teams = ['Video Team', 'Photo Team', 'VJ Team', 'Lighting Team'];

  const effectiveTeam = selectedTeam ?? 'Video Team';
  const displayTitle = selectedTeam
    ? `${serviceName} ${effectiveTeam} Schedule`
    : `${serviceName}`;

  const normalizeTimeLabelToValue = (label) => {
    if (typeof label !== 'string') return label;
    // Convert labels like "Time - 9 AM" to "9 AM"
    return label.replace(/^Time\s*-\s*/i, '').trim();
  };

  const rolesByTeam = {
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

  const roles = rolesByTeam[effectiveTeam];
  const times = Array.isArray(timeLabel) ? timeLabel : [timeLabel];

  // Get schedule data for the selected team and current service
  const getTeamSchedule = (team, atTime) => {
    if (!schedules || schedules.length === 0) return null;
    const normalized = normalizeTimeLabelToValue(atTime);
    // Find schedule for this team, service, and specific time
    return schedules.find(schedule =>
      schedule.team === team &&
      schedule.service === serviceName &&
      schedule.time === normalized
    );
  };

  const Panel = ({ title, time, showTitle }) => {
    const currentTeamSchedule = getTeamSchedule(effectiveTeam, time);
    // Handle different assignment data structures
    let assignments = {};
    if (currentTeamSchedule?.assignments) {
      if (currentTeamSchedule.assignments instanceof Map) {
        assignments = Object.fromEntries(currentTeamSchedule.assignments);
      } else if (typeof currentTeamSchedule.assignments === 'object') {
        assignments = currentTeamSchedule.assignments;
      }
    }
    return (
      <div className="rounded-xl p-6 bg-[#0B4D8C]/5 border border-[#0B4D8C]/20">
        {showTitle && (
          <div className="text-center font-semibold text-[#0B192C} mb-2 text-lg">
            {title}
          </div>
        )}
        <div className="text-center font-medium text-[#0B4D8C] mb-6">
          {time}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
          <div className="space-y-2">
            {roles.map((role) => (
              <div key={role}>{role}</div>
            ))}
          </div>
          <div className="space-y-2 text-[#0B4D8C]">
            {roles.map((role) => (
              <div key={role}>
                {assignments[role] || 'Unassigned'}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-white/95 border border-[#0B4D8C]/20 shadow-lg p-6 backdrop-blur-sm">
      <div className="flex flex-wrap gap-3 mb-5">
        {teams.map((team) => {
          const isActive = selectedTeam === team;
          // Determine if there is any schedule for this team & service across the times in this card
          const timeValues = (Array.isArray(times) ? times : [times]).map(normalizeTimeLabelToValue);
          const hasSchedule = schedules?.some(s => s.team === team && s.service === serviceName && timeValues.includes(s.time));
          
          return (
            <span
              key={team}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedTeam(isActive ? null : team)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedTeam(isActive ? null : team);
              }}
              aria-pressed={isActive}
              className={
                `inline-block cursor-pointer select-none text-sm px-4 py-1 rounded-full border transition-colors ` +
                (isActive
                  ? 'bg-[#0B4D8C] text-white border-[#0B4D8C] shadow'
                  : hasSchedule
                    ? 'bg-[#1693F2]/15 text-[#0B192C] border-[#1693F2]/30 hover:bg-[#1693F2]/25'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed')
              }
              title={hasSchedule ? `View ${team} schedule` : 'No schedule available'}
            >
              {team}
            </span>
          );
        })}
      </div>

      {/* Single or multiple panels */}
      {times.length === 1 ? (
        <Panel title={displayTitle} time={times[0]} showTitle />
      ) : (
        <div className="space-y-6">
          <Panel title={displayTitle} time={times[0]} showTitle />
          {times.slice(1).map((t, idx) => (
            <Panel key={idx} title={displayTitle} time={t} />
          ))}
        </div>
      )}
    </div>
  );
}