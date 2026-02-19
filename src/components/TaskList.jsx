import React from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = ({ tasks, filter, onComplete, onDelete, onEdit, onUpdate }) => {
    const filteredTasks = tasks.filter(task => { // ... (lines 6-11)
        if (filter === 'all') return true;
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        return (
            <div className="empty-state">
                <p>No {filter} tasks found.</p>
                {filter === 'active' && <p>Enjoy your free time!</p>}
            </div>
        );
    }

    return (
        <div className="task-list">
            {filteredTasks.map((task, index) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onComplete={onComplete}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
};

export default TaskList;
