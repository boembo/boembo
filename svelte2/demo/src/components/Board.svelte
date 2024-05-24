<script>
  import List from './List.svelte';
  import { tasks } from '../stores/tasks';
</script>

<div class="board">
  {#each Object.keys($tasks) as listName}
    <List listName={listName} tasks={$tasks[listName]} />
  {/each}
</div>
