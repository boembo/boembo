import React, { useState } from 'react';
import Task from './Task';
import { useDispatch } from 'react-redux';
import { createTaskRequest } from './taskSlice';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import './KanbanBoard.css'; // Ensure you import the CSS file

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
  index: number;
}> = ({ group, projectId, index }) => {
  const dispatch = useDispatch();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskContent, setTaskContent] = useState('');

  const handleCreateTask = () => {
    if (taskName.trim() === '') return; // Prevent creating tasks with empty name

    dispatch(createTaskRequest({ projectId, task: { Title: taskName, Description: taskContent, GroupID: group.id, ProjectID: projectId } }));
    setTaskName('');
    setTaskContent('');
    setIsAddingTask(false); // Hide form after creation
  };

  return (
    <Draggable draggableId={"group-"+group.id}  index={index} >
      {(provided) => (
        <div
          className="group"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div {...provided.dragHandleProps}>
          <h3>{group.name}</h3>
          </div>
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

          <Droppable droppableId={group.id} type="task">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.draggableProps} className="tasks">
                {Array.isArray(group.tasks) && group.tasks.map((task, index) => (
                  <Task key={task.id} task={task} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

export default Group;
