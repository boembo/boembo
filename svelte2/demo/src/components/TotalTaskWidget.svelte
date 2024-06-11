<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function handleResize(event) {
    dispatch('resize', event.detail); // Dispatch resize event with new dimensions
  }
</script>

<div class="bg-gray-100 p-4 rounded-md" on:resize={handleResize}>
  Total Task: 3
</div>
