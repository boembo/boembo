
import React, { useState } from 'react';

const TaskModal = ({ list, onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    onSave({ id: Date.now(), name, list });
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add Task</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleSubmit}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default TaskModal;
