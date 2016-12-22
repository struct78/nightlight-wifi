import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';

export enum Patterns {
	WIPE = 0,
	RADIAL = 1,
	PULSE = 2
};

@Injectable()
export class ArduinoService {
	private client: Subject<any> = new Subject<any>();
	private response: Observable<any>;
	//private api_url: string = "http://miffylamp.dynu.net/api";
	private api_url: string = "http://miffy.getsandbox.com";

	constructor( private http : Http ) { }

	private catchError( ex: Response | any ) : Observable<any> {
			let message: string;

			if ( ex instanceof Response ) {
				const body = ex.json() || '';
				const err = body.error || JSON.stringify(body);
				message = `${ex.status} - ${ex.statusText || ''} ${err}`;
			} else {
				message = ex.message ? ex.message : ex.toString();
			}

			return Observable.throw( message );
	}

	/**
	 * @name setBrightness
	 * @description Sets the brightness of the LEDS. Range 1 - 100. 100 being the brightest.
	 * @param {number} brightness
	 * @return {Subject<any>} client
	**/
	setBrightness( brightness: number ) : Observable<any> {
		return this.post( 'brightness', brightness );
	}

	/**
	 * @name setContrast
	 * @description Sets the contrast of the LEDS. Range 1 - 10. 10 being high contrast.
	 * @param {number} contrast
	 * @return {Subject<any>} client
	**/
	setContrast( contrast: number ) : Observable<any> {
		return this.post( 'contrast', contrast );
	}

	/**
	 * @name setSpeed
	 * @description Sets the speed of the colour cycle. Range 1 - 100. 1 being the slowest.
	 * @param {number} speed
	 * @return {Subject<any>} client
	**/
	setSpeed( speed: number ) : Observable<any> {
		return this.post( 'speed', speed );
	}

	/**
	 * @name setPower
	 * @description Toggles the power of the lamp. The Arduino is still running, but the LEDs are turned off.
	 * @param {number} power
	 * @return {Subject<any>} client
	**/
	setPower( power: boolean ) : Observable<any> {
		return this.post( 'power', power );
	}


	/**
	 * @name setPattern
	 * @description Toggles the LED algorithm.
	 * @param {number} pattern
	 * @return {Subject<any>} client
	**/
	setPattern( pattern: number ) : Observable<any> {
		return this.post( 'pattern', pattern );
	}

	/**
	 * @name getStatus
	 * @description Gets the status of the lamp
	 * @return {Subject<any>} client
	**/
	getStatus() : Observable<any> {
		return this.get( 'status' );
	}


	private get( operation: string ) : Observable<any> {
		return this.http.get( this.api_url.concat( '/', operation ) )
			.retryWhen( ( ex ) => ex.delay(500) )
			.map( ( response: Response ) => response.json() )
			.catch( this.catchError );
	}

	private post( operation: string, value: any, key?: any ) : Observable<any> {
		let headers = new Headers( { 'Content-Type': 'application/x-www-form-urlencoded' } );
		let requestOptions = new RequestOptions( { headers: headers } );
		let body = new URLSearchParams();
		body.set( key || operation , value );

		return this.http.post( this.api_url.concat( '/', operation ), body, requestOptions )
			.retryWhen( ( ex ) => ex.delay(500) )
			.map( ( response:Response ) =>  response.json() )
			.catch( this.catchError );
	}
}
