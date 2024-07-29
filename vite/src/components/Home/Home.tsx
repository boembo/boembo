import React, { useEffect, lazy, Suspense, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, AppShell, Button, Stack, Loader, Title, Select, Checkbox } from '@mantine/core';
import GridLayout from 'react-grid-layout';
import { openDrawer, closeDrawer } from './drawerSlice';
import { openWidgetSettings, closeWidgetSettings } from './widgetSettingsSlice';
import { addWidget, updateLayout, updateWidgetSetting, fetchWidgetSettings } from './layoutSlice';
import classes from './Home.module.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetWrapper from './WidgetWrapper';

const ReactGridLayout = GridLayout.WidthProvider(GridLayout);

export function Home() {
  const dispatch = useDispatch();
  const drawerIsOpen = useSelector((state) => state.drawer.isOpen);
  const widgetSettingsIsOpen = useSelector((state) => state.widgetSettings.isOpen);
  const selectedWidgetId = useSelector((state) => state.widgetSettings.selectedWidgetId);
  const layout = useSelector((state) => state.layout.layout);
const widgetSetting = useSelector((state) => state.layout.widgetSettings);
  const status = useSelector((state) => state.layout.status);
  const [selectedWidgetSettings, setSelectedWidgetSettings] = useState(null);
const availableWidgets = useSelector((state) => state.layout.availableWidgets);

  useEffect(() => {
    if (status === 'idle') {
//dispatch(fetchAvailableWidgets());
      dispatch(fetchWidgetSettings());
    }
  }, [status, dispatch]);

  const handleAddWidget = (widget) => {
    dispatch(addWidget(widget));
    dispatch(closeDrawer());
  };


 useEffect(() => {
    console.log("layout changed");
console.log(layout);
  }, [layout]);


  const handleSettingsClick = (widgetId) => {
console.log("handleSettingsClick");
console.log(widgetSetting);
const settings = widgetSetting[widgetId];

console.log(settings);
console.log(widgetId);
    dispatch(openWidgetSettings({ widgetId, settings }));
    setSelectedWidgetSettings(settings);
  }

  const handleWidgetSettingChange = (settingName, value) => {
console.log("handleWidgetSettingChange");
    dispatch(updateWidgetSetting({ widgetId: selectedWidgetId, settingName, value }));
  };

  const onLayoutChange = (newLayout) => {
    
      dispatch(updateLayout(newLayout));
  };

  
  if (!Array.isArray(layout)) {
    console.error('layout is not an array:', layout);
    return <div>Error: Invalid layout state</div>;
  }

  return (
    <AppShell className="h-screen" padding="md">
      <AppShell.Main>
        <div className="flex justify-end mb-4">
          <Button onClick={() => dispatch(openDrawer())}>Add Widget</Button>
        </div>
        <ReactGridLayout className={classes.grid} cols={12} rowHeight={30} width={1200} onLayoutChange={onLayoutChange}>
          {layout.map((item) => {
            const WidgetComponent = lazy(() => import(`${item.widget}`));

            return (
              <div key={item.i} data-grid={item.grid}>
                <WidgetWrapper id={item.i}  onSettingsClick={handleSettingsClick}>
                  <Suspense fallback={<Loader />}>
                    <WidgetComponent id={item.i} />
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
            {Object.entries(widgetSetting[selectedWidgetId] || {}).map(([settingName, setting]) => (
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

export default Home;
