import React, { useState } from 'react';

const TaskModal = ({ group, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (title && content) {
      onSave({ group, title, content });
    }
  };

  return (
    <div className="task-modal">
      <div className="task-modal-content">
        <h2>Add Task to {group}</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Task Content"
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default TaskModal;
