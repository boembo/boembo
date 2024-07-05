import React, { useState, lazy, Suspense,useRef  } from 'react';
import { Drawer, AppShell, Button, Stack, Loader, ActionIcon, Title, Select, Checkbox  } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import GridLayout from 'react-grid-layout';
import RGL, { WidthProvider } from "react-grid-layout";
import classes from './Home.module.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { IconAdjustments, IconSettings } from '@tabler/icons-react';
import SimpleWidget from './SimpleWidget'; // Example available widget


import { useDispatch, useSelector } from 'react-redux';
import { openDrawer, closeDrawer } from './drawerSlice';

const ReactGridLayout = WidthProvider(GridLayout);

export function Home() {
const dispatch = useDispatch();
    const drawerIsOpen = useSelector((state) => state.drawer.isOpen);

    const initLayout = [
    {
      i: "TotalTaskWidget100",
      widget: "./TotalTaskWidget",
      grid: { x: 0, y: 0, w: 6, h: 4 },
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
      i: "TotalTaskWidget1002",
      widget: "./TotalTaskWidget",
      grid: { x: 1, y: 0, w: 6, h: 4 },
      setting: {
        showTitle: { type: "boolean", value: true },
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
  ];

const [allComponentSettings, setAllComponentSettings] = useState(initLayout.reduce((acc, item) => ({...acc, [item.i]: item.setting}),{}));
  const [layout, setLayout] = useState(initLayout); // Start with an empty layout
  const [count, setCount] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
const [settingsOpened, { open: openSettings, close: closeSettings }] =
    useDisclosure(false);
const [selectedWidgetId, setSelectedWidgetId] = useState(null);
const [selectedWidgetSettings, setSelectedWidgetSettings] = useState(null);

  const widgetRefs = useRef({});
  const availableWidgets = [
    { name: "Total Task Widget", component: './TotalTaskWidget',setting: {
        showTitle: { type: "boolean", value: false },
        backgroundColor: {
          type: "select",
          value: "red",
          options: [
            { value: "red", label: "Red" },
            { value: "blue", label: "Blue" },
          ],
        },
      }, },

    { name: "Simple Widget", component: './SimpleWidget' },
  ];

 let newModule;

  const addGridItem = async (widget) => {
    console.log(widget);
    try {
         newModule = { i: widget.name+count, widget: widget.component, grid: {x: 0, y: 0, w: 6, h: 3}, setting: widget.setting },

        setLayout(prev => [ newModule, ...prev  ]);
        setCount(count+1);
         dispatch(closeDrawer());
   
    } catch (error) {
      console.error("Error importing widget:", error);
    }
  };

    const handleSettingsClick = (event, widgetId, settings) => {

setSelectedWidgetSettings(settings);
setSelectedWidgetId(widgetId);
    openSettings();
  };

const handleWidgetSettingChange = (settingName, value) => {
    setAllComponentSettings((prevSettings) => {
      const updatedSettings = {
        ...prevSettings,
        [selectedWidgetId]: {
          ...prevSettings[selectedWidgetId],
          [settingName]: { ...prevSettings[selectedWidgetId][settingName], value },
        },
      };

      setSelectedWidgetSettings(updatedSettings[selectedWidgetId]);
      return updatedSettings;
    });
  };

const openSetting = (currentSetting) => {
    console.log("handlwWidgetChange");
console.log(settingName);
console.log(value);
console.log("selectedWidgetId");
console.log(selectedWidgetId);
console.log(widgetRefs.current);
    if (widgetRefs.current[selectedWidgetId]) {
   console.log("found");
      widgetRefs.current[selectedWidgetId].onSettingChange(settingName, value);
    }
  };

  return (
    <AppShell className="h-screen" padding="md">
      <AppShell.Main>
        <div className="flex justify-end mb-4">
          <Button onClick={() => dispatch(openDrawer())}>Add Widget</Button>
        </div>
        <ReactGridLayout
          className={classes.grid}
          cols={12}
          rowHeight={30}
           width={1200}

        >
        {layout.map((item) => {
            const widgetName = item.i;
            const WidgetComponent = React.lazy(() => import(item.widget));;

            return (
            <div key={item.i} data-grid={ item.grid }  >
                <div className="bg-gray-200 p-2 flex justify-between items-center"> {/* Header */}
                  <Title order={4}>{widgetName}</Title>
                  <ActionIcon variant="default" aria-label="Settings"  onMouseDown={(e) => handleSettingsClick(e, item.i, item.setting)}>
                        <IconSettings  />
                      </ActionIcon>
                </div>
              <Suspense key={item.i} 
                fallback={
                    <div className="flex items-center justify-center h-full">
                      <Loader /> {/* Use Mantine's Loader component */}
                    </div>
                  }
                >
                {WidgetComponent && (
                      <WidgetComponent settings={allComponentSettings[item.i]} className={classes.item} openSetting={openSetting} ref={widgetRefs.current[item.i]} />
                )}
              </Suspense>
                </div>
            );
          })}

        </ReactGridLayout>
      </AppShell.Main>

      <Drawer  opened={drawerIsOpen} onClose={() => dispatch(closeDrawer())}  size="md" position="right">
        <div className="p-4">
          <Stack>
            {availableWidgets.map((widget) => (
              <Button key={widget.name} onClick={() => addGridItem(widget)}>
                {widget.name}
              </Button>
            ))}
          </Stack>
        </div>
      </Drawer>

    <Drawer opened={settingsOpened} onClose={closeSettings} size="md" position="right">
        <div className="p-4">
<Title order={4}>Settings</Title>
         
          <Stack>
                {Object.entries(selectedWidgetSettings || {}).map(
                  ([settingName, setting]) => (
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
                          onChange={(value) => handleWidgetSettingChange(settingName, value)}
                          data={setting.options}
                        />
                      )}
                    </div>
                  )
                )}
              </Stack>
        </div>
      </Drawer>
    </AppShell>
  );
}
