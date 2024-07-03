import { useState, lazy, Suspense } from 'react';
import { Drawer, AppShell, Button, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import GridLayout from 'react-grid-layout';
import RGL, { WidthProvider } from "react-grid-layout";
import classes from './Home.module.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

import SimpleWidget from './SimpleWidget'; // Example available widget

const ReactGridLayout = WidthProvider(GridLayout);

export function Home() {
  const [layout, setLayout] = useState([]); // Start with an empty layout
  const [count, setCount] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
  const [widgetComponents, setWidgetComponents] = useState({});

  const availableWidgets = [
    { name: "Total Task Widget", component: './TotalTaskWidget' },
    { name: "Simple Widget", component: './SimpleWidget' },
  ];

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const addGridItem = async (widget) => {
    try {
      if (!widgetComponents[widget.name]) {
        const module = await import(widget.component);
        setWidgetComponents(prev => ({ ...prev, [widget.name]: module.default }));
      }

      setCount((prevCount) => prevCount + 1);
      // Add the new item at the beginning of the layout
      setLayout((prevLayout) => [
        { i: `n${count}`, x: 0, y: 0, w: 3, h: 4 },
        ...prevLayout, // No need to shift items, as this is the first item
      ]);
    } catch (error) {
      console.error("Error importing widget:", error);
    }
  };

  return (
    <AppShell className="h-screen" padding="md">
      <AppShell.Main>
        <div className="flex justify-end mb-4">
          <Button onClick={open}>Add Widget</Button>
        </div>
        <ReactGridLayout
          className={classes.grid}
          layout={layout}
          cols={12}
          rowHeight={30}
          width={1200}
          onLayoutChange={onLayoutChange}
        >
          {layout.map((item, index) => {
            if (item.i.startsWith('n')) {
              const WidgetComponent = widgetComponents[item.i];
              return (
                <Suspense key={item.i} fallback={<div>Loading...</div>}>
                  {WidgetComponent && <WidgetComponent className={classes.item} />}
                </Suspense>
              );
            }
            return null; 
          })}
        </ReactGridLayout>
      </AppShell.Main>

      <Drawer opened={opened} onClose={close} size="md" position="right">
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
    </AppShell>
  );
}
