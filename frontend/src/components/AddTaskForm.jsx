import React, { useState, useEffect } from 'react';

const AddTaskForm = ({ onAddTask, users }) => {
    const [state, setState] = useState('Bihar');
    const [businessArea, setBusinessArea] = useState('');
    const [district, setDistrict] = useState('');
    const [block, setBlock] = useState('');
    const [milestone, setMilestone] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [taskName, setTaskName] = useState('');
    const [subTasks, setSubTasks] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const businessAreas = {
        Patna: ['District 1', 'District 2'],
        Gaya: ['District 3', 'District 4'],
        Bhagalpur: ['District 5', 'District 6'],
        Darbhanga: ['District 7', 'District 8'],
        Muzaffarnagar: ['District 9', 'District 10'],
    };

    const milestones = [
        'Desktop survey Design',
        'Network Health checkup',
        'Hoto-existing',
        'Detailed design',
        'ROW(Right of Way)',
        'IFC (issued for construction)',
        'IC(initial construction)',
        'As-Built',
        'HOTO(Final)',
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTask = {
            state,
            businessArea,
            district,
            block,
            milestone,
            assignedTo,
            taskName,
            subTasks,
            startDate,
            endDate,
        };
        onAddTask(newTask);
        resetForm();
    };

    const resetForm = () => {
        setBusinessArea('');
        setDistrict('');
        setBlock('');
        setMilestone('');
        setAssignedTo('');
        setTaskName('');
        setSubTasks('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add New Task</h2>
            <label>
                State:
                <select value={state} onChange={(e) => setState(e.target.value)}>
                    <option value="Bihar">Bihar</option>
                </select>
            </label>
            <label>
                Business Area:
                <select value={businessArea} onChange={(e) => setBusinessArea(e.target.value)}>
                    <option value="">Select</option>
                    {Object.keys(businessAreas).map((area) => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>
            </label>
            <label>
                District:
                <select value={district} onChange={(e) => setDistrict(e.target.value)}>
                    <option value="">Select</option>
                    {businessArea && businessAreas[businessArea].map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                    ))}
                </select>
            </label>
            <label>
                Block:
                <select value={block} onChange={(e) => setBlock(e.target.value)}>
                    <option value="">Select</option>
                    {/* Add block options based on district selection */}
                </select>
            </label>
            <label>
                Milestone:
                <select value={milestone} onChange={(e) => setMilestone(e.target.value)}>
                    <option value="">Select</option>
                    {milestones.map((milestone) => (
                        <option key={milestone} value={milestone}>{milestone}</option>
                    ))}
                </select>
            </label>
            <label>
                Assign To:
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                    <option value="">Select User</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.fullname}</option>
                    ))}
                </select>
            </label>
            <label>
                Task Name:
                <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} required />
            </label>
            <label>
                Subtasks:
                <input type="text" value={subTasks} onChange={(e) => setSubTasks(e.target.value)} />
            </label>
            <label>
                Start Date:
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </label>
            <label>
                Estimated End Date:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
            <button type="submit">Create Task</button>
        </form>
    );
};

export default AddTaskForm;