import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasksRequest, updateGroupOrderRequest, updateTaskRequest } from './taskSlice';
import Group from './Group';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

const KanbanBoard: React.FC<{ projectId: string }> = ({ projectId }) => {
  const dispatch = useDispatch();
  const { tasks, groups, loading, error } = useSelector((state: any) => state.tasks);

  
 useEffect(() => {
    // Create a new WebSocket connection
    const socket = new WebSocket('ws://localhost:8080/ws');

    // Event listener for when the connection is opened
    socket.addEventListener('open', (event) => {
      console.log('Connection established');
      socket.send('Connection established');
    });

    // Event listener for when a message is received
    socket.addEventListener('message', (event) => {
      try {
        const updatedTask = JSON.parse(event.data);
        // Handle the updated task here, e.g., dispatch an action to update the state
        dispatch(fetchTasksRequest(projectId));
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      socket.close();
    };
  }, [dispatch, projectId]);


  useEffect(() => {
    dispatch(fetchTasksRequest(projectId));
  }, [dispatch, projectId]);

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === 'group') {
      const newGroupOrder = Array.from(groups);
      const [movedGroup] = newGroupOrder.splice(source.index, 1);
      newGroupOrder.splice(destination.index, 0, movedGroup);

      dispatch(updateGroupOrderRequest({ projectId, groups: newGroupOrder }));
      return;
    }

    const sourceGroup = groups.find((group: any) => group.id === source.droppableId);
    const destinationGroup = groups.find((group: any) => group.id === destination.droppableId);

    const newSourceTasks = Array.from(sourceGroup.tasks);
    const [movedTask] = newSourceTasks.splice(source.index, 1);

    if (sourceGroup.id === destinationGroup.id) {
      newSourceTasks.splice(destination.index, 0, movedTask);
      const newGroup = { ...sourceGroup, tasks: newSourceTasks };
      const newGroups = groups.map((group: any) => (group.id === newGroup.id ? newGroup : group));

      dispatch(updateGroupOrderRequest({ projectId, groups: newGroups }));
    } else {
      const newDestinationTasks = Array.from(destinationGroup.tasks);
      newDestinationTasks.splice(destination.index, 0, movedTask);

      const newSourceGroup = { ...sourceGroup, tasks: newSourceTasks };
      const newDestinationGroup = { ...destinationGroup, tasks: newDestinationTasks };

      const newGroups = groups.map((group: any) => {
        if (group.id === newSourceGroup.id) return newSourceGroup;
        if (group.id === newDestinationGroup.id) return newDestinationGroup;
        return group;
      });

      dispatch(updateGroupOrderRequest({ projectId, groups: newGroups }));
      //dispatch(updateTaskRequest({ ...movedTask, groupId: destinationGroup.id }));
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="all-groups" direction="horizontal" type="group">
        {(provided) => (
          <div
            className="kanban-board"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {Array.isArray(groups) && groups.map((group: any, index: number) => (
              <Group key={group.id} group={group} projectId={projectId} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default KanbanBoard;
