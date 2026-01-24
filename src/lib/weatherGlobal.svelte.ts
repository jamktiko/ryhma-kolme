import type { Weather } from '$lib/types/weather';
import type { WeatherEffect } from '$lib/types/weathereffect';
import { weatherEffects, WeatherEffects } from '$lib/weathereffects';

class WeatherGlobal {
	// private _currentWeather: string = $derived(
	// 	this.saatietoTaulukko[this.selectedDay - 1][this.selectedHour - 1].WeatherSymbol3
	// );
	private _weatherDayList: Weather[] = $derived(this.setWeatherDayList()); // Lista missä joka päivän klo 12 säätieto
	private _hakuPaivat: number = $state(7); // Kuinka monen päivän sää haetaan
	private _paivienMaara: number = $state(7);
	private _saatietoTaulukko: Weather[] = $state([]); // Taulukko joka sisältää kaikki säätiedot objekteina
	private _selectedDay: number = $state(0); // Muuttuja joka sisältää valitun päivän päivämäärän
	private _selectedHour: number = $state(0); // Muuttuja joka sisältää valitun säätiedon tunnin
	private _selectedCity: string = $state(''); // Muuttuja joka sitältää valitun kaupungin
	private _selectedRegion: string = $state('');
	private _selectedWeather: Weather = $derived(this.setSelectedWeather()); // Muuttuja joka sisältää valitun sään
	private _currentWeatherEffect: WeatherEffect = $derived(this.setCurrentWeatherEffect()); // Muuttuja joka pitää sisällään tämän hetkisen sääefektin
	private _isNight: boolean = $derived(this.setNight());
	private _timeDivider: number = $state(3); // Kuinka monen tunnin välein sää näytetään sovelluksessa. Oletus on 3

	private setNight() {
		if (Number(this.selectedWeather.SmartSymbol) >= 100) {
			return true;
		}
		return false;
	}
	// Asettaa sääefektin sääsymbolin numeron mukaan
	private setCurrentWeatherEffect() {
		switch (this.selectedWeather.SmartSymbol) {
			case '0':
			case '1':
			case '2':
				return weatherEffects[WeatherEffects['Clear']];
				break;
			case '4':
			case '6':
			case '31':
			case '34':
				return weatherEffects[WeatherEffects['PartlyCloudy']];
				break;
			case '7':
				return weatherEffects[WeatherEffects['Cloudy']];
				break;
			case '21':
			case '24':
			case '27':
			case '14':
			case '17':
			case '11':
			case '37':
			case '32':
			case '35':
			case '38':
			case '41':
			case '44':
			case '47':
			case '42':
			case '45':
			case '48':
				return weatherEffects[WeatherEffects['Rain']];
				break;
			case '33':
			case '43':
			case '36':
			case '39':
			case '46':
			case '49':
				return weatherEffects[WeatherEffects['StrongRain']];
				break;
			case '51':
			case '52':
			case '54':
			case '57':
			case '55':
			case '58':
			case '61':
			case '64':
			case '67':
				return weatherEffects[WeatherEffects['Snow']];
				break;
			case '53':
			case '56':
			case '59':
				return weatherEffects[WeatherEffects['StrongSnow']];
				break;
			case '71':
			case '74':
			case '77':
				return weatherEffects[WeatherEffects['Thunder']];
				break;
			case '171':
			case '174':
			case '177':
				return weatherEffects[WeatherEffects['ThunderNight']];
				break;
			case '9':
				return weatherEffects[WeatherEffects['Fog']];
				break;
			case '101':
			case '102':
				return weatherEffects[WeatherEffects['ClearNight']];
				break;
			case '104':
			case '106':
			case '131':
			case '134':
			case '107':
			case '109':
				return weatherEffects[WeatherEffects['PartlyCloudyNight']];
				break;
			case '121':
			case '124':
			case '132':
			case '141':
			case '144':
			case '142':
			case '145':
			case '135':
			case '137':
				return weatherEffects[WeatherEffects['RainNight']];
				break;
			case '133':
			case '136':
			case '143':
			case '146':
			case '127':
			case '114':
			case '117':
			case '111':
			case '138':
			case '147':
			case '148':
				return weatherEffects[WeatherEffects['StrongRainNight']];
				break;
			case '151':
			case '154':
			case '152':
			case '155':
			case '161':
			case '164':
			case '139':
			case '149':
			case '157':
			case '158':
			case '167':
				return weatherEffects[WeatherEffects['SnowNight']];
				break;
			case '153':
			case '156':
			case '159':
				return weatherEffects[WeatherEffects['StrongSnowNight']];
				break;
		}
		return weatherEffects[WeatherEffects['Clear']];
	}

