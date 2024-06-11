<script>
import Error404 from './components/Error404.svelte';
import { tasks } from './stores/tasks';
 import { onMount } from 'svelte'

  let dynamicPage = null
   let component = "Home"

  onMount(async () => {
      try {
          dynamicPage = (await import(`./components/${component}.svelte`)).default
      } catch (e) {
console.log("Error");
          // Handle errors if the dynamic route doesn't load:
          dynamicPage = Error404
      }
  })
</script>


<svelte:component this={dynamicPage} />