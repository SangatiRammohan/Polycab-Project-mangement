import React, { useState, useEffect } from 'react';
import { fetchTasks,AllTasks } from '../api/taskApi';
import StateFilter from './FilterComponent';
import ProjectCard from './Cards';
import TimelineGraph from './WorkProgressGraph';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedBusinessArea, setSelectedBusinessArea] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  
  // Milestone mapping - matches the one in TaskManagement.jsx
  const reverseMilestoneMapping = {
    'desktop_survey_design': 'Desktop Survey Design',
    'network_health_checkup': 'Network Health Checkup',
    'hoto_existing': 'HOTO-Existing',
    'detailed_design': 'Detailed Design',
    'row': 'ROW (Right of Way)',
    'ifc': 'IFC (Issued for Construction)',
    'ic': 'IC (Initial Construction)',
    'as_built': 'As-Built',
    'hoto_final': 'HOTO (Final)',
    'field_survey': 'Field Survey'
  };

  // Background colors for milestone cards
  const milestoneColors = {
    'desktop_survey_design': '#1E3A8A',
    'network_health_checkup': '#1E3A8A',
    'hoto_existing': '#1E3A8A',
    'detailed_design': '#1E3A8A',
    'row': '#1E3A8A',
    'ifc': '#1E3A8A',
    'ic': '#1E3A8A',
    'as_built': '#1E3A8A',
    'hoto_final': '#1E3A8A',
    'field_survey': '#1E3A8A'
  };

  // Fetch tasks on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await AllTasks();
        setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
        setFilteredTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
      } catch (err) {
        setError(err.message);
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, []);

  // Filter tasks when filters change
  useEffect(() => {
    let result = [...tasks];
    
    if (selectedState) {
      result = result.filter(task => task.state === selectedState);
    }
    
    if (selectedBusinessArea) {
      result = result.filter(task => task.business_area === selectedBusinessArea);
    }
    
    if (selectedDistrict) {
      result = result.filter(task => task.district === selectedDistrict);
    }
    
    if (selectedBlock) {
      result = result.filter(task => task.block === selectedBlock);
    }
    
    setFilteredTasks(result);
  }, [selectedState, selectedBusinessArea, selectedDistrict, selectedBlock, tasks]);

  // Handle filter changes
  const handleFilterChange = (state, businessArea, district, block) => {
    setSelectedState(state);
    setSelectedBusinessArea(businessArea);
    setSelectedDistrict(district);
    setSelectedBlock(block);
  };
  
  // Create project cards data from tasks
  const generateProjectData = () => {
    // Initialize an object to hold counts for each milestone
    const milestoneCounts = {};
    
    // Initialize with all milestones from the mapping
    Object.keys(reverseMilestoneMapping).forEach(milestone => {
      milestoneCounts[milestone] = {
        title: reverseMilestoneMapping[milestone],
        tasks: { nil: 0, inProgress: 0, completed: 0 },
        bgColor: milestoneColors[milestone] || '#00008B'
      };
    });
    
    // Count tasks by milestone and status
    filteredTasks.forEach(task => {
      if (milestoneCounts[task.milestone]) {
        if (task.status === 'nil') {
          milestoneCounts[task.milestone].tasks.nil++;
        } else if (task.status === 'in_progress') {
          milestoneCounts[task.milestone].tasks.inProgress++;
        } else if (task.status === 'completed') {
          milestoneCounts[task.milestone].tasks.completed++;
        }
      }
    });
    
    // Convert to array for rendering
    return Object.values(milestoneCounts);
  };

  // Generate timeline data from tasks
  const generateTimelineData = () => {
    const timelineData = {
      title: "Timeline-wise Progress",
      startDate: new Date().toISOString().split('T')[0], // Default to today
      endDate: new Date().toISOString().split('T')[0],   // Default to today
      tasks: []
    };
    
    if (filteredTasks.length > 0) {
      // Find earliest start date and latest end date
      const dates = filteredTasks.flatMap(task => [
        new Date(task.start_date),
        new Date(task.estimated_end_date || task.end_date)
      ]);
      
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      timelineData.startDate = minDate.toISOString().split('T')[0];
      timelineData.endDate = maxDate.toISOString().split('T')[0];
      
      // Convert tasks to timeline format
      timelineData.tasks = filteredTasks.map(task => {
        let status = 'planned';
        if (task.status === 'completed') {
          status = 'completed';
        } else if (task.status === 'in_progress') {
          // Check if task is delayed
          const today = new Date();
          const endDate = new Date(task.estimated_end_date || task.end_date);
          if (endDate < today) {
            status = 'delayed';
          } else {
            status = 'in-progress';
          }
        }
        
        return {
          name: task.title,
          milestone: reverseMilestoneMapping[task.milestone] || task.milestone,
          startDate: task.start_date,
          endDate: task.estimated_end_date || task.end_date,
          status: status
        };
      });
    }
    
    return timelineData;
  };

  // Calculate overall progress statistics
  const calculateStats = () => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(task => task.status === 'completed').length;
    const inProgress = filteredTasks.filter(task => task.status === 'in_progress').length;
    const nil = filteredTasks.filter(task => task.status === 'nil').length;
    
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      inProgress,
      nil,
      completionPercentage
    };
  };

  const projectData = generateProjectData();
  const timelineData = generateTimelineData();
  const stats = calculateStats();

  if (loading) return <div className="loading">Loading dashboard data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <StateFilter onFilterChange={handleFilterChange} />
        </div>
        
        <div className="project-cards-grid">
          {projectData.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
      
      <div className="timeline-section">
        <h2>Task Timeline</h2>
        <TimelineGraph timelineData={timelineData} />
      </div>
    </div>
  );
};

export default Dashboard;