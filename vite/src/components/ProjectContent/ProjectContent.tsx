import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Modal } from '@mantine/core';
import KanbanBoard from './KanbanBoard';
import ProjectMembers from './ProjectMember';
import './project.css';

const ProjectContent = () => {
  const { projectId } = useParams();
  const [opened, setOpened] = useState(false);

  const handleOpen = () => setOpened(true);
  const handleClose = () => setOpened(false);

  return (
    <div>
      <h1>Project Content for {projectId}</h1>
      <KanbanBoard projectId={projectId} />
      <Button onClick={handleOpen} style={{ marginTop: '20px' }}>
        Manage Project Members
      </Button>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Project Members"
        size="lg"
      >
        <ProjectMembers projectId={projectId} onSave={handleClose} />
      </Modal>
    </div>
  );
};

export default ProjectContent;
