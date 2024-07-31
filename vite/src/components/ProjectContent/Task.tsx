import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

const Task: React.FC<{
  task: {
    id: string;
    name: string;
    content: string;
    groupId: string;
  };
  index: number;
}> = ({ task, index }) => {

  console.log(task.id);
  return (
    <Draggable key={task.id} draggableId={"task-"+task.id} index={index} >
      {(provided) => (
        <div
          className="task"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <h4>{task.name}</h4>
          <p>{task.content}</p>
        </div>
      )}
    </Draggable>
  );
};

export default Task;
