<script lang="ts">
  import { t } from './i18n'

  let count: number = 0
  const increment = () => {
    count += 1
  }
</script>

<button on:click={increment}>
  {$t('counter', { count })}
</button>
