// KanbanBoard.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasksRequest, updateGroupOrderRequest } from './taskSlice';
import Group from './Group';
import DragDropContext from './DragDropContext';

const KanbanBoard: React.FC<{ projectId: string }> = ({ projectId }) => {
  const dispatch = useDispatch();
  const { tasks, groups, loading, error } = useSelector((state: any) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasksRequest(projectId));
  }, [dispatch, projectId]);

  const handleGroupOrderChange = (newGroupOrder: any[]) => {
    dispatch(updateGroupOrderRequest({ projectId, groups: newGroupOrder }));
  };

  return (
    <DragDropContext projectId={projectId} groups={groups}>
      <div className="kanban-board">
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {Array.isArray(groups) &&  groups.map((group: any) => (
          <Group key={group.id} group={group} projectId={projectId} />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
