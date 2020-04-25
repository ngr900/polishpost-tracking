const SUPPORTED_LANGUAGES = ['PL', 'EN'];

const transformPackageData = require('./transformPackageData.js');

function PolishPostClient(soapClient) {
	let defaultLanguage = 'EN';

	function determineAPIMethod(multiple, details) {
		if (multiple) {
			return details ? 'sprawdzPrzesylkiPl' : 'sprawdzPrzesylki';
		} else {
			return details ? 'sprawdzPrzesylkePl' : 'sprawdzPrzesylke';
		}
	}

	this.testConnection = function testConnection(client) {
		return new Promise((resolve, reject) => {
			soapClient.witaj({ imie: 'ppnode' }, (err, response) => {
				if (err) return reject(err);
				resolve(this);
			});
		});
	};

	this.setLanguage = function setLanguage(code) {
		code = code.toUpperCase();
		if (!SUPPORTED_LANGUAGES.includes(code)) {
			console.warn(`Language not supported (${code})`);
		} else {
			defaultLanguage = code;
		}
	};

	this.getMaxPackagesPerRequest = function getMaxPackagesPerRequest() {
		return new Promise(function (resolve, reject) {
			soapClient.maksymalnaLiczbaPrzesylek({}, function (err, response) {
				if (err) return reject(err);
				resolve(response.return);
			});
		});
	};

	this.trackPackages = function trackPackages(number, details, language = defaultLanguage) {
		const multiple = number instanceof Array;

		return new Promise(function (resolve, reject) {
			const method = determineAPIMethod(multiple, details);
			console.log(`mutliple ${multiple} details ${details} method: ${method}`);
			soapClient[method]({ numer: number }, function (err, response) {
				if (err) return reject(err);
				if (multiple) {
					resolve(
						response.return.przesylki.przesylka.map((package) =>
							transformPackageData(package, language)
						)
					);
				} else {
					resolve(transformPackageData(response.return, language));
				}
			});
		});
	};
}

module.exports = PolishPostClient;
