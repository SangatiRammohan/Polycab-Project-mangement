import React from 'react';
import './WorkProgressGraph.css'; // Import your CSS file for styling
// import './Dashboard.css'; // Import your CSS file for styling
const TimelineGraph = ({ timelineData }) => {
  if (!timelineData || !timelineData.tasks || timelineData.tasks.length === 0) {
    return <div className="empty-timeline">No timeline data available</div>;
  }

  // Calculate date range for the timeline
  const startDate = new Date(timelineData.startDate);
  const endDate = new Date(timelineData.endDate);
  
  // Add padding to the date range (1 month before and after)
  startDate.setMonth(startDate.getMonth() - 1);
  endDate.setMonth(endDate.getMonth() + 1);
  
  // Generate array of months for the timeline header
  const months = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  // Function to calculate position and width for a task bar
  const calculateTaskBar = (task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate || new Date());
    
    // Calculate position as percentage of the timeline
    const totalDuration = endDate.getTime() - startDate.getTime();
    const taskStartOffset = taskStart.getTime() - startDate.getTime();
    const taskDuration = taskEnd.getTime() - taskStart.getTime();
    
    const startPercent = (taskStartOffset / totalDuration) * 100;
    const widthPercent = (taskDuration / totalDuration) * 100;
    
    return {
      left: `${Math.max(0, startPercent)}%`,
      width: `${Math.min(100, widthPercent)}%`
    };
  };
  
  // Format date for display (e.g. Jan 2025)
  const formatMonth = (date) => {
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  return (
    <div className="timeline-chart">
      <div className="timeline-header">
        <div className="timeline-header-row">
          <div className="timeline-task-name"></div>
          <div className="timeline-months" style={{ display: 'flex' }}>
            {months.map((month, index) => (
              <div 
                key={index} 
                className="timeline-month"
                style={{ flex: 1, textAlign: 'center', fontSize: '12px' }}
              >
                {formatMonth(month)}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="timeline-body">
        {timelineData.tasks.map((task, index) => {
          const barStyle = calculateTaskBar(task);
          return (
            <div key={index} className="timeline-row">
              <div className="timeline-task-name">
                {task.name}
                <div style={{ fontSize: '12px', color: '#666' }}>{task.milestone}</div>
              </div>
              <div className="timeline-task-bar" style={{ position: 'relative', flex: 1 }}>
                <div 
                  className={`timeline-chart-bar ${task.status}`}
                  style={{
                    position: 'absolute',
                    left: barStyle.left,
                    width: barStyle.width,
                    top: '5px',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="timeline-legend" style={{ marginTop: '15px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '10px', backgroundColor: ' #E74C3C', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px' }}>nil</span>
        </div>
        <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '10px', backgroundColor: '#F39C12', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px' }}>In Progress</span>
        </div>
        <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '10px', backgroundColor: '#1E8449', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px' }}>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineGraph;