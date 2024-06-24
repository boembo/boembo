<script>
  import { createEventDispatcher } from 'svelte';
  import SlidingPanel from './SlidingPanel.svelte';
  import { writable } from 'svelte/store';
  const dispatch = createEventDispatcher();
  let isPanelOpen = writable(false);

  let settings = {
    title: 'Total Task Widget Settings',
    sampleSettings: ['Checkbox', 'On-Off Slide Button'],
  };

  function handleResize(event) {
    dispatch('resize', event.detail); // Dispatch resize event with new dimensions
  }

  function openPanel(event) {
    event.stopPropagation();
    isPanelOpen.set(true);
  }

function deleteWidget() {
closePanel();
}

function closePanel() {
    isPanelOpen.set(false);
  }


</script>

<div class="h-full bg-gray-100 p-4 rounded-md border border-2 border-gray-200" on:resize={handleResize}>
  <h3>Total Task: 3</h3>
  <button on:click={openPanel}>Open Settings</button>
  <SlidingPanel bind:isOpen={$isPanelOpen} {closePanel}>
    <h2>{settings.title}</h2>
    <ul>
      {#each settings.sampleSettings as setting}
        <li>{setting}</li>
      {/each}
    </ul>
    <button on:click={deleteWidget}>Delete Widget</button>
  </SlidingPanel>
</div>

<style>
  /* Add styles for the title and button */
  h3 {
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
  button {
    margin-top: 10px;
  }
</style>
