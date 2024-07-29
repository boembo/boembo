import React from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from './KanbanBoard';
import './project.css'

const ProjectContent = () => {
  const { projectId } = useParams();

  return (
    <div>
      <h1>Project Content for {projectId}</h1>
      <KanbanBoard projectId={projectId} />
    </div>
  );
};

export default ProjectContent;
