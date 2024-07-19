import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { UnstyledButton, Tooltip, Title, rem, ActionIcon } from '@mantine/core';
import { IconHome2, IconGauge, IconDeviceDesktopAnalytics, IconFingerprint, IconCalendarStats, IconUser, IconSettings, IconPlus, IconPin } from '@tabler/icons-react';
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
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [pinnedProjects, setPinnedProjects] = useState<any[]>([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Get project ID from URL if applicable

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;

        if (Array.isArray(data.projects)) {
          const allProjects = data.projects;
          const pinned = allProjects.filter(project => project.Pinned); // Adjust based on your flag name
          const nonPinned = allProjects.filter(project => !project.Pinned); // Adjust based on your flag name

          setPinnedProjects(pinned);
          setProjects(nonPinned);
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
    // If accessing a project detail, make Home active and set the project as active
    if (id) {
      setActive('Home');
      setActiveLink(id);
    }
  }, [id]);

  const handleCreateProject = (newProject) => {
    setProjects((prevProjects) => {
      const updatedProjects = [...prevProjects, newProject];
      setActive(newProject.ID);
      navigate(`/project/${newProject.ID}`);
      return updatedProjects;
    });
    setShowCreateProject(false);
  };

  const handlePinProject = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/projects/pin', { project_id: projectId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedProject = response.data;

      setProjects((prevProjects) =>
        prevProjects.filter(project => project.ID !== updatedProject.ID)
      );
      setPinnedProjects((prevPinned) => [...prevPinned, updatedProject]);
    } catch (error) {
      console.error('Failed to pin project:', error);
    }
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
        onClick={() => {
          setActive(link.label);
          setShowCreateProject(false);
          if (link.label === 'Home') {
            navigate('/');
          }
        }}
        className={classes.mainLink}
        data-active={link.label === active || undefined}
      >
        <link.icon style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  ));

  const projectLinks = projects.map((project) => (
    <div className={classes.projectItem} key={project.ID}>
      <a
        className={classes.link}
        data-active={activeLink === project.ID || undefined}
        href="#"
        onClick={(event) => {
          event.preventDefault();
          setActiveLink(project.ID);
          navigate(`/project/${project.ID}`);
        }}
      >
        {project.Name}
      </a>
      <Tooltip label="Pin project" position="left" withArrow>
        <ActionIcon
          className={classes.pinButton}
          onClick={() => handlePinProject(project.ID)}
        >
          <IconPin size={rem(16)} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </div>
  ));

  const pinnedProjectLinks = pinnedProjects.map((project) => (
    <a
      className={classes.link}
      data-active={activeLink === project.ID || undefined}
      href="#"
      onClick={(event) => {
        event.preventDefault();
        setActiveLink(project.ID);
        navigate(`/project/${project.ID}`);
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
                  {pinnedProjects.length > 0 && (
                    <div className={classes.pinnedProjects}>
                      <Title order={6}>Pinned Projects</Title>
                      {pinnedProjectLinks}
                    </div>
                  )}
                  <div className={classes.projectList}>
                    {projects.length > 0 ? (
                      <>
                        {pinnedProjects.length > 0 && (
                          <Title order={6}>Other Projects</Title>
                        )}
                        {projectLinks}
                      </>
                    ) : (
                      <p>No projects available</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {active !== 'Home' && linksMockdata.map((link) => (
              <a
                className={classes.link}
                data-active={activeLink === link || undefined}
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setActiveLink(link);
                }}
                key={link}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
