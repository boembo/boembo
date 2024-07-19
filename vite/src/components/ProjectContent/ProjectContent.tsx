import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectContent = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Project Content for {id}</h1>
      {/* Temporary blank content */}
    </div>
  );
};

export default ProjectContent;
