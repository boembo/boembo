import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectContent = () => {
  const { projectId } = useParams();

  return (
    <div>
      <h1>Project Content for {projectId}</h1>
      {/* Temporary blank content */}
    </div>
  );
};

export default ProjectContent;
