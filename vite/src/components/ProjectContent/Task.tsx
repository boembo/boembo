import React from 'react';
import './KanbanBoard.css'; // Ensure you import the CSS file

const Task: React.FC<{
  task: {
    id: string;
    name: string;
    content: string;
    groupId: string;
  };
}> = ({ task }) => {
  return (
    <div className="task">
      <h4>{task.name}</h4>
      <p>{task.content}</p>
    </div>
  );
};

export default Task;
