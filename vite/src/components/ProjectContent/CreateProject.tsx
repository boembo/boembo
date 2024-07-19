import { useState } from 'react';
import { Modal, TextInput, Button } from '@mantine/core';
import axios from 'axios';

const CreateProject = ({ onCreate, onClose, isOpen }) => {
  const [projectName, setProjectName] = useState('');

  // Setup Axios interceptors to include the bearer token
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/projects/save', { name: projectName });
      onCreate(response.data); // Pass new project data to parent
      onClose(); // Close the modal after creating the project
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Create New Project">
      <TextInput
        label="Project Name"
        placeholder="Enter project name"
        value={projectName}
        onChange={(event) => setProjectName(event.currentTarget.value)}
      />
      <Button onClick={handleSave}>Save</Button>
    </Modal>
  );
};

export default CreateProject;
