
const codes = {
	countryCodes : require('./codes/country_codes.json'),
	statusCodes : require('./codes/status_codes.json'),
	packageTypes : require('./codes/package_types.json'),
}

function transformPackageData(data) {
  data = data.danePrzesylki;

  const packageData = {
    number : data.numer,
    originCountry : data.kodKrajuNadania,
    destinationCountry : data.kodKrajuPrzezn,
    shippingDate : new Date(data.dataNadania).getTime()/1000,
    packageType : data.kodRodzPrzes,
    serviceFinished : data.zakonczonoObsluge,
    packageMass : data.masa ? Math.round(data.masa*1000) : undefined,
    packageFormat : data.format,
    originPostOffice : transformTransitPointData ( data.urzadNadania ),
    destinationPostOffice : transformTransitPointData ( data.urzadPrzezn ),
    events : transformEvents ( data.zdarzenia.zdarzenie )
  };

  return packageData;
}

function transformEvents ( data ) {
  return data.map ( edata => {
    return {
      time : new Date(edata.czas).getTime()/1000,
      code : edata.kod,
      final : edata.konczace,
      transitPoint : transformTransitPointData(edata.jednostka)
    }
  })
}

function transformTransitPointData ( data ) {
  if ( data.daneSzczegolowe ) {
    return {
      name : data.nazwa,
      ...transformTransitPointDetails(data.daneSzczegolowe)
    }
  }
  return data.nazwa;
}

function transformTransitPointDetails ( data ) {
  
  const details = {
    longitude : data.dlGeogr,
    latitude : data.szerGeogr,
    street : data.ulica,
    streetNumber : data.nrDomu,
    subNumber : data.nrLokalu,
    postCode : data.pna,
    city : data.miejscowosc
  }

  if ( data.godzinyPracy ) {
    const openHours = {};
    if ( data.godzinyPracy.dniRobocze ) {
      openHours.workdays = {
        hours : data.godzinyPracy.dniRobocze.godziny,
        notes : data.godzinyPracy.dniRobocze.uwagi
      }
    }
    if ( data.godzinyPracy.soboty ) {
      openHours.saturdays = {
        hours : data.godzinyPracy.dniRobocze.godziny,
        notes : data.godzinyPracy.dniRobocze.uwagi
      }
    }
    if ( data.godzinyPracy.niedzISw ) {
      openHours.sundaysAndHolidays = {
        hours : data.godzinyPracy.dniRobocze.godziny,
        notes : data.godzinyPracy.dniRobocze.uwagi
      }
    }
    details.openHours = openHours;
  }
  return details;
}

module.exports = transformPackageData;