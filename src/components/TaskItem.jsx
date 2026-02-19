import React from 'react';
import { Trash2, Edit2, Calendar, Flag } from 'lucide-react';
import { format } from 'date-fns';
import './TaskItem.css';
import './Subtasks.css';

const TaskItem = ({ task, index, onComplete, onDelete, onEdit, onUpdate }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [newSubtask, setNewSubtask] = React.useState('');

    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(st => st.completed).length;
    const totalSubtasks = subtasks.length;
    const progress = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'var(--danger)';
            case 'medium': return 'var(--warning)';
            case 'low': return 'var(--success)';
            default: return 'var(--text-muted)';
        }
    };

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        const newSt = {
            id: Date.now(),
            title: newSubtask,
            completed: false
        };

        onUpdate(task.id, { subtasks: [...subtasks, newSt] });
        setNewSubtask('');
    };

    const toggleSubtask = (subtaskId) => {
        const updatedSubtasks = subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        onUpdate(task.id, { subtasks: updatedSubtasks });
    };

    const deleteSubtask = (subtaskId) => {
        const updatedSubtasks = subtasks.filter(st => st.id !== subtaskId);
        onUpdate(task.id, { subtasks: updatedSubtasks });
    };

    return (
        <div
            className={`task-card-wrapper ${isExpanded ? 'expanded' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className={`task-item ${task.completed ? 'completed' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
                <div className="task-left">
                    <div className="checkbox-container" onClick={(e) => { e.stopPropagation(); }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => onComplete(task.id)}
                            />
                            <span className="checkmark"></span>
                        </label>
                    </div>

                    <div className="task-content">
                        <span className="task-title">{task.title}</span>
                        <div className="task-meta">
                            <span className="meta-item">
                                <Calendar size={14} />
                                {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No Date'}
                            </span>
                            <span className="meta-item" style={{ color: getPriorityColor(task.priority) }}>
                                <Flag size={14} />
                                {task.priority || 'Normal'}
                            </span>
                            {totalSubtasks > 0 && (
                                <span className="meta-item subtask-badge">
                                    {completedSubtasks}/{totalSubtasks}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="task-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onEdit(task)} className="action-btn edit" title="Edit">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="action-btn delete" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Subtasks Section */}
            {isExpanded && (
                <div className="subtasks-section animate-fade-in">
                    <div className="subtasks-list">
                        {subtasks.map(st => (
                            <div key={st.id} className={`subtask-item ${st.completed ? 'completed' : ''}`}>
                                <div className="subtask-left" onClick={() => toggleSubtask(st.id)}>
                                    <div className={`subtask-check ${st.completed ? 'checked' : ''}`}></div>
                                    <span className="subtask-text">{st.title}</span>
                                </div>
                                <button className="subtask-delete" onClick={() => deleteSubtask(st.id)}>
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddSubtask} className="add-subtask-form">
                        <input
                            type="text"
                            placeholder="Add a subtask..."
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button type="submit" onClick={(e) => e.stopPropagation()}>
                            +
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TaskItem;
