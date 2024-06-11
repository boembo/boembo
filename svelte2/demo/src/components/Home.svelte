<script>
  import { writable } from 'svelte/store';
  import SlidingPanel from './SlidingPanel.svelte';

  let isPanelOpen = writable(false);
  let availableWidgets = ['Total Task Widget'];

  function openPanel() {
    isPanelOpen.set(true);
  }

  function closePanel() {
    isPanelOpen.set(false);
  }

  function addWidget(widgetType) {
    console.log('Adding widget:', widgetType); // Placeholder for actual implementation
    closePanel();
  }
</script>

<div class="p-4">
  <button on:click={openPanel} class="bg-blue-500 text-white px-4 py-2 rounded">Add Widget</button>

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
