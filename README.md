# polishpost-tracking
A simple NodeJS wrapper for the Polish Post's SOAP package tracking API. The heavy lifting is done by [node-soap](https://github.com/vpulim/node-soap), this package just provides some convenience methods and translates the responses.

## Usage

```
npm install polishpost-tracking
```

```javascript
const polishpost = require('polishpost-tracking')

const client = await polishpost.connect({
  username: 'username',
  password: 'password'
})

const package = await client.trackPackage('RR0123456789PL')
```

## Dependencies

- [node-soap](https://github.com/vpulim/node-soap)

# Module

## connect(options)
Creates a new client for the Polish Post's tracking API. Returns a `Promise` that resolves with a [`PolishPostTrackingClient`](#polishposttrackingclient) instance.

### Options
- `username` & `password` - required, username & password for the Polish Post's SOAP service
- `language` - the default language for tracking results as an `ISO 3166-1` `Alpha-2` code (only `PL` and `EN` are supported), defaults to `EN`
- `commercial` - whether the client should use the commercial version of the service, defaults to `false` 
- `testConnection` - whether the client should perform a test SOAP request to validate the provided credentials, defaults to `true`

# PolishPostTrackingClient

## trackPackage(trackingNumber[, options])
Retrieves tracking data for a single package from the Polish Post's tracking API. Return a `Promise` that resolves with the package data.
### Options
- `details` - whether detailed data should be included with transit points (full address, latitude & longitude, working hours of the post office), otherwise only the transit point's name is provided, defaults to `false`
- `language` - the language for tracking results as an `ISO 3166-1` `Alpha-2` code (only `PL` and `EN` are supported), defaults to the language set in the client

## trackMultiplePackages(trackingNumbers[, options])
The same as `client.trackPackage` but accepts an `Array` of tracking numbers.

## getMaxPackagesPerRequest()
Retrieves the maximum amount of packages that can be tracked with one request with the connected account. Returns a `Promise` that resolves with the maximum number.

## setDefaultLanguage(languageCode)
Sets the default language for tracking results. Like the `language` option in `connect`, it accepts an `ISO 3166-1` `Alpha-2` code (only `PL` and `EN` are supported).

## getDefaultLanguage()
Returns the client's current default language for tracking results in the form of an `ISO 3166-1` `Alpha-2`.

## testConnection()
Performs a test API call to the Polish Post's server. Returns a `Promise` that fulfills if the call was successful and rejects if it was unsuccessful. This is performed automatically whenever a new client is created, unless you pass `testConnection: false` to `connect`'s options.

##

# Errors

## PolishPostTrackingClientError

Thrown when a SOAP request to the Polish Post's server fails. It relays the error message from the server. This should only happen if you pass invalid credentials to `connect`, unless you set `testConnection` to `false` in which case it can happen during any call.

## PolishPostTrackingError

Thrown when the request is valid but was unsuccessful in retrieving tracking data. This can happen if:
- the provided tracking number is invalid or no tracking information was found
- you request data for more packages at once than the account is allowed to

# Notes on the Polish Post API
The Polish Post actually provides two package tracking APIs - a public one and a commercial one. They are identical in function but operate on different domains and require different `WSDL` files.

## Using the public API

- Get the public credentials [here](http://www.poczta-polska.pl/webservices/)
- The public account is restricted to only requesting data about one package at a time - only use `client.trackPackage` for your requests

## Using the commercial API

- Set `commercial` to `true` in the options for `connect`
- While using `client.trackMultiplePackages`, make sure to not request data for more packages than `client.getMaxPackagesPerRequest` indicates you can
- I have not yet had the chance to properly test the commercial service integration as I am still waiting for my own credentials

# To do

- Work on missing package type & status code translations
- Test the commercial service integration
- Expand tests to verify package data more thoroughly

# License

MIT License

Copyright (c) 2020 Kamil Szydlowski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.