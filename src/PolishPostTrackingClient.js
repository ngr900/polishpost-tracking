const SUPPORTED_LANGUAGES = ['PL', 'EN'];

const transformPackageData = require('./transformPackageData.js');
const PolishPostTrackingClientError = require('./PolishPostTrackingClientError.js');
const PolishPostTrackingError = require('./PolishPostTrackingError.js');

const soapErrors = [
	{
		original: 'soapenv:Server: WSDoAllReceiver: security processing failed',
		message: 'invalid username or password',
	},
];

function getSoapErrorMessage(originalMessage) {
	const found = soapErrors.find((error) => error.original === originalMessage);
	return found ? found.message : originalMessage;
}

function checkForErrorCodes(response) {
	response = response.return;

	if (response.attributes['xsi:type'] === 'ax21:Komunikat') {
		switch (response.status) {
			case -1:
				throw new PolishPostTrackingError(
					'Requested data for too many packages'
				);
			case -2:
				throw new PolishPostTrackingError(
					'User not allowed to request data for multiple packages'
				);
			case -3:
				throw new PolishPostTrackingError('Provided invalid dates');
			case -99:
				throw new PolishPostTrackingError('Polish Post server error');
		}
	} else if (response.attributes['xsi:type'] === 'ax21:Przesylka') {
		switch (response.status) {
			case -1:
				throw new PolishPostTrackingError('Package not found');
			case -2:
				throw new PolishPostTrackingError('Invalid tracking number');
			case -99:
				throw new PolishPostTrackingError('Polish Post server error');
		}
	}
}

function PolishPostTrackingClient(soapClient) {
	let defaultLanguage = 'EN';

	function isLanguageSupported(code) {
		if (SUPPORTED_LANGUAGES.includes(code)) {
			return true;
		} else {
			// console.warn(`Language not supported '${code}', using 'EN' instead`);
			return false;
		}
	}

	function soapRequest(method, args) {
		return new Promise(function (resolve, reject) {
			soapClient[method](args, (err, response) => {
				if (err)
					return reject(
						new PolishPostTrackingClientError(
							`Could not complete SOAP request: ${getSoapErrorMessage(
								err.message
							)}`
						)
					);
				resolve(response);
			});
		});
	}

	this.test = function () {};

	this.testConnection = async function testConnection(client) {
		return soapRequest('witaj', { imie: 'ppnode' });
	};

	this.setDefaultLanguage = function setDefaultLanguage(code) {
		code = code.toUpperCase();
		defaultLanguage = isLanguageSupported(code) ? code : defaultLanguage;
	};

	this.getDefaultLanguage = function getDefaultLanguage() {
		return defaultLanguage;
	};

	this.getMaxPackagesPerRequest = function getMaxPackagesPerRequest() {
		return new Promise(function (resolve, reject) {
			soapClient.maksymalnaLiczbaPrzesylek({}, function (err, response) {
				if (err) return reject(err);
				resolve(response.return);
			});
		});
	};

	function _defaultLanguage(language) {
		if (language && isLanguageSupported(language)) {
			return language;
		} else {
			return defaultLanguage;
		}
	}

	async function _track(numberOrNumbers, method, options) {
		let response = await soapRequest(method, { numer: numberOrNumbers });
		checkForErrorCodes(response);
		const language = _defaultLanguage(options.language);
		if (response.return.przesylki) {
			return response.return.przesylki.przesylka.map((package) =>
				transformPackageData(package, language)
			);
		} else {
			return transformPackageData(response.return, language);
		}
	}

	this.trackPackage = async function trackPackage(number, options = {}) {
		const method = options.details ? 'sprawdzPrzesylkePl' : 'sprawdzPrzesylke';
		return _track(number, method, options);
	};

	this.trackMultiplePackages = async function trakMultiplePackages(
		numbers,
		options = {}
	) {
		const method = options.details ? 'sprawdzPrzesylkiPl' : 'sprawdzPrzesylki';
		return _track(number, method, options);
	};
}

module.exports = PolishPostTrackingClient;
