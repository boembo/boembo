import React, { useState } from 'react';
import Task from './Task';
import { useDispatch } from 'react-redux';
import { createTaskRequest } from './taskSlice';

const Group: React.FC<{
  group: {
    id: string;
    name: string;
    tasks: {
      id: string;
      name: string;
      content: string;
      groupId: string;
    }[];
  };
  projectId: string;
}> = ({ group, projectId }) => {
  const dispatch = useDispatch();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskContent, setTaskContent] = useState('');

  const handleCreateTask = () => {
    if (taskName.trim() === '') return; // Prevent creating tasks with empty name

    dispatch(createTaskRequest({ projectId, task: { title: taskName, description: taskContent, group_id: group.id, project_id: projectId } }));
    setTaskName('');
    setTaskContent('');
    setIsAddingTask(false); // Hide form after creation
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, groupId: string) => {
    e.dataTransfer.setData('groupId', groupId);
  };

  return (
    <div
      className="group"
      draggable
      onDragStart={(e) => handleDragStart(e, group.id)}
      data-group-id={group.id}
    >
      <h3>{group.name}</h3>
      <button onClick={() => setIsAddingTask(!isAddingTask)}>
        {isAddingTask ? 'Cancel' : '+ Add Task'}
      </button>

      {isAddingTask && (
        <div className="task-form">
          <input
            type="text"
            placeholder="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <textarea
            placeholder="Task Content"
            value={taskContent}
            onChange={(e) => setTaskContent(e.target.value)}
          />
          <button onClick={handleCreateTask}>Save Task</button>
        </div>
      )}

      {Array.isArray(group.tasks) && group.tasks.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </div>
  );
};

export default Group;
