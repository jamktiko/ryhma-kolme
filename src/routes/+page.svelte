<script lang="ts">
	import WeatherDayList from '$lib/components/weatherDayList.svelte';
	import { weatherGlobal } from '$lib/weatherGlobal.svelte';
	import WeatherMain from '$lib/components/WeatherMain.svelte';
	import Button from '$lib/components/Button.svelte';
	import UserInput from '$lib/components/UserInput.svelte';
	import { onMount } from 'svelte';
	import type { IpGeo } from '$lib/types/ip';
	import type { Weather } from '$lib/types/weather';
	import type { Parameters } from '$lib/types/parameters';
	import { fade, scale, blur, slide, fly } from 'svelte/transition';

	let parameters: Parameters[] = [
		'Temperature',
		'Humidity',
		'WindDirection',
		'WindSpeedMS',
		'TotalCloudCover',
		'PoP',
		'ProbabilityThunderstorm',
		'SmartSymbol',
		'Precipitation1h'
	];
	let city = $state('Jyväskylä');
	let timeStep = 60; // Määrittää minuuteissa kuinka usein haetaan säädataa

	let startTime = $state('');
	let endTime = $state('');

	// Määrittää haun aloitus ja lopetus ajat iso muotoon
	async function setStartEndTime() {
		const timeNowMilli = Date.now(); // Hakee nykyisen ajan millisekunneissa
		const endTimeMilli = timeNowMilli + weatherGlobal.hakuPaivat * 24 * 60 * 60 * 1000; //Days * Hours * Minutes * Seconds * Milliseconds
		const endTimeDate = new Date(endTimeMilli); // Muuttaa ajan millisekunneista uudeksi aika objektiksi?
		const timeNowDate = new Date();
		startTime = timeNowDate.toISOString();
		endTime = endTimeDate.toISOString();
		return startTime;
	}
	// Hakee säätiedot valituilla parametreilla
	async function haeSaatiedot() {
		const time = await setStartEndTime();

		const query = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::edited::weather::scandinavia::point::timevaluepair&place=${city}&timestep=${timeStep}&parameters=${parameters.join(',')}&starrtime=${startTime}&endtime=${endTime}`;
		console.log(`fetching from ${query}`);
		await fetch(query)
			.then((response) => {
				if (response.ok) {
					return response.text();
				} else {
					throw new Error('Virhe hakiessa säätietoja');
				}
			})
			.then((text) => {
				const parser = new DOMParser(); // Tekee xml parserin, koska säätiedot ovat xml muodossa
				const xmlDoc = parser.parseFromString(text, 'application/xml');
				const saatiedotXML = xmlDoc.getElementsByTagName('wml2:value'); // Nappaa xml tiedostosta kaiken säädatan
				const saatiedotAjatXML = xmlDoc.getElementsByTagName('wml2:time'); // Nappaa xml tiedostoista säädatan aikaleimat
				const cityXML = xmlDoc.getElementsByTagName('gml:name'); // Nappaa apin palauttaman kaupungin nimen
				const regionXML = xmlDoc.getElementsByTagName('target:region'); // Nappaa apin palauttaman kaupungin nimen, jos haettupaikka ei ole oma kuntansa

				weatherGlobal.selectedCity = cityXML[0].childNodes[0].nodeValue ?? ''; // Asettaa kaupungin nimen globaaliin muuttujaan
				weatherGlobal.selectedRegion = regionXML[0].childNodes[0].nodeValue ?? ''; // Asettaa kaupungin nimer globaaliin muuttujaan
				localStorage.setItem('city', cityXML[0].childNodes[0].nodeValue ?? ''); // Tallentaa kaupungin nimen localstorageen

				const tietojaPerParametri = saatiedotXML.length / parameters.length; // Laskee kuinka paljon säätietoja on per parametri
				// Säätiedot taulukkoihin
				let saatiedotTaulukko: string[][] = []; // Taulukko, jossa on jokaiselle säätietotyypille (lämpötila,kosteus..) oma taulukko.
				let saatiedotAjatTaulukko: string[][] = []; // Taulukko, jossa on säätiedoille aikaleimat
				// Laittaa säätiedot omiin taulukkoihinsa ja käärii ne ylempään taulukkoon
				for (let i = 0; i < parameters.length; i++) {
					let saatiedot: string[] = [];
					let saatiedotAjat: string[] = [];
					for (let j = 1; j <= tietojaPerParametri; j++) {
						// console.log(j + i * tietojaPerParametri - 1);
						saatiedot.push(
							saatiedotXML[j + i * tietojaPerParametri - 1].childNodes[0].nodeValue ?? ''
						);
						saatiedotAjat.push(
							saatiedotAjatXML[j + i * tietojaPerParametri - 1].childNodes[0].nodeValue ?? ''
						);
					}
					saatiedotTaulukko.push(saatiedot);
					saatiedotAjatTaulukko.push(saatiedotAjat);
				}
				// console.log(saatiedotTaulukko);
				// console.log(saatiedotAjatTaulukko);

				// Sääobjekti taulukon luonti
				const saatietoTaulukko = [];
				for (let i = 0; i < saatiedotTaulukko[0].length; i++) {
					saatietoTaulukko.push({
						Date: new Date(saatiedotAjatTaulukko[0][i]),
						Temperature: Math.round(Number(saatiedotTaulukko[0][i])),
						Humidity: Math.round(Number(saatiedotTaulukko[1][i])),
						WindDirection: Math.round(Number(saatiedotTaulukko[2][i]) / 45), // Jakaa ilman suunan 360 asteesta 8 eri suuntaan. Alkaen 0:sta (etelä) jatkuen myötäpäivään
						WindSpeedMS: Math.round(Number(saatiedotTaulukko[3][i]) * 10) / 10, // Pyöristää ensimmäiseen desimaaliin
						TotalCloudCover: Math.round(Number(saatiedotTaulukko[4][i])),
						PoP: Math.round(Number(saatiedotTaulukko[5][i]) / 10) * 10, // Pyöristää kymmeniin
						ProbabilityThunderstorm: Math.round(Number(saatiedotTaulukko[6][i])),
						// Poistaa symbolin numerosta mahdollisen pisteen ja sen jälkeiset numerot
						SmartSymbol:
							saatiedotTaulukko[7][i].indexOf('.') !== -1
								? saatiedotTaulukko[7][i].slice(0, saatiedotTaulukko[7][i].indexOf('.'))
								: saatiedotTaulukko[7][i],
						Precipitation1h: Math.round(Number(saatiedotTaulukko[8][i]) * 10) / 10 // Muuntaa numeroksi ja pyöristää ensimmäiseen desimaaliin
					});
				}
				weatherGlobal.saatietoTaulukko = saatietoTaulukko; // Vie säätietotaulukon globaaliin muuttujaan
				weatherGlobal.selectedDay = weatherGlobal.saatietoTaulukko[0].Date.getDate(); // Asettaa valituksi päiväksi ensimmäisen päivän
				weatherGlobal.selectedHour = weatherGlobal.saatietoTaulukko[0].Date.getHours(); // Asettaa valituksi tunniksi ensimmäisen saatavilla olevan tunnin
			})
			.catch((error) => {
				if (error instanceof Error) {
					console.error('Virhe:', error.message);
				} else {
					console.error('Virhe hakiessa säätietoja');
				}
			});
		//console.log('All Done!');
	}
	// Hakee kaupungin nimen IP-osoitteen perusteella, jos kaupunkia ei ole tallennettuna localStorageen
	onMount(async () => {
		if (!localStorage.getItem('city')) {
			const kaupunki: IpGeo = await fetch('https://ipapi.co/json/').then((vastaus) => {
				return vastaus.json();
			});
			localStorage.setItem('city', kaupunki.city);
			city = kaupunki.city;
		} else {
			city = localStorage.getItem('city') ?? 'Jyväskylä';
		}
		haeSaatiedot();
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			haeSaatiedot();
		}
	}
</script>

<!--<h2 style="transition: color 1s;" class:yo={weatherGlobal.isNight}>
	Hae säätiedot paikkakunnan nimellä
</h2>-->
<div in:fade={{ duration: 500 }}>
	<UserInput
		onkeydown={handleKeydown}
		type="text"
		placeholder="Hae paikkakunnan nimellä..."
		bind:value={city}
		disabled={false}
		search={() => {
			haeSaatiedot();
		}}
	/>

	<div class="weather-container">
		<WeatherMain />
		<WeatherDayList />
	</div>
</div>

<style>
	p {
		background: none;
		text-align: center;
	}
	h2 {
		text-align: center;
		font-weight: normal;
	}
	.weather-container {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		flex-direction: row;
	}

	/* Responsiivinen säätö: allekkain vain alle 768px leveyksillä */
	@media (max-width: 768px) {
		.weather-container {
			flex-direction: column;
			align-items: stretch; /* täyttävät koko leveyden */
		}
	}
	@media (max-width: 768px) {
		h2 {
			font-size: 18px;
		}
	}

	@media (max-width: 480px) {
		h2 {
			font-size: 14px;
		}
	}
</style>
