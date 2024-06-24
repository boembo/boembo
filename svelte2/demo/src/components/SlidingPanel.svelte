<script>
  import { onMount, onDestroy } from 'svelte';

  export let isOpen;
  export let closePanel;

  const handleClickOutside = (event) => {
    if (event.target.closest('.sliding-panel-container') === null) {
      closePanel();
    }
  };

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<style>
  .sliding-panel-container {
    position: fixed;
    top: 0;
    right: -300px; /* Initially hidden */
    width: 300px;
    height: 100%;
    background-color: white;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
    transition: transform 0.3s ease-in-out, right 0.3s ease-in-out;
    z-index: 1000;
  }

  .sliding-panel-container.open {
    right: 0; /* Slide in from the right */
    transform: translateX(0);
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
</style>

{#if isOpen}
  <div class="overlay" on:click={closePanel}></div>
{/if}
<div class="sliding-panel-container {isOpen ? 'open' : ''}">
  <div class="sliding-panel">
    <slot></slot>
  </div>
</div>
