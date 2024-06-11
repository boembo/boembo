<script>
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";
  import { writable } from 'svelte/store';
  import SlidingPanel from './SlidingPanel.svelte';
  import TotalTaskWidget from './TotalTaskWidget.svelte';

  let isPanelOpen = writable(false);
  let availableWidgets = ['Total Task Widget'];


  const id = () => "_" + Math.random().toString(36).substr(2, 9);


let layoutOriginal  = [
        {
    6: gridHelp.item({
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    }),
    id: id(),
  },

  {
    6: gridHelp.item({
      x: 2,
      y: 0,
      w: 2,
      h: 2,
    }),
    id: id(),
  },
  ];

let layout = layoutOriginal;
  const breakpoint = 1100;
  const column = 6;
  const cols = [
    [breakpoint, column],
  ];

  // Function to add a new widget to the layout
  function addWidget(widgetType) {
    layout = [
      ...layout,
      {
        [breakpoint]: gridHelp.item(),
        id: id(),
        component: widgetType === 'Total Task Widget' ? TotalTaskWidget : null, 
      },
    ];
    closePanel();
  }

let items = layout;



  function openPanel() {
    isPanelOpen.set(true);
  }

  function closePanel() {
    isPanelOpen.set(false);
  }

const onChange = () => {
console.log("new items changed");
console.log(items);
  localStorage.setItem("layout", JSON.stringify(items));
};

const reset = () => {
  items = layoutOriginal;
  localStorage.setItem("layout", JSON.stringify(layoutOriginal));
};

</script>
<div class="demo-container size">

<button on:click={openPanel} class="bg-blue-500 text-white px-4 py-2 rounded">
    Add Widget
  </button>

<button on:click={reset} class="bg-blue-500 text-white px-4 py-2 rounded">
    reset
  </button>
  <Grid bind:items={items} rowHeight={100} let:item {cols} let:index on:change={onChange}>
<div class=demo-widget>
     {index}
    </div>

    {#each layout as item (item.id)}
      <div class="demo-widget">
        <svelte:component this={item.component} />
      </div>
    {/each}
  </Grid>

<SlidingPanel bind:isOpen={$isPanelOpen} {closePanel}>
    <h2 class="text-lg font-bold mb-4">Available Widgets</h2>
    <ul>
      {#each availableWidgets as widget}
        <li class="mb-2">
          <button
            on:click={() => addWidget(widget)}
            class="bg-green-500 text-white px-4 py-2 rounded"
          >
            {widget}
          </button>
        </li>
      {/each}
    </ul>
  </SlidingPanel>
</div>
<style>
  .size {
    max-width: 1100px;
    width: 500px;
  }

  .demo-widget {
    /* ... your widget styles ... */
  }
</style>