import React from 'react';
// import './Cards.css';
import './Dashboard.css'; // Import your CSS file for styling
const ProjectCard = ({ project }) => {
  const { title, tasks, bgColor } = project;
  
  return (
    <div className="project-card">
      <div className="project-card-header" style={{ backgroundColor: bgColor }}>
        {title}
      </div>
      <div className="project-card-body">
        <div className="project-card-title">Tasks</div>
        <div className="task-stats">
          <div className="task-stat-item">
            <div className="task-label">Nil:</div>
            <div className="task-count nil">{tasks.nil}</div>
          </div>
          <div className="task-stat-item">
            <div className="task-label">In Progress:</div>
            <div className="task-count in-progress">{tasks.inProgress}</div>
          </div>
          <div className="task-stat-item">
            <div className="task-label">Completed:</div>
            <div className="task-count completed">{tasks.completed}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;