<script>
  import { get } from 'svelte/store';
  export let settings;
  import { writable } from 'svelte/store';
  import SlidingPanel from './SlidingPanel.svelte';

  let isPanelOpen = writable(false);

  function openPanel() {
console.log("openpanel from componentsetting");
    isPanelOpen.set(true);
  }

  function closePanel() {
console.log("cloase panel from componentsetting");
    isPanelOpen.set(false);
  }
</script>

<div class="relative">



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
