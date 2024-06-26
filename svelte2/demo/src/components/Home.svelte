<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";
  import SlidingPanel from './SlidingPanel.svelte';
  import TotalTaskWidget from './TotalTaskWidget.svelte';

  let isPanelOpen = writable(false);
 let isPanelSettingOpen = writable(false);
  let availableWidgets = [
    {
      name: "TotalTask Widget",
      component: TotalTaskWidget
    }
  ];

let settings = writable({});
  let isSidebarOpen = writable(true);  // Store for sidebar state
  let isProfileDropdownOpen = false;  // For profile dropdown

  const id = () => "_" + Math.random().toString(36).substr(2, 9);

  let layoutOriginal = [];
  let layout = layoutOriginal;
  const breakpoint = 1100;
  const column = 6;
  const cols = [
    [breakpoint, column],
  ];

  let items = layout;
  // Function to add a new widget to the layout
  function addWidget(widget) {
console.log("add widget");
    const newItem = {
      6: gridHelp.item({
        x: 0,
        y: 0,
        w: 3,
        h: 2,
      }),
      id: id(),
      component: TotalTaskWidget,
    };

items = [newItem, ...items];
items = gridHelp.adjust(items, 6);
closePanel();
  }

  function toggleSidebar() {
    isSidebarOpen.update(open => !open);
  }

  function toggleProfileDropdown() {
    isProfileDropdownOpen = !isProfileDropdownOpen;
  }

  function openPanel(event) {
    console.log("Home click openpanel");

    event.stopPropagation();
    isPanelOpen.set(true);
  }

function openSettingPanel(event, data) {
    console.log("Home Opensetting");

    event.stopPropagation();
 isPanelSettingOpen.set(true);
    settings = data;
  }

function closePanelSetting() {
isPanelSettingOpen.set(false);
}

  function closePanel() {
    console.log("HOME close panel");


    isPanelOpen.set(false);
  }

  const onChange = () => {
    localStorage.setItem("layout", JSON.stringify(items));
  };

  const reset = () => {
    items = layoutOriginal;
    localStorage.setItem("layout", JSON.stringify(layoutOriginal));
  };

  onMount(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        isSidebarOpen.set(false);
      } else {
        isSidebarOpen.set(true);
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<div class="flex h-screen overflow-hidden">
  <!-- Sidebar -->
  <div class="flex-shrink-0 bg-gray-200 text-black sidebar" class:collapsed={!$isSidebarOpen}>
    <div class="p-4 overflow-y-auto h-full">
      <ul class="mt-4 space-y-2">
        <li class="py-2 flex items-center hover:bg-gray-300 cursor-pointer">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
            <path d="M16 0H4a2 2 0 0 0-2 2v1H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM13.929 17H7.071a.5.5 0 0 1-.5-.5 3.935 3.935 0 1 1 7.858 0 .5.5 0 0 1-.5.5Z"/>
          </svg>
          <a href="#" class=" ml-2 text-black" class:!hidden={!$isSidebarOpen} class:block={$isSidebarOpen}>Dashboard</a>
        </li>
        <li class="py-2 flex items-center hover:bg-gray-300 cursor-pointer">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
            <path d="M16 0H4a2 2 0 0 0-2 2v1H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM13.929 17H7.071a.5.5 0 0 1-.5-.5 3.935 3.935 0 1 1 7.858 0 .5.5 0 0 1-.5.5Z"/>
          </svg>
          <a href="#" class=" ml-2 text-black" class:!hidden={!$isSidebarOpen} class:block={$isSidebarOpen}>Settings</a>
        </li>
        <li class="py-2 flex items-center hover:bg-gray-300 cursor-pointer">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
            <path d="M16 0H4a2 2 0 0 0-2 2v1H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM13.929 17H7.071a.5.5 0 0 1-.5-.5 3.935 3.935 0 1 1 7.858 0 .5.5 0 0 1-.5.5Z"/>
          </svg>
          <a href="#" class=" ml-2 text-black" class:!hidden={!$isSidebarOpen} class:block={$isSidebarOpen}>Profile</a>
        </li>
        <li class="py-2 flex items-center hover:bg-gray-300 cursor-pointer">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
            <path d="M16 0H4a2 2 0 0 0-2 2v1H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM13.929 17H7.071a.5.5 0 0 1-.5-.5 3.935 3.935 0 1 1 7.858 0 .5.5 0 0 1-.5.5Z"/>
          </svg>
          <a href="#" class=" ml-2 text-black" class:!hidden={!$isSidebarOpen} class:block={$isSidebarOpen}>Help</a>
        </li>
      </ul>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Navbar -->
    <div class="bg-gray-100 text-black p-4 flex justify-between items-center">
      <button on:click={toggleSidebar} class="sm:hidden bg-gray-300 p-2 rounded">☰</button>
      <div class="flex items-center space-x-4">
        <span>My App</span>
      </div>
      <div class="relative">
        <button on:click={toggleProfileDropdown} class="bg-gray-300 p-2 rounded-full">👤</button>
        {#if isProfileDropdownOpen}
          <div class="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg py-2">
            <a href="#" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
            <a href="#" class="block px-4 py-2 hover:bg-gray-100">Logout</a>
          </div>
        {/if}
      </div>
    </div>

    <!-- Main App Container -->
    <div class="flex-1 overflow-auto p-4">
      <button on:click={openPanel} class="bg-blue-500 text-white px-4 py-2 rounded">
        Add Widget
      </button>

      <button on:click={reset} class="bg-blue-500 text-white px-4 py-2 rounded">
        Reset
      </button>

      <Grid bind:items={items} rowHeight={100} let:item let:layout let:dataItem {cols} let:index on:change={onChange}>
        <div class="demo-widget h-full">
          <svelte:component this={dataItem.component} {openSettingPanel} />
        </div>
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
                {widget.name}
              </button>
            </li>
          {/each}
        </ul>
      </SlidingPanel>

<SlidingPanel bind:isOpen={$isPanelSettingOpen} {settings} closePanel={closePanelSetting}>
        <h2>Widget Settings</h2>
      {#each Object.entries(settings) as [key, value]}
        <label>
          {key.charAt(0).toUpperCase() + key.slice(1)}:
          {#if typeof value === 'boolean'}
            <input type="checkbox" bind:checked={$settings[key]}>
          {:else if Array.isArray(value)}
            <select bind:value={$settings[key]}>
              {#each value as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          {/if}
        </label>
      {/each}
      </SlidingPanel>
      
    </div>
  </div>
</div>

<style>
  /* Sidebar styling */
  .sidebar {
    width: 16rem;
    transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
  }
  .collapsed {
    width: 4rem;
  }
  .sidebar .flex {
    align-items: center;
  }
  .sidebar a {
    display: inline;
  }
  .collapsed .sidebar a {
    display: none;
  }

</style>
