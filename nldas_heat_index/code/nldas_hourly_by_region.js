var table = ee.FeatureCollection("projects/ee-ufuoma/assets/state_fed_prisons_droppedCols"),
    states = ee.FeatureCollection("TIGER/2018/States");

//~~~~~~~~~~~~~~~~~~~~ USER ACTION REQUIRED ~~~~~~~~~~~~~~~~~~~~~~~~ //
// Toggle comments on/off for region of interest. GEE can handle about one to two chunks at a time

// Define groups of states 
// Northeast States
// var northeastStates = ["Connecticut", "Maine", "Massachusetts", "New Hampshire", "New Jersey", "New York", "Pennsylvania", "Rhode Island", "Vermont"]; //- COMPLETE

// Midwest States
// var midwestStates_sub1 = ["Illinois", "Indiana", "Iowa", "Kansas", "Michigan", "Minnesota"]; //- COMPLETE
// var midwestStates_sub2 = ["Missouri", "Nebraska", "North Dakota", "Ohio", "South Dakota", "Wisconsin"] // - COMPLETE

// South States
// var southStates_sub1 = ["Alabama", "Florida", "Georgia","Arkansas", "Kentucky", "Louisiana"] //- COMPLETE
// var southStates_sub2 = ["Delaware", "Maryland", "Mississippi", "North Carolina", "Oklahoma"] // - COMPLETE
// var southStates_sub3 = ["South Carolina", "Virginia", "West Virginia"]; // - COMPLETE
// var southStates_sub4 = ["Tennessee", "Texas"]; // - COMPLETE

// West States
// var westStates_sub3 = [ "Idaho", "Montana", "Utah", "Wyoming"]; // - COMPLETE
// var westStates_sub1 = ["Arizona", "California", "Colorado"] // - COMPLETE
// var westStates_sub2 = ["New Mexico", "Washington", "Oregon"] // - COMPLETE
// var dc = ["District of Columbia"] // COMPLETE

//~~~~~~~~~~~~~~~~~~~~ USER INPUT REQUIRED ~~~~~~~~~~~~~~~~~~~~~~~~ //

// Define start and end years of study
var startYear = '1990-01-01';
var endYear = '2023-12-31';

// date from June 1 to Aug 31st
var MONTH_RANGE = ee.Filter.calendarRange(6, 8, 'month')

// update 'list' based on region of interest
var list = northeastStates

// update vars for file naming
var year_start_str = '1990'
var year_end_str = '2023'
var region = 'northeastStates_'
var desc = 'northeastStates_' + region + year_start_str + '_' + year_end_str

// ---------- Prep Region of prisons ---------//
var regionBounds = states.filter(ee.Filter.inList('NAME', list))
Map.addLayer(regionBounds)

var prisons_fc = ee.FeatureCollection(table)
  .map(function(feature) {
    var num = ee.Number.parse(feature.get('FACILITYID'));
    return feature.set('FACILITYID', num);
  });
  
var prisons_by_state = prisons_fc.filterBounds(regionBounds) // prisons for given state
Map.addLayer(prisons_by_state)

// ------------ Prep Image Collection ---------//

// Filter image collection by years, doy, and region
var nldas = ee.ImageCollection('NASA/NLDAS/FORA0125_H002').filterBounds(regionBounds).filterDate(startYear, endYear).
filter(MONTH_RANGE).select(['temperature', 'specific_humidity', 'pressure'])


// -------- Main Function to get NLDAS variables for each prison ------//

// Calculate mean climate variables for each prison per nldas hourly
// time step. The result is a FeatureCollection of FeatureCollections.
var prisonsNLDAS = nldas.map(function(image) {
  
  var reducedNLDASdayhour = image.reduceRegions({
    collection: prisons_by_state,
    reducer: ee.Reducer.mean(),
    scale: 100,
    crs: 'EPSG:4326'
  });
  
  var datetime = ee.Date(image.get('system:time_start'))
  
  // Add properties for date, year, month, and hour
  var reducedData = reducedNLDASdayhour.map(function(feature) {
    return feature.set({
      'Date': datetime,
      'Year': datetime.get('year'),
      'Month': datetime.get('month'),
      'Hour': datetime.get('hour')
    });
  });
  
  return reducedData
});

// Note that a printed FeatureCollection of FeatureCollections is not
// recursively expanded, you cannot view metadata of the features within the
// nested collections until you isolate a single collection or flatten the
// collections.

prisonsNLDAS = prisonsNLDAS.flatten()
print(prisonsNLDAS.first())

Export.table.toDrive({
  collection: prisonsNLDAS,
  description: desc,
  fileFormat: 'CSV'
});

