// src/components/Home/Home.js
import React, { useEffect, lazy, Suspense, useState  } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, AppShell, Button, Stack, Loader, ActionIcon, Title, Select, Checkbox } from '@mantine/core';
import GridLayout from 'react-grid-layout';
import { openDrawer, closeDrawer } from './drawerSlice';
import { openWidgetSettings, closeWidgetSettings } from './widgetSettingsSlice';
import { addWidget, updateLayout, updateWidgetSetting, fetchWidgetSettings   } from './layoutSlice';
import classes from './Home.module.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { IconSettings } from '@tabler/icons-react';
import WidgetWrapper from './WidgetWrapper';
const ReactGridLayout = GridLayout.WidthProvider(GridLayout);

const availableWidgets = [
  {
    name: "Total Task Widget",
    component: './TotalTaskWidget',
    grid: {x: 0, y: 0, w: 6, h: 3},
    setting: {
      showTitle: { type: "boolean", value: false },
      backgroundColor: {
        type: "select",
        value: "red",
        options: [
          { value: "red", label: "Red" },
          { value: "blue", label: "Blue" },
        ],
      },
    },
  },
{
    name: "Team Task Widget",
    component: './TeamTaskWidget', // Lazy load the widget component
    grid: {x: 0, y: 0, w: 8, h: 8},
    setting: {
      showTitle: { type: "boolean", value: false },
      backgroundColor: {
        type: "select",
        value: "green",
        options: [
          { value: "green", label: "Green" },
          { value: "yellow", label: "Yellow" },
        ],
      },
    },
  },
];

export function Home() {
  const dispatch = useDispatch();
  const drawerIsOpen = useSelector((state) => state.drawer.isOpen);
  const widgetSettingsIsOpen = useSelector((state) => state.widgetSettings.isOpen);
  const selectedWidgetId = useSelector((state) => state.widgetSettings.selectedWidgetId);
  const [selectedWidgetSettings, setSelectedWidgetSettings] = useState(null); 
  const layout = useSelector((state) => state.layout.layout);
    const status = useSelector((state) => state.layout.status);

console.log('Home render');


useEffect(() => {
        if (status === 'idle') {
console.log("idle and Fetch setting");
            dispatch(fetchWidgetSettings ());
        }
console.log("use effect status");
console.log(status);

    }, [status]);

if (status === 'idle' || status === 'loading') {
        // Handle loading state
        return <div>Loading...</div>;
    }

if (!Array.isArray(layout)) {
        console.error('layout is not an array:', layout);
        return <div>Error: Invalid layout state</div>;
    }

  const handleAddWidget = (widget) => {
    dispatch(addWidget(widget));
    dispatch(closeDrawer());
  };

  const handleSettingsClick = (widgetId, settings) => {
    dispatch(openWidgetSettings({ widgetId, settings }));
setSelectedWidgetSettings(settings);
  };

  const handleWidgetSettingChange = (settingName, value) => {
    dispatch(updateWidgetSetting({ widgetId: selectedWidgetId, settingName, value }));

// Update local selectedWidgetSettings immediately
   setSelectedWidgetSettings((prevSettings) => {
      if (prevSettings) {
        return {
          ...prevSettings,
          [settingName]: {
            ...prevSettings[settingName],
            value: value,
          },
        };
      }
      return prevSettings;
    });
  };


// Handle layout changes
  const onLayoutChange = (newLayout) => {
if(status === "succeeded") {

    console.log("onLayoutChange"); // For debugging purposes
       console.log(newLayout); // For debugging purposes
      dispatch(updateLayout(newLayout));
       console.log(layout); // For debugging purposes
}

  };

  return (
    <AppShell className="h-screen" padding="md">
      <AppShell.Main>
        <div className="flex justify-end mb-4">
          <Button onClick={() => dispatch(openDrawer())}>Add Widget</Button>
        </div>
        <ReactGridLayout className={classes.grid} cols={12} rowHeight={30} width={1200}
            onLayoutChange={onLayoutChange}>
          {layout.map((item) => {
            const WidgetComponent = lazy(() => import(`${item.widget}`));

            return (
              <div key={item.i} data-grid={item.grid}>
                <WidgetWrapper id={item.i} settings={item.setting} onSettingsClick={handleSettingsClick}>
                <Suspense key={`${item.i}`}
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <Loader />
                    </div>
                  }
                >
                  <WidgetComponent settings={item.setting} />
                </Suspense>
                </WidgetWrapper>
              </div>
            );
          })}
        </ReactGridLayout>
      </AppShell.Main>

      <Drawer opened={drawerIsOpen} onClose={() => dispatch(closeDrawer())} size="md" position="right">
        <div className="p-4">
          <Stack>
            {availableWidgets.map((widget) => (
              <Button key={widget.name} onClick={() => handleAddWidget(widget)}>
                {widget.name}
              </Button>
            ))}
          </Stack>
        </div>
      </Drawer>

      <Drawer opened={widgetSettingsIsOpen} onClose={() => dispatch(closeWidgetSettings())} size="md" position="right">
        <div className="p-4">
          <Title order={4}>Settings</Title>
          <Stack>
            {Object.entries(selectedWidgetSettings || {}).map(([settingName, setting]) => (
              <div key={settingName}>
                {setting.type === "boolean" && (
                  <Checkbox
                    label={settingName}
                    checked={setting.value}
                    onChange={(event) => handleWidgetSettingChange(settingName, event.target.checked)}
                  />
                )}
                {setting.type === "select" && (
                  <Select
                    label={settingName}
                    value={setting.value}
                    data={setting.options}
                    onChange={(value) => handleWidgetSettingChange(settingName, value)}
                  />
                )}
              </div>
            ))}
          </Stack>
        </div>
      </Drawer>
    </AppShell>
  );
}
