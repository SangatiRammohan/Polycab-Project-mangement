import React from 'react';
import './WorkProgressGraph.css';

const TimelineGraph = ({ timelineData }) => {
  if (!timelineData || !timelineData.tasks || timelineData.tasks.length === 0) {
    return <div className="empty-timeline">No timeline data available</div>;
  }

  const startDate = new Date(timelineData.startDate);
  const endDate   = new Date(timelineData.endDate);

  // Add 1 month padding on each side
  startDate.setMonth(startDate.getMonth() - 1);
  endDate.setMonth(endDate.getMonth() + 1);

  // Build months array for header
  const months = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  const totalDuration = endDate.getTime() - startDate.getTime();

  const calculateBar = (task) => {
    const ts = new Date(task.startDate).getTime();
    const te = new Date(task.endDate || new Date()).getTime();
    const left  = ((ts - startDate.getTime()) / totalDuration) * 100;
    const width = ((te - ts) / totalDuration) * 100;
    return {
      left:  `${Math.max(0, left)}%`,
      width: `${Math.max(0.5, Math.min(100 - Math.max(0, left), width))}%`,
    };
  };

  const formatMonth = (d) =>
    `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;

  return (
    <div className="timeline-chart">

      {/* Scroll wrapper — fixes mobile/tablet clipping */}
      <div className="timeline-scroll-wrapper">
        <div className="timeline-inner">

          {/* Header row */}
          <div className="timeline-header">
            <div className="timeline-header-row">
              <div className="timeline-task-name" />
              <div className="timeline-months">
                {months.map((m, i) => (
                  <div key={i} className="timeline-month">{formatMonth(m)}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Task rows */}
          <div className="timeline-body">
            {timelineData.tasks.map((task, i) => {
              const bar = calculateBar(task);
              return (
                <div key={i} className="timeline-row">
                  <div className="timeline-task-name">
                    <div>{task.name}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                      {task.milestone}
                    </div>
                  </div>
                  <div className="timeline-task-bar">
                    <div
                      className={`timeline-chart-bar ${task.status}`}
                      style={{ left: bar.left, width: bar.width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Legend */}
      <div className="timeline-legend">
        <div className="legend-item">
          <div style={{ width: 20, height: 10, background: '#E74C3C', borderRadius: 2 }} />
          <span>Nil</span>
        </div>
        <div className="legend-item">
          <div style={{ width: 20, height: 10, background: '#F39C12', borderRadius: 2 }} />
          <span>In Progress</span>
        </div>
        <div className="legend-item">
          <div style={{ width: 20, height: 10, background: '#1E8449', borderRadius: 2 }} />
          <span>Completed</span>
        </div>
      </div>

    </div>
  );
};

export default TimelineGraph;