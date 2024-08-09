import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PillsInput, Pill, Combobox, CheckIcon, Group, Button, useCombobox } from '@mantine/core';
import { fetchProjectMembersRequest, fetchAllUsersRequest, syncMembersRequest } from './projectSlice';

const ProjectMembers = ({ projectId, onSave }) => {
  const dispatch = useDispatch();
  const { members = [], allUsers = [], loading, error } = useSelector((state) => state.project);
  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    dispatch(fetchProjectMembersRequest(projectId));
    dispatch(fetchAllUsersRequest());
  }, [dispatch, projectId]);

  useEffect(() => {
    if (Array.isArray(allUsers)) {
      const membersArray = Array.isArray(members) ? members : [];
      const usersById = allUsers.reduce((acc, user) => {
        acc[user.ID] = user;
        return acc;
      }, {});

      const detailedMembers = membersArray
        .map((member) => usersById[member.UserID])
        .filter((user) => user != null);

      setSelectedMembers(detailedMembers);
    } else {
      console.error("Expected `allUsers` to be an array, but received:", allUsers);
    }
  }, [members, allUsers]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleMemberSelect = (user) => {
    setSelectedMembers((current) =>
      current.some((member) => member.ID === user.ID)
        ? current.filter((member) => member.ID !== user.ID)
        : [...current, user]
    );
  };

  const handleMemberRemove = (user) => {
    setSelectedMembers((current) => current.filter((member) => member.ID !== user.ID));
  };

  const handleSave = () => {
    if (Array.isArray(selectedMembers) && selectedMembers.length > 0) {
      dispatch(syncMembersRequest({ projectId, memberIds: selectedMembers.map((member) => member.ID) }))
        .then(() => {
          onSave();  // Ensure this is called to close the modal
        })
        .catch((error) => {
          console.error("Failed to save members:", error);
        });
    }
  };

  const selectedPills = selectedMembers.map((member) => (
    <Pill key={member.ID} withRemoveButton onRemove={() => handleMemberRemove(member)}>
      {member.Name}
    </Pill>
  ));

  const options = allUsers
    .filter((user) => user.Name.toLowerCase().includes(search.toLowerCase()))
    .map((user) => (
      <Combobox.Option
        key={user.ID}
        value={user}
        active={selectedMembers.some((member) => member.ID === user.ID)}
      >
        <Group gap="sm">
          {selectedMembers.some((member) => member.ID === user.ID) && <CheckIcon size={12} />}
          <span>{user.Name}</span>
        </Group>
      </Combobox.Option>
    ));

  return (
    <div>
      <h3>Project Members</h3>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <Combobox store={combobox} onOptionSubmit={handleMemberSelect}>
        <Combobox.DropdownTarget>
          <PillsInput
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
          >
            <Pill.Group>
              {selectedPills}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  value={search}
                  placeholder="Search members"
                  onChange={(event) => {
                    setSearch(event.currentTarget.value);
                    combobox.updateSelectedOptionIndex();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && search.length === 0) {
                      event.preventDefault();
                      handleMemberRemove(selectedMembers[selectedMembers.length - 1]);
                    }
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>
        <Combobox.Dropdown>
          <Combobox.Options>
            {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
};

export default ProjectMembers;
