const soap = require('soap');
const PolishPostTrackingClient = require('./PolishPostTrackingClient.js');

const WSDL_URLS = {
	public : 'https://tt.poczta-polska.pl/Sledzenie/services/Sledzenie?wsdl',
	commercial : 'https://ws.poczta-polska.pl/Sledzenie/services/Sledzenie?wsdl'
}


async function connect(options) {
	if ( !options ) {
		throw new Error('Must provide options to connect()');
	}
	if ( !options.username || !options.password ) {
		throw new Error('Must provide username and password in connect() options');
	}
	options = Object.assign({
		testConnection : true,
		language : 'EN'
	}, options)
	const client = await new Promise(function (resolve, reject) {

		const security = new soap.WSSecurity(options.username, options.password, {
			hasTimeStamp: false,
			hasTokenCreated: false,
		});
		const url = options.commercial ? WSDL_URLS.commercial : WSDL_URLS.public;
		soap.createClient(url, function (err, soapClient) {
			if (err) return reject(err);
			soapClient.setSecurity(security);
			const client = new PolishPostTrackingClient(soapClient);
			client.setDefaultLanguage(options.language)
			resolve ( client)
		});
	})
	if ( options.testConnection ) {		
		await client.testConnection();
	}
	return client;
}

module.exports = connect;