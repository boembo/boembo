<script>
  import { slide } from 'svelte/transition';

  export let isOpen = false;
  export let closePanel;

  function handleClickOutside(event) {
    if (event.target === event.currentTarget) {
      closePanel();
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-y-0 right-0 w-1/3 bg-white border-l border-gray-300 overflow-y-auto z-10"
    transition:slide={{ duration: 300 }}
    on:click={handleClickOutside}
  >
    <div class="p-4">
      <slot></slot>
    </div>
  </div>
{/if}

<style>
  :global([transition="slide"]) {
    transition-property: transform;
  }
</style>
