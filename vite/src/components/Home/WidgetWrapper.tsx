import React from 'react';
import { ActionIcon, Title } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

const WidgetWrapper = React.memo(({ id, settings, onSettingsClick, children }) => {

console.log("widgetWrappper setting");
console.log(id);
console.log(settings);
  return (
    <div className="widget-wrapper h-full border border-gray-200 rounded-md">
      <div className="flex justify-between items-center bg-gray-100 p-2">
        <Title order={4}>{id}</Title>
        <ActionIcon variant="default" aria-label="Settings" onMouseDown={() => onSettingsClick(id, settings)}>
          <IconSettings />
        </ActionIcon>
      </div>
      <div className="widget-content p-2">
        {children}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.settings === nextProps.settings;
});

export default WidgetWrapper;
