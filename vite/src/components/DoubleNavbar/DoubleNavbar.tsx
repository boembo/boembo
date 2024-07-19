import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate for navigation
import { UnstyledButton, Tooltip, Title, rem } from '@mantine/core';
import {
  IconHome2,
  IconGauge,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconCalendarStats,
  IconUser,
  IconSettings,
  IconPlus
} from '@tabler/icons-react';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './DoubleNavbar.module.css';
import axios from 'axios';
import CreateProject from '../ProjectContent/CreateProject';

const mainLinksMockdata = [
  { icon: IconHome2, label: 'Home' },
  { icon: IconGauge, label: 'Dashboard' },
  { icon: IconDeviceDesktopAnalytics, label: 'Analytics' },
  { icon: IconCalendarStats, label: 'Releases' },
  { icon: IconUser, label: 'Account' },
  { icon: IconFingerprint, label: 'Security' },
  { icon: IconSettings, label: 'Settings' },
];

const linksMockdata = [
  'Security',
  'Settings',
  'Dashboard',
  'Releases',
  'Account',
  'Orders',
  'Clients',
  'Databases',
  'Pull Requests',
  'Open Issues',
  'Wiki pages',
];

export function DoubleNavbar() {
  const [active, setActive] = useState('Home');
  const [activeLink, setActiveLink] = useState<string | null>(null); // Track active link by ID
  const [projects, setProjects] = useState<any[]>([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;

        if (Array.isArray(data.projects)) {
          setProjects(data.projects); // Ensure projects is set to an array
        } else {
          console.error('Invalid projects data format:', data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    // Check if the current path is a project detail page
    if (location.pathname.startsWith('/project/')) {
      setActive('Home'); // Make Home active
      const projectId = location.pathname.split('/').pop();
      setActiveLink(projectId || null); // Set active link based on project ID
    }
  }, [location]);

  const handleCreateProject = (newProject) => {
    setProjects((prevProjects) => {
      const updatedProjects = [...prevProjects, newProject];
      setActive(newProject.ID); // Set the active project ID
      navigate(`/project/${newProject.ID}`); // Redirect to the new project
      return updatedProjects;
    });
    setShowCreateProject(false);
  };

  const handleMainLinkClick = (label) => {
    if (label === 'Home') {
      navigate('/'); // Navigate to home
    }
    setActive(label);
    setActiveLink(null); // Clear active link when changing main links
    setShowCreateProject(false); // Hide create project button for other links
  };

  const mainLinks = mainLinksMockdata.map((link) => (
    <Tooltip
      label={link.label}
      position="right"
      withArrow
      transitionProps={{ duration: 0 }}
      key={link.label}
    >
      <UnstyledButton
        onClick={() => handleMainLinkClick(link.label)}
        className={classes.mainLink}
        data-active={link.label === active || undefined}
      >
        <link.icon style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  ));

  const links = linksMockdata.map((link) => (
    <a
      className={classes.link}
      data-active={activeLink === link || undefined}
      href="#"
      onClick={(event) => {
        event.preventDefault();
        setActiveLink(link); // Set active based on the link
      }}
      key={link} // Ensure each link has a unique key
    >
      {link}
    </a>
  ));

  const projectLinks = projects.map((project) => (
    <a
      className={classes.link}
      data-active={activeLink === project.ID || undefined}
      href="#"
      onClick={(event) => {
        event.preventDefault();
        setActiveLink(project.ID); // Set active based on project ID
        navigate(`/project/${project.ID}`); // Redirect to the project page
      }}
      key={project.ID}
    >
      {project.Name}
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.wrapper}>
        <div className={classes.aside}>
          <div className={classes.logo}>
            <MantineLogo type="mark" size={30} />
          </div>
          {mainLinks}
        </div>
        <div className={classes.main}>
          <div className={classes.header}>
            <Title order={4} className={classes.title}>
              {active}
            </Title>
            {active === 'Home' && (
              <div className={classes.actions}>
                <Tooltip
                  label="Create New Project"
                  position="left"
                  withArrow
                  transitionProps={{ duration: 0 }}
                >
                  <UnstyledButton
                    onClick={() => setShowCreateProject(true)}
                    className={classes.createProjectButton}
                  >
                    <IconPlus style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
                  </UnstyledButton>
                </Tooltip>
                {showCreateProject && (
                  <CreateProject
                    onCreate={handleCreateProject}
                    onClose={() => setShowCreateProject(false)}
                    isOpen={showCreateProject}
                  />
                )}
                <div className={classes.projectsList}>
                  {projectLinks.length > 0 ? (
                    projectLinks
                  ) : (
                    <p>No projects available</p>
                  )}
                </div>
              </div>
            )}
            {active !== 'Home' && links}
          </div>
        </div>
      </div>
    </nav>
  );
}
