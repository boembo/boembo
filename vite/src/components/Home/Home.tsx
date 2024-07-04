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

 

  const addGridItem = async (widget) => {
    try {
      if (!widgetComponents[widget.name]) {
        const module = await import(widget.component);
        setWidgetComponents(prev => ({ ...prev, [widget.name]: module.default }));
      }

   
    } catch (error) {
      console.error("Error importing widget:", error);
    }
  };

 const initLayout = [
      { i: "a", grid: {x: 0, y: 0, w: 1, h: 2, static: true} },
      { i: "b", grid: {x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4} },
      { i: "c", grid: {x: 4, y: 0, w: 1, h: 2} }
    ];

  return (
    <AppShell className="h-screen" padding="md">
      <AppShell.Main>
        <div className="flex justify-end mb-4">
          <Button onClick={open}>Add Widget</Button>
        </div>
        <ReactGridLayout
          className={classes.grid}
          cols={12}
          rowHeight={30}
          width={1200}
        >
        {initLayout.map(item => (
                 <div key={item.i} data-grid={item.grid}>
                {item.i}
              </div>
            ))}
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
