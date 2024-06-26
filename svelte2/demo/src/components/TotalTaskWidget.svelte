<script>
  import { createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import SlidingPanel from './SlidingPanel.svelte';
  import ComponentSetting from './ComponentSetting.svelte';

  const dispatch = createEventDispatcher();

  let settings = writable({
    showTitle: true,
  });

  let isPanelOpen = writable(false);

  function handleResize(event) {
    dispatch('resize', event.detail);
  }

  function openSettingsPanel(event) {
event.stopPropagation();
console.log("opensetting from Totaltask");
    isPanelOpen.set(true);
  }

  function closePanel() {
console.log("close panel from Totaltask");
    isPanelOpen.set(false);
  }
</script>

<div class="h-full bg-gray-100 p-4 rounded-md border border-2 border-gray-200 relative" on:resize={handleResize}>
  <div class="flex items-center justify-between mb-2">
    {#if $settings.showTitle}
      <h3 class="widget-title">Total Task: 3</h3>
    {/if}

    <button on:click={openSettingsPanel} class="p-1 rounded-full hover:bg-gray-200">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    </button>
  </div>

  <div class="widget-body border-t border-gray-200 pt-2">
    <!-- Your widget body content here -->
  </div>

  {#if isPanelOpen}
    <SlidingPanel bind:isOpen={$isPanelOpen} {closePanel}>
      <ComponentSetting settings={settings} />
    </SlidingPanel>
  {/if}
</div>

<style>
  .widget-title {
    background-color: #f0f0f0;
    padding: 8px;
    width: 100%; 
  }

  .relative {
    position: relative;
  }

  button {
    background: transparent;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background-color: #CBD5E0;
  }
</style>
