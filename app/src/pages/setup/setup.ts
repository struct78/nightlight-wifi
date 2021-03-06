import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, IonicPageModule, Alert, AlertController, NavController, Loading, LoadingController, MenuController } from 'ionic-angular';
import { Arduino } from '../../providers/arduino/arduino';
import { Config } from '../../providers/config/config';

/**
 * Generated class for the SetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-setup',
	templateUrl: 'setup.html',
})

export class SetupPage {
	public subdomain: string;
	private hasSubdomain: boolean = false;
	private didConnect: boolean = false;
	private isFirstLoad: boolean = true;
	private loader: Loading;

	constructor(
		private arduino: Arduino,
		private navController: NavController,
		private loadingController: LoadingController,
		private alertController: AlertController,
		private storage: Storage,
		private menu: MenuController) {
	}

	ionViewDidLoad() {
		this.checkForSubdomain();
	}

	checkForSubdomain() {
		this.storage.get( 'subdomain' ).then( ( subdomain ) => {
			if (subdomain) {
				this.subdomain = subdomain;
				this.hasSubdomain = true;
				this.isFirstLoad = false;
			}
		});
	}

	saveSubdomain() {
		this.storage.set( 'subdomain', this.subdomain );
	}

	presentLoader() {
		this.loader = this.loadingController.create({
			content: Config.loading.title,
			spinner: Config.loading.spinner,
			duration: Config.loading.duration
		});
		this.loader.present();
	}

	addEventHandlers() {
		this.loader.onDidDismiss(() => {
			this.onDidDismiss();
		});
	}

	getStatus() {
		this.presentLoader();
		this.addEventHandlers();
		this.arduino
			.getHealth()
			.subscribe( (data) => {
				this.didConnect = true;
				this.loader.dismiss();

				if (this.isFirstLoad) {
					this.navController.push( 'SettingsPage' );
				}
			}, (ex) => {
				this.didConnect = false;
			});
	}

	connect() {
		this.saveSubdomain();
		this.arduino.ready().then(() => {
			this.getStatus();
		});
	}

	onDidDismiss() {
		if (!this.didConnect) {
			let alert = this.alertController.create({
				title: Config.alert.title,
				message: Config.alert.message,
				buttons: [{
					text: 'Cancel',
					role: 'cancel'
				}, {
					text: 'Yes',
					handler: () => {
						this.getStatus();
					}
				}]
			});
			alert.present();
		}
	}
}
