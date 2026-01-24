<script lang="ts">
	import type { Weather } from '$lib/types/weather';

	import { weatherGlobal } from '$lib/weatherGlobal.svelte';

	interface Props {
		weatherHour: Weather;
	}
	let { weatherHour }: Props = $props();
	//let timeAndDate: string = weatherHour.Time;
</script>

<button
	class:active={weatherHour.Date.getUTCHours() === weatherGlobal.selectedHour}
	onclick={() => {
		weatherGlobal.selectedHour = weatherHour.Date.getUTCHours();
	}}
	class="weather-hour"
>
	<p>
		<b>
			{(() => {
				if (weatherHour.Date.getHours() < 10) {
					return '0';
				}
				return '';
			})()}{weatherHour.Date.getHours()}
		</b>

		<!-- Jos kello on alle 10, lisää 0 eteen-->
	</p>
	<img alt="Sääsymboli" src={`/SmartSymbol/${weatherHour.SmartSymbol}.svg`} />
	<p>
		<b class:lamminta={weatherHour.Temperature >= 0} class:pakkasta={weatherHour.Temperature < 0}>
			{weatherHour.Temperature}
			°</b
		>
	</p>
	<div
		class="rain-info"
		class:sataa-20={weatherHour.PoP >= 20 && weatherHour.PoP < 70}
		class:sataa-70={weatherHour.PoP >= 70}
	>
		<p>
			<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
				<path
					fill="currentColor"
					d="M9.81 15.25c0 .92.23 1.78.7 2.57s1.1 1.43 1.9 1.9s1.66.71 2.59.71s1.8-.24 2.61-.71a5.3 5.3 0 0 0 1.92-1.9c.47-.8.71-1.65.71-2.57c0-.6-.17-1.31-.52-2.14s-.77-1.6-1.26-2.3c-.44-.57-.96-1.2-1.56-1.88s-1.65-1.73-1.89-1.97l-1.28 1.29c-.62.6-1.22 1.29-1.79 2.08s-1.07 1.64-1.49 2.55c-.44.91-.64 1.7-.64 2.37"
				/>
			</svg><br />
			<b>{weatherHour.PoP}</b> %
		</p>
	</div>
</button>

<style>
	img {
		width: 40px;
		height: 40px;
		color: #00000000; /** To make alt text invisible when symbol not loaded **/
	}
	.rain-info {
		overflow: auto;
	}

	.sataa-70 {
		color: blue;
	}
	.sataa-20 {
		color: darkblue;
	}

	.pakkasta {
		color: var(--pakkas-color);
	}
	.lamminta {
		color: var(--lammin-color);
	}
	.weather-hour {
		height: 100%;
		transition: background-color 0.3s ease;
		border: none;
		background: none;
		color: var(--main-text);
		padding: 0;
		font: inherit;
		font-size: large;
		cursor: pointer;
		outline: inherit;
		flex: 1 1 12.5%;
		border-radius: 20px;
	}
	.weather-hour:hover,
	.active {
		background-color: var(--active-color);
	}

	/* Responsiivisuus pienille näytöille */
	@media (max-width: 879px) {
		.weather-hour {
			/*flex: 0 0 25%; Poistaa flexaukset*/
			width: 25%;
		}
	}

	@media (max-width: 480px) {
		.weather-hour {
			width: 50%;
		}
	}
	@media (max-width: 362px) {
		.weather-hour {
			font-size: small;
		}
		img {
			width: 36px;
			height: 36px;
		}
	}
</style>
