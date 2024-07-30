// DragDropContext.tsx
import React, { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { updateGroupOrderRequest } from './taskSaga';

const DragDropContext: React.FC<{
  children: ReactNode;
  projectId: string;
  groups: {
    id: string;
    name: string;
    tasks: {
      id: string;
      name: string;
      content: string;
      groupId: string;
    }[];
  }[];
}> = ({ children, projectId, groups }) => {
  const dispatch = useDispatch();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedGroupId = e.dataTransfer.getData('groupId');
    const targetGroupId = e.currentTarget.dataset.groupId;

    if (draggedGroupId && targetGroupId && draggedGroupId !== targetGroupId) {
      const newGroupOrder = [...groups];
      const draggedGroupIndex = newGroupOrder.findIndex(group => group.id === draggedGroupId);
      const targetGroupIndex = newGroupOrder.findIndex(group => group.id === targetGroupId);

      if (draggedGroupIndex > -1 && targetGroupIndex > -1) {
        const [draggedGroup] = newGroupOrder.splice(draggedGroupIndex, 1);
        newGroupOrder.splice(targetGroupIndex, 0, draggedGroup);
      }

      dispatch(updateGroupOrder(projectId, newGroupOrder));
    }
  };

  return (
    <div className="drag-drop-context" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      {children}
    </div>
  );
};

export default DragDropContext;
