
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'))
const polishpost = require('./../index.js')
const PolishPostTrackingError = require('./../src/PolishPostTrackingError.js');
const PolishPostTrackingClientError = require('./../src/PolishPostTrackingClientError.js');

const credentials = {
  valid : {
    // these credentials are public
    // https://www.poczta-polska.pl/webservices/
    username: 'sledzeniepp',
    password: 'PPSA',
  },
  invalid : {
    username: 'invalidusername',
    password: 'invalidpassword'
  }
}

describe('#connect(options)', function(){
  context('options with username and password must be passed', function(){
    it ( 'without options, should throw an error', function(){
      expect(polishpost.connect()).to.be.rejectedWith('Must provide options to connect()')
    })
    it ( 'without password, should throw an error', function(){
      expect(polishpost.connect({username:'user'})).to.be.rejectedWith('Must provide username and password in connect() options')
    })
    it ( 'without username, should throw an error', function(){
      expect(polishpost.connect({password:'pass'})).to.be.rejectedWith('Must provide username and password in connect() options')
    })
  })
  context('if username and password are valid',function(){
    it('should create an instance of PolishPostTrackingClient', async function(){
      const client = await polishpost.connect({...credentials.valid});
      expect(client).to.be.ok;
      expect(client.constructor.name).to.equal('PolishPostTrackingClient')
    })
    context('and options.language is', function(){
      it('defined and supported - should set language', async function(){
        const client = await polishpost.connect({...credentials.valid, language:'PL'});
        expect(client.getDefaultLanguage()).to.be.equal('PL')
      })
      it('defined and unsupported - should revert to default', async function(){
        const client = await polishpost.connect({...credentials.valid, language:'ES'});
        expect(client.getDefaultLanguage()).to.be.equal('EN')
      })
      it('not defined - should revert to default', async function(){
        const client = await polishpost.connect({...credentials.valid});
        expect(client.getDefaultLanguage()).to.be.equal('EN')
      })
    })
  })
  context('if username and password are not valid',function(){
    context('and options.testConnection is', function () {
      it('true - should reject with PolishPostTrackingClientError', async function(){
        expect(polishpost.connect({...credentials.invalid})).to.be.rejectedWith(PolishPostTrackingClientError,'Could not complete SOAP request: invalid username or password')
      })
      it('false - should create an instance of PolishPostTrackingClient', async function(){
        const client = await polishpost.connect({...credentials.invalid, testConnection:false});
        expect(client).to.be.ok;
        expect(client.constructor.name).to.equal('PolishPostTrackingClient')
      })
    })
  })

})

const packageDataKeys = ['number','originCountry','originCountry','destinationCountry','destinationCountryCode','shippingDate','packageType','packageTypeCode','serviceFinished','packageMass','packageFormat','originPostOffice','destinationPostOffice','events'];

describe('PolishPostTrackingClient',function(){
  describe('#trackPackage(trackingNumber[, options])',function(){
    let client;
    before ( async function (){
      client = await polishpost.connect({username:'sledzeniepp',password:'PPSA'})
    })
    context('for an invalid tracking number', function (){
      it ( 'should reject with PolishPostTrackingError: Package not found', async function (){
        expect(client.trackPackage('incorrectnumber')).to.be.rejectedWith(PolishPostTrackingError,'Package not found')
      })
    })
    context('for a valid tracking number', function(){
      it ( 'should find tracking information', async function (){
        let response = await client.trackPackage('testp0');
        expect(response).to.be.an('object').that.has.all.keys(packageDataKeys);
      })
      context('and options.details is', function(){
        it('true - should provide detailed locations of tracking events', async function () {
          let response = await client.trackPackage('testp0',{details:true})
          expect(response.originPostOffice).to.be.an('object').that.has.property('street');
        })
        it('false - should only provide location name', async function () {
          let response = await client.trackPackage('testp0',{details:false})
          expect(response.originPostOffice).to.be.an('string');
        })
      })
      context('and options.language is', function(){
        it('defined and supported - should provide information in that language', async function () {
          let response = await client.trackPackage('testp0',{language:'PL'})
          expect(response.originCountry).to.equal('Polska')
        })
        it('defined and unsupported - should revert to default language', async function () {
          let response = await client.trackPackage('testp0',{language:'ES'})
          expect(response.originCountry).to.equal('Poland')
        })
        it('not defined - should revert to default language', async function () {
          let response = await client.trackPackage('testp0',{})
          expect(response.originCountry).to.equal('Poland')
        })
      })
    })
  })
  describe('#getMaxPackagesPerRequest()',function(){
    let client;
    before ( async function (){
      client = await polishpost.connect({username:'sledzeniepp',password:'PPSA'})
    })
    it('should resolve with the number of allowed packages',function(){
      expect(client.getMaxPackagesPerRequest()).to.eventually.be.equal(1);
    })
  })
  describe('#setDefaultLanguage(language)',function(){
    let client;
    before ( async function (){
      client = await polishpost.connect({username:'sledzeniepp',password:'PPSA'})
    })
    context('if provided language is',function(){
      it('supported - change the default language',function(){
        expect(client.getDefaultLanguage()).to.be.equal('EN');
        client.setDefaultLanguage('PL');
        expect(client.getDefaultLanguage()).to.be.equal('PL');
      })
      it('not supported - not change the default language ',function(){
        client.setDefaultLanguage('EN');
        expect(client.getDefaultLanguage()).to.be.equal('EN');
        client.setDefaultLanguage('ES');
        expect(client.getDefaultLanguage()).to.be.equal('EN');
      })
    })
  })
})