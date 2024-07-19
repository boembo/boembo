import React from 'react';
import { ActionIcon, Title } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

const WidgetWrapper = React.memo(({ id, onSettingsClick, children }) => {

console.log("widgetWrappper ID");
console.log(id);
  return (
    <div className="widget-wrapper h-full border border-gray-200 rounded-md">
      <div className="flex justify-between items-center bg-gray-100 p-2">
        <Title order={4}>{id}</Title>
        <ActionIcon variant="default" aria-label="Settings" onMouseDown={() => onSettingsClick(id)}>
          <IconSettings />
        </ActionIcon>
      </div>
      <div className="widget-content p-2">
        {children}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});

export default WidgetWrapper;
