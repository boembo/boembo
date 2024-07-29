
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasksRequest, addTask, updateTask } from './taskSlice';
import TaskModal from './TaskModal';

const KanbanBoard = ({ projectId }) => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector(state => state.tasks);
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  useEffect(() => {
    dispatch(fetchTasksRequest(projectId));
  }, [dispatch, projectId]);

  const handleAddTask = (task) => {
    dispatch(addTask(task));
  };

  const handleDragStart = (task) => {
    setCurrentTask(task);
  };

  const handleDrop = (list) => {
    if (currentTask) {
      dispatch(updateTask({ ...currentTask, list }));
      setCurrentTask(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const renderTasks = (list) => tasks
    .filter(task => task.list === list)
    .map(task => (
      <div
        key={task.id}
        draggable
        onDragStart={() => handleDragStart(task)}
        className="task"
      >
        {task.name}
      </div>
    ));

  return (
    <div className="kanban-board">
      <div className="kanban-list" onDrop={() => handleDrop('todo')} onDragOver={(e) => e.preventDefault()}>
        <h3>To Do</h3>
        {renderTasks('todo')}
        <button onClick={() => setShowModal('todo')}>Add Task</button>
      </div>
      <div className="kanban-list" onDrop={() => handleDrop('in-progress')} onDragOver={(e) => e.preventDefault()}>
        <h3>In Progress</h3>
        {renderTasks('in-progress')}
        <button onClick={() => setShowModal('in-progress')}>Add Task</button>
      </div>
      <div className="kanban-list" onDrop={() => handleDrop('done')} onDragOver={(e) => e.preventDefault()}>
        <h3>Done</h3>
        {renderTasks('done')}
        <button onClick={() => setShowModal('done')}>Add Task</button>
      </div>

      {showModal && (
        <TaskModal
          list={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleAddTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
