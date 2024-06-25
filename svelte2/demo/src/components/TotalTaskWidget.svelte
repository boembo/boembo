<script>
  import { createEventDispatcher } from 'svelte';
  import ComponentSetting from './ComponentSetting.svelte';
  import { writable } from 'svelte/store';

  const dispatch = createEventDispatcher();

  // Settings store
  let settings = writable({
    showTitle: true,
  });

  function handleResize(event) {
    dispatch('resize', event.detail);
  }
</script>

<div class="h-full bg-gray-100 p-4 rounded-md border border-2 border-gray-200 relative" on:resize={handleResize}>
  <div class="flex items-center justify-between mb-2">
    {#if $settings.showTitle}
      <h3 class="widget-title">Total Task: 3</h3>
    {/if}

    <ComponentSetting {settings} />
  </div>

  <div class="widget-body border-t border-gray-200 pt-2">
  </div>
</div>

<style>
  .widget-title {
    background-color: #f0f0f0;
    padding: 8px;
    width: 100%; 
  }
</style>
