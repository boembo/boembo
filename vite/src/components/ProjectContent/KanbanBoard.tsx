// KanbanBoard.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasksRequest,
  createTaskRequest,
  updateTaskRequest,
} from './taskSlice'; // Ensure the import path is correct
import TaskModal from './TaskModal';

// Define TypeScript interfaces if needed
interface Task {
  id: string;
  name: string;
  list: string;
  // other fields if any
}

interface KanbanBoardProps {
  projectId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state: any) => state.tasks);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasksRequest({ projectId }));
    }
  }, [dispatch, projectId]);

  const handleAddTask = (task: Task) => {
    dispatch(createTaskRequest({ projectId, ...task }));
  };

  const handleDragStart = (task: Task) => {
    setCurrentTask(task);
  };

  const handleDrop = (list: string) => {
    if (currentTask) {
      dispatch(updateTaskRequest({ ...currentTask, list }));
      setCurrentTask(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const renderTasks = (list: string) =>
    Array.isArray(tasks) // Ensure tasks is an array
      ? tasks
          .filter((task: Task) => task.list === list)
          .map((task: Task) => (
            <div
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(task)}
              className="task"
            >
              {task.name}
            </div>
          ))
      : null;

  return (
    <div className="kanban-board">
      <div
        className="kanban-list"
        onDrop={() => handleDrop('todo')}
        onDragOver={(e) => e.preventDefault()}
      >
        <h3>To Do</h3>
        {renderTasks('todo')}
        <button onClick={() => setShowModal('todo')}>Add Task</button>
      </div>
      <div
        className="kanban-list"
        onDrop={() => handleDrop('in-progress')}
        onDragOver={(e) => e.preventDefault()}
      >
        <h3>In Progress</h3>
        {renderTasks('in-progress')}
        <button onClick={() => setShowModal('in-progress')}>Add Task</button>
      </div>
      <div
        className="kanban-list"
        onDrop={() => handleDrop('done')}
        onDragOver={(e) => e.preventDefault()}
      >
        <h3>Done</h3>
        {renderTasks('done')}
        <button onClick={() => setShowModal('done')}>Add Task</button>
      </div>

      {showModal && (
        <TaskModal
          list={showModal}
          onClose={() => setShowModal(null)}
          onSave={handleAddTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
