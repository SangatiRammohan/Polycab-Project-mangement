import React, { useState, useEffect } from 'react';
import { fetchUsers, addTask, editTask, deleteTask, AllTasks } from '../api/taskApi';
import './TaskManagement.css';
import locationData from './locationData';

const TaskManagement = () => {
    const [tasks, setTasks]               = useState([]);
    const [users, setUsers]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const emptyTask = {
        title:'', subtasks:'', milestone:'', assigned_to:'',
        state:'', business_area:'', district:'', block:'',
        start_date:'', estimated_end_date:'', status:'nil',
    };
    const [newTask, setNewTask]         = useState(emptyTask);
    const [editingTask, setEditingTask] = useState({ id: null, ...emptyTask });

    const milestoneMapping = {
        'Desktop Survey Design':'desktop_survey_design',
        'Network Health Checkup':'network_health_checkup',
        'HOTO-Existing':'hoto_existing',
        'Detailed Design':'detailed_design',
        'ROW (Right of Way)':'row',
        'IFC (Issued for Construction)':'ifc',
        'IC (Initial Construction)':'ic',
        'As-Built':'as_built',
        'HOTO (Final)':'hoto_final',
        'Field Survey':'field_survey',
    };
    const reverseMilestoneMapping = Object.fromEntries(Object.entries(milestoneMapping).map(([k,v])=>[v,k]));
    const statusDisplay = { nil:'Nil', in_progress:'In Progress', completed:'Completed' };

    const fmt    = d => d ? new Date(d).toLocaleDateString() : '';
    const fmtInp = d => { if(!d) return ''; return new Date(d).toISOString().split('T')[0]; };
    const name   = v => reverseMilestoneMapping[v] || v;
    const val    = n => milestoneMapping[n] || n;

    const getBAs    = s  => s && locationData[s] ? locationData[s]?.businessAreas||[] : [];
    const getDists  = (s,b) => locationData[s]?.[b]?.districts||[];
    const getBlocks = (s,b,d) => locationData[s]?.[b]?.[d]||[];

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [t, u] = await Promise.all([AllTasks(), fetchUsers()]);
                setTasks(Array.isArray(t) ? t.map(task=>({
                    ...task,
                    milestone_name: name(task.milestone),
                    status_display: statusDisplay[task.status]||task.status,
                    start_date_display: fmt(task.start_date),
                    end_date_display:   fmt(task.estimated_end_date),
                })) : []);
                setUsers(Array.isArray(u) ? u : []);
            } catch(e){ setError(e.message); }
            finally  { setLoading(false); }
        })();
    }, []);

    const onChange = setter => e => {
        const {name:n, value:v} = e.target;
        setter(prev => {
            const u = {...prev, [n]:v};
            if(n==='state')        { u.business_area=''; u.district=''; u.block=''; }
            else if(n==='business_area') { u.district=''; u.block=''; }
            else if(n==='district')      { u.block=''; }
            else if(n==='assignedTo') {
                const usr = users.find(x=>x.username===v||x.full_name===v);
                u.assigned_to = usr ? usr.id : '';
            }
            return u;
        });
    };

    const handleAdd = async e => {
        e.preventDefault();
        try {
            if(!newTask.milestone){ alert('Please select a milestone'); return; }
            const data = { ...newTask, milestone: val(newTask.milestone) };
            const res  = await addTask(data);
            const added = res.data||res;
            setTasks(p=>[...p, {
                ...added,
                milestone_name: name(added.milestone),
                status_display: statusDisplay[added.status]||added.status,
                start_date_display: fmt(added.start_date),
                end_date_display:   fmt(added.estimated_end_date),
            }]);
            setNewTask(emptyTask); setShowAddModal(false);
            alert('Task created successfully');
        } catch(e){ alert(`Failed to add task: ${e.message}`); }
    };

    const openEdit = id => {
        const t = tasks.find(x=>x.id===id);
        if(!t){ alert('Task not found'); return; }
        setEditingTask({
            id:t.id, title:t.title||'', subtasks:t.subtasks||'',
            milestone:name(t.milestone)||'', assigned_to:t.assigned_to||'',
            state:t.state||'', business_area:t.business_area||'',
            district:t.district||'', block:t.block||'',
            start_date:fmtInp(t.start_date),
            estimated_end_date:fmtInp(t.estimated_end_date),
            status:t.status||'nil',
        });
        setShowEditModal(true);
    };

    const handleUpdate = async e => {
        e.preventDefault();
        try {
            if(!editingTask.id){ alert('Invalid task ID'); return; }
            const data = { ...editingTask, milestone: val(editingTask.milestone) };
            const res  = await editTask(editingTask.id, data);
            const updated = res.data||res;
            const formatted = {
                ...updated,
                milestone_name: name(updated.milestone),
                status_display: statusDisplay[updated.status]||updated.status,
                start_date_display: fmt(updated.start_date),
                end_date_display:   fmt(updated.estimated_end_date),
            };
            setTasks(p=>p.map(t=>t.id===editingTask.id?formatted:t));
            setShowEditModal(false); alert('Task updated successfully');
        } catch(e){ alert(`Failed to update task: ${e.message}`); }
    };

    const handleDelete = async id => {
        if(!window.confirm('Delete this task?')) return;
        try { await deleteTask(id); setTasks(p=>p.filter(t=>t.id!==id)); }
        catch(e){ alert(`Failed to delete task: ${e.message}`); }
    };

    const getUserName = id =>
        users.find(u=>u.id===id)?.full_name ||
        users.find(u=>u.id===id)?.username  || 'Unassigned';

    if(loading) return <div className="loading">Loading...</div>;
    if(error)   return <div className="error">Error: {error}</div>;

    const TaskForm = ({ task, setter, onSubmit, submitLabel }) => (
        <form onSubmit={onSubmit}>
            <div className="form-group">
                <div>
                    <label>State</label>
                    <select className="form-control" name="state" value={task.state} onChange={onChange(setter)} required>
                        <option value="">Select State</option>
                        {locationData.states?.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label>Business Area</label>
                    <select className="form-control" name="business_area" value={task.business_area} onChange={onChange(setter)} required disabled={!task.state}>
                        <option value="">Select Business Area</option>
                        {getBAs(task.state).map(a=><option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div>
                    <label>District</label>
                    <select className="form-control" name="district" value={task.district} onChange={onChange(setter)} required disabled={!task.business_area}>
                        <option value="">Select District</option>
                        {getDists(task.state, task.business_area).map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>
            <div className="form-group">
                <div>
                    <label>Block</label>
                    <select className="form-control" name="block" value={task.block} onChange={onChange(setter)} required disabled={!task.district}>
                        <option value="">Select Block</option>
                        {getBlocks(task.state, task.business_area, task.district).map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label>Milestone</label>
                    <select className="form-control" name="milestone" value={task.milestone} onChange={onChange(setter)} required>
                        <option value="">Select Milestone</option>
                        {Object.keys(milestoneMapping).map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label>Assign To</label>
                    <select className="form-control" name="assignedTo"
                        value={users.find(u=>u.id===task.assigned_to)?.username||''}
                        onChange={onChange(setter)} required>
                        <option value="">Select User</option>
                        {users.map(u=><option key={u.id} value={u.username||u.full_name}>{u.full_name||u.username}</option>)}
                    </select>
                </div>
            </div>
            <div className="form-group">
                <div>
                    <label>Task Name</label>
                    <input type="text" className="form-control" name="title" value={task.title} onChange={onChange(setter)} placeholder="Enter Task Name" required />
                </div>
            </div>
            <div className="form-group">
                <div>
                    <label>Subtasks</label>
                    <textarea className="form-control textarea-control" name="subtasks" value={task.subtasks} onChange={onChange(setter)} placeholder="Enter Subtasks" />
                </div>
            </div>
            <div className="form-group">
                <div>
                    <label>Start Date</label>
                    <input type="date" className="form-control" name="start_date" value={task.start_date} onChange={onChange(setter)} required />
                </div>
                <div>
                    <label>Estimated End Date</label>
                    <input type="date" className="form-control" name="estimated_end_date" value={task.estimated_end_date} onChange={onChange(setter)} required />
                </div>
            </div>
            {task.id && (
                <div className="form-group">
                    <div>
                        <label>Status</label>
                        <select className="form-control" name="status" value={task.status} onChange={onChange(setter)} required>
                            <option value="nil">Nil</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            )}
            <div className="modal-footer">
                <button type="submit" className="btn btn-primary">{submitLabel}</button>
            </div>
        </form>
    );

    return (
        <div className="task-management-container">
            <div className="header">
                <h1>Task Management</h1>
                <button className="btn btn-primary btn-add" onClick={()=>{ setNewTask(emptyTask); setShowAddModal(true); }}>
                    + Add Task
                </button>
            </div>

            {/* ── TABLE view: laptop & above ── */}
            <div className="table-view">
                <table className="task-table">
                    <thead>
                        <tr>
                            <th>S.No</th><th>Task Name</th><th>Subtasks</th>
                            <th>Milestone</th><th>Assigned To</th><th>State</th>
                            <th>Business Area</th><th>District</th><th>Block</th>
                            <th>Start Date</th><th>End Date</th><th>Status</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length===0 ? (
                            <tr><td colSpan="13" style={{textAlign:'center',padding:'30px',color:'#666'}}>No tasks available</td></tr>
                        ) : tasks.map((task,i)=>(
                            <tr key={task.id||i}>
                                <td>{i+1}</td>
                                <td>{task.title}</td>
                                <td>{task.subtasks||'—'}</td>
                                <td>{task.milestone_name||name(task.milestone)}</td>
                                <td>{getUserName(task.assigned_to)}</td>
                                <td>{task.state}</td>
                                <td>{task.business_area}</td>
                                <td>{task.district}</td>
                                <td>{task.block}</td>
                                <td>{task.start_date_display||fmt(task.start_date)}</td>
                                <td>{task.end_date_display||fmt(task.estimated_end_date)}</td>
                                <td>
                                    <span className={`status-badge status-${task.status}`}>
                                        {task.status_display||statusDisplay[task.status]||task.status}
                                    </span>
                                </td>
                                <td className="action-buttons">
                                    <button className="btn btn-warning btn-sm" onClick={()=>openEdit(task.id)}>Update</button>
                                    <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(task.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── CARDS view: tablet & mobile ── */}
            <div className="cards-view">
                {tasks.length===0 ? (
                    <p style={{textAlign:'center',color:'#666',padding:'30px'}}>No tasks available</p>
                ) : tasks.map((task,i)=>(
                    <div className="task-card" key={task.id||i}>
                        <div className="task-card-header">#{i+1} — {task.title}</div>
                        <div className="task-card-body">
                            <div className="task-card-row"><span className="task-card-label">Milestone</span><span className="task-card-value">{task.milestone_name||name(task.milestone)}</span></div>
                            <div className="task-card-row"><span className="task-card-label">Assigned To</span><span className="task-card-value">{getUserName(task.assigned_to)}</span></div>
                            <div className="task-card-row"><span className="task-card-label">State</span><span className="task-card-value">{task.state}</span></div>
                            <div className="task-card-row"><span className="task-card-label">Business Area</span><span className="task-card-value">{task.business_area}</span></div>
                            <div className="task-card-row"><span className="task-card-label">District</span><span className="task-card-value">{task.district}</span></div>
                            <div className="task-card-row"><span className="task-card-label">Block</span><span className="task-card-value">{task.block}</span></div>
                            <div className="task-card-row"><span className="task-card-label">Start Date</span><span className="task-card-value">{task.start_date_display||fmt(task.start_date)}</span></div>
                            <div className="task-card-row"><span className="task-card-label">End Date</span><span className="task-card-value">{task.end_date_display||fmt(task.estimated_end_date)}</span></div>
                            <div className="task-card-row">
                                <span className="task-card-label">Status</span>
                                <span className={`status-badge status-${task.status}`}>{task.status_display||statusDisplay[task.status]||task.status}</span>
                            </div>
                            {task.subtasks && <div className="task-card-row"><span className="task-card-label">Subtasks</span><span className="task-card-value">{task.subtasks}</span></div>}
                        </div>
                        <div className="task-card-actions">
                            <button className="btn btn-warning btn-sm" onClick={()=>openEdit(task.id)}>Update</button>
                            <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(task.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Add Modal ── */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="back-btn" onClick={()=>setShowAddModal(false)}>←</button>
                            <h2>Add New Task</h2>
                            <p>All fields are required</p>
                        </div>
                        <TaskForm task={newTask} setter={setNewTask} onSubmit={handleAdd} submitLabel="Create Task" />
                    </div>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="back-btn" onClick={()=>setShowEditModal(false)}>←</button>
                            <h2>Edit Task</h2>
                            <p>Update task details</p>
                        </div>
                        <TaskForm task={editingTask} setter={setEditingTask} onSubmit={handleUpdate} submitLabel="Update Task" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManagement;