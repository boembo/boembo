import React, { useState, lazy, Suspense,useRef  } from 'react';
import { Drawer, AppShell, Button, Stack, Loader, ActionIcon, Title  } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import GridLayout from 'react-grid-layout';
import RGL, { WidthProvider } from "react-grid-layout";
import classes from './Home.module.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { IconAdjustments, IconSettings } from '@tabler/icons-react';
import SimpleWidget from './SimpleWidget'; // Example available widget

const ReactGridLayout = WidthProvider(GridLayout);

export function Home() {
    const initLayout = [
    {
      i: "TotalTaskWidget",
      widget: "./TotalTaskWidget",
      grid: { x: 0, y: 0, w: 6, h: 2 },
    },
  ];
  const [layout, setLayout] = useState(initLayout); // Start with an empty layout
  const [count, setCount] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);

  const availableWidgets = [
    { name: "Total Task Widget", component: './TotalTaskWidget' },
    { name: "Simple Widget", component: './SimpleWidget' },
  ];

 let newModule;

  const addGridItem = async (widget) => {
    console.log(widget);
    try {
         newModule = { i: widget.name+count, widget: widget.component, grid: {x: 0, y: 0, w: 6, h: 3} },

        setLayout(prev => [ newModule, ...prev  ]);
        setCount(count+1);
        close();
   
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
          cols={12}
          rowHeight={30}
           width={1200}
        >
        {layout.map((item) => {
            const widgetName = item.i;
            const WidgetComponent = React.lazy(() => import(item.widget));;

            return (
            <div key={item.i} data-grid={item.grid} >
                <div className="bg-gray-200 p-2 flex justify-between items-center"> {/* Header */}
                  <Title order={4}>{widgetName}</Title>
                  <ActionIcon variant="default" aria-label="Settings">
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
                      <WidgetComponent className={classes.item} />
                )}
              </Suspense>
                </div>
            );
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
