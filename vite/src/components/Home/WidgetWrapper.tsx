import React, { memo } from 'react';
import { ActionIcon, Title } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

const WidgetWrapper = React.memo(({ id, settings, onSettingsClick, children }) => {
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
});


export default memo(WidgetWrapper, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id && prevProps.settings === nextProps.settings;
});
