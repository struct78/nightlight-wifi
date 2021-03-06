import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Config } from '../config/config';
import 'rxjs/Rx';

export enum Patterns {
	WIPE = 0,
	DIAGONAL_WIPE = 1,
	RADIAL = 2,
	RAINBOW_STRIPE = 3
};

@Injectable()
export class Arduino {
	private service_url: string;

	constructor( private http : Http, private storage : Storage ) {
	}

	/**
	 * @name setBrightness
	 * @description Sets the brightness of the LEDS. Range 1 - 100. 100 being the brightest.
	 * @param {number} brightness
	 * @public
	 * @return {Subject<any>} client
	**/
	setBrightness( brightness: number ) : Observable<any> {
		return this.post( 'brightness', brightness );
	}

	/**
	 * @name setContrast
	 * @description Sets the contrast of the LEDS. Range 1 - 10. 10 being high contrast.
	 * @param {number} contrast
	 * @public
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
	 * @public
	 * @return {Subject<any>} client
	**/
	setPower( power: boolean ) : Observable<any> {
		return this.post( 'power', power );
	}


	/**
	 * @name setPattern
	 * @description Toggles the LED algorithm.
	 * @param {number} pattern
	 * @public
	 * @return {Subject<any>} client
	**/
	public setPattern( pattern: number ) : Observable<any> {
		return this.post( 'pattern', pattern );
	}

	/**
	 * @name getStatus
	 * @description Gets the status of the lamp
	 * @public
	 * @return {Subject<any>} client
	**/
	public getStatus() : Observable<any> {
		return this.get( 'status' );
	}

	/**
	 * @name getHealth
	 * @description Pings the health endpoint to see if it's available
	 * @public
	 * @return {Subject<any>} client
	**/
	public getHealth() : Observable<any> {
		return this.get( 'health' );
	}


	/**
	 * @name ready
	 * @description Sets up the service URL for the Arduino service. This must be called before any operation.
	 * @public
	 * @return {Promise<boolean>}
	**/
	public ready() : Promise<boolean> {
		return this.storage.get( 'subdomain' ).then( ( subdomain ) => {
			this.service_url = 'http://'.concat(subdomain, '.', this.getDnsProviderDomain());
			return true;
		});
	}

	/**
	 * @name getDnsProviderDomain
	 * @description Gets the domain for the DNS provider
	 * @private
	 * @return {string} domain
	**/
	private getDnsProviderDomain() : string {
		return Config.sandbox ? Config.dns_provider.sandbox : Config.dns_provider.production;
	}

	/**
	 * @name get
	 * @description http get operations
	 * @private
	 * @return {Observable<any>} observable
	**/
	private get( operation: string ) : Observable<any> {
		return this.http.get( this.service_url.concat( '/', operation ) )
			.map( ( response: Response ) => response.json() )
			.catch( ( response: Response ) => this.handleError( response ) );
	}

	/**
	 * @name post
	 * @description http post operations
	 * @private
	 * @return {Observable<any>} observable
	**/
	private post( operation: string, value: any, key?: any ) : Observable<any> {
		let headers = new Headers( { 'Content-Type': 'application/x-www-form-urlencoded' } );
		let requestOptions = new RequestOptions( { headers: headers } );
		let body = new URLSearchParams();
		body.set( key || operation , value );

		return this.http.post( this.service_url.concat( '/', operation ), body, requestOptions )
			.map( ( response:Response ) =>  response.json() )
			.catch( ( response: Response ) => this.handleError( response ) );
	}

	/**
	 * @name handleError
	 * @description returns an error object
	 * @private
	 * @return {Object} error
	**/
	private handleError( ex: Response | any ) : Observable<any> {
		if ( ex instanceof Response ) {
			const body = ex.json() || '';
			const err = body.error || JSON.stringify(body);
			return Observable.throw( err );
		} else {
			return Observable.throw({
				status: "error",
				error: {
					message: ex.message ? ex.message : ex.toString()
				}
			});
		}
	}
}
