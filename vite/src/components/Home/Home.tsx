import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import RGL, { WidthProvider } from "react-grid-layout";
import classes from "./Home.module.css";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

const ReactGridLayout = WidthProvider(GridLayout);

export function Home() {
  const [layout, setLayout] = useState([
    { i: "a", x: 0, y: 0, w: 6, h: 4 },
    { i: "b", x: 6, y: 0, w: 6, h: 4 },
  ]);
  const [count, setCount] = useState(0);

  const mainLinksMockdata = [
    // ... your existing mock data for links ... (e.g., { text: 'Link 1' }, ...)
  ];

  // ... your existing state (active, activeLink) ...

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const preventClickBouncing = (event) => {
    event.stopPropagation();
  };

  const addGridItem = () => {
    setCount((prevCount) => prevCount + 1);

    // Find the first available empty space
    let newX = 0, newY = 0;
    while (layout.some(item => item.x === newX && item.y === newY)) {
      newX += 3; // Move to the next column
      if (newX >= 12) { // If reached the end of row, move to next row
        newX = 0;
        newY += 4; 
      }
    }

    setLayout((prevLayout) => [
      ...prevLayout,
      { i: `n${count}`, x: newX, y: newY, w: 3, h: 4 }
    ]);
  };

  return (
    <div>
      <button onClick={addGridItem}>Add Grid Item</button>
      <ReactGridLayout
        className={classes.grid}
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={onLayoutChange}
      >
        {/* ... (your grid items "a" and "b" remain the same, but remove static: true) ... */}
        {layout.map((item, index) => {
          if (item.i.startsWith("n")) {
            return (
              <div
                key={item.i}
                className={classes.item}
                onClick={preventClickBouncing}
              >
                <h2>New Grid Item {index - 1}</h2>
                {/* ... content for your new item ... */}
              </div>
            );
          }
          return null;
        })}
      </ReactGridLayout>
    </div>
  );
}
