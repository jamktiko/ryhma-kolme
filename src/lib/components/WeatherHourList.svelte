<script lang="ts">
	import type { Weather } from '$lib/types/weather';
	import type { Parameters } from '$lib/types/parameters';
	import WeatherHour from '$lib/components/WeatherHour.svelte';
	import { weatherGlobal } from '$lib/weatherGlobal.svelte';

	let weatherHours: Weather[] = $derived(weatherGlobal.saatietoTaulukko);
</script>

<div class="weather-hours">
	{#each weatherHours as weatherHour, index}
		{#if weatherHour.Date.getUTCDate() === weatherGlobal.selectedDay}
			<WeatherHour {weatherHour} />
		{/if}
	{/each}
</div>

<style>
	.weather-hours {
		padding: 0 0.5em;
		padding-bottom: 0.5em;
		width: 100%;
		display: inline-flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: flex-end;
		box-sizing: border-box;
	}

	/* Responsiivisuus pienille näytöille */
	@media (max-width: 879px) {
		.weather-hours {
			position: relative;
			flex-wrap: nowrap;
			justify-content: center;
			/*padding: 10px 0;  Voit lisätä takaisin jos tärkeä*/
		}
	}

	@media (max-width: 361px) {
		.weather-hours {
			font-size: 95%;
		}
	}
</style>
