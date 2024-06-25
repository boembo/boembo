<script>
  import { get } from 'svelte/store';
  import SlidingPanel from './SlidingPanel.svelte';

  export let settings;
  let isPanelOpen = false;

  function togglePanel() {
    isPanelOpen = !isPanelOpen;
  }

  function closePanel() {
    isPanelOpen = false;
  }
</script>

<div class="relative">
  <button on:click={togglePanel} class="p-1 rounded-full hover:bg-gray-200">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  </button>

  {#if isPanelOpen}
    <SlidingPanel bind:isOpen={isPanelOpen} {closePanel}>
      <h2>Widget Settings</h2>
      {#each Object.entries(get(settings)) as [key, value]}
        <label>
          {key.charAt(0).toUpperCase() + key.slice(1)}:
          {#if typeof value === 'boolean'}
            <input type="checkbox" bind:checked={settings[key]}>
          {:else if Array.isArray(value)}
            <select bind:value={settings[key]}>
              {#each value as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          {/if}
        </label>
      {/each}
    </SlidingPanel>
  {/if}
</div>

<style>
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