	get currentWeatherEffect() {
		return this._currentWeatherEffect;
	}

	private setWeatherDayList() {
		// Laittaa taulukkoon joka päivältä kello 12 sään, paitsi ekaltam jos kello on yli 12. Jos kello on yli 21, se laittaa vasta seuraavan päivän listaan.
		if (this.saatietoTaulukko.length > 0) {
			let loop = false;
			const tietoTaulukko: Weather[] = [];
			for (const tieto of this.saatietoTaulukko) {
				if (new Date().getUTCHours() < 12 || new Date().getUTCHours() >= 21) {
					if (tieto.Date.getUTCHours() === 12) {
						tietoTaulukko.push(tieto);
					}
				} else {
					if (!loop) {
						tietoTaulukko.push(tieto);
					}
					if (tieto.Date.getUTCHours() === 12 && tieto.Date.getDay() !== new Date().getDay()) {
						tietoTaulukko.push(tieto);
					}
				}
				loop = true;
			}
			//console.log('PäiväTaulukko:');
			//console.log(tietoTaulukko);
			return tietoTaulukko;
		}
		return [];
	}

	get timeDivider() {
		return this._timeDivider;
	}
	get selectedWeather() {
		return this._selectedWeather;
	}
	private setSelectedWeather() {
		// Asettaa valitun säätiedon päivien ja tuntien mukaan
		return (
			this.saatietoTaulukko.find(
				(weather) =>
					weather.Date.getUTCDate() === this.selectedDay &&
					weather.Date.getUTCHours() === this.selectedHour
			) ?? {
				Date: new Date(),
				Temperature: 0,
				Humidity: 0,
				WindDirection: 0,
				WindSpeedMS: 0,
				TotalCloudCover: 0,
				PoP: 0,
				ProbabilityThunderstorm: 0,
				SmartSymbol: '0',
				Precipitation1h: 0 //mm
			}
		);
	}

	get weatherDayList() {
		return this._weatherDayList;
	}
	get selectedCity() {
		return this._selectedCity;
	}
	set selectedCity(city: string) {
		this._selectedCity = city;
	}
	get selectedRegion() {
		return this._selectedRegion;
	}
	set selectedRegion(region: string) {
		this._selectedRegion = region;
	}
	get hakuPaivat() {
		return this._hakuPaivat;
	}
	set hakuPaivat(number: number) {
		this._hakuPaivat = number;
	}
	get selectedDay() {
		return this._selectedDay;
	}
	set selectedDay(day: number) {
		this._selectedDay = day;
	}
	set saatietoTaulukko(taulukko: Weather[]) {
		this._saatietoTaulukko = taulukko;
	}
	get saatietoTaulukko() {
		return this._saatietoTaulukko;
	}
	set paivienMaara(number: number) {
		this._paivienMaara = number;
	}
	get paivienMaara() {
		return this._paivienMaara;
	}

	set selectedHour(number: number) {
		this._selectedHour = number;
	}
	get selectedHour() {
		return this._selectedHour;
	}
	get isNight() {
		return this._isNight;
	}
}

export const weatherGlobal = new WeatherGlobal();
