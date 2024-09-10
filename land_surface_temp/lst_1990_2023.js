// Code was originally created my Mia Hines-Shanks

// --------------- CODE WAS USED IN GOOGLE EARTH ENGINE -------------------
//  ---------- IMPORT DATA 
var all_dhs_shp = ee.FeatureCollection("users/ufuoma/Prison_Boundaries-shp"), //this is the raw HIFLD dataset
state_fed_prisons = ee.FeatureCollection("projects/ee-ufuoma/assets/state_fed_prisons_droppedCols"); // dataset found in prison_datasets folder of this repo

var states = ee.FeatureCollection('TIGER/2018/States')

// --- DATA PREPARATION 
// -- Obj 1: simple join prisons_shape_fc and open_prisons_fc into a new fc
// simple join is commonly referred to as left join or left outer join
// created a filter to match the ID of each fc
var openFilter = ee.Filter.equals({
  leftField: 'FACILITYID',
  rightField: 'FACILITYID'
});

// created the join
var simpleJoinP = ee.Join.simple();

// applied the join 
// var interested_prisons_shapes = simpleJoinP.apply(prisons_shape_fc, open_prisons_fc, openFilter);
var interested_prisons_shapes = simpleJoinP.apply(all_dhs_shp, state_fed_prisons, openFilter);


// --------------------
// ---------- GLOBAL VARIABLES 
// date from June 1 to Aug 31st (in non-leap years this will go to Sept 1st)
var DATE_RANGE = ee.Filter.dayOfYear(152, 244);
var DISPLAY = true;

// studybounds will hold the image collection per state 
var STUDYBOUNDS; 

// will be our final filtered image or feature collection 
var prisons_shapes_state_buff; 

// variables will hold the FeatureCollections with ST avg and max of each year
var mean_each_year_prisonST = [];
var max_each_year_prisonST = [];

// will be the final array with all merged mean/max feature collections with all years in the study 
var mean_prisonST_all_years;
var max_prisonST_all_years;

// range of years of our image collection
var range_years = []; 

// array for band names 
// Landsat 8-9 band names
var LC_New_bands = ['ST_B10', 'QA_PIXEL'];
// Landsat 4-7 band names
var LC_Past_bands = ['ST_B6', 'QA_PIXEL']; 

// updated band names for each Landsat
var bandName = ['ST', 'QA_PIXEL'];

// will hold merged ST data from all landsats
var landsatST;

// will hold merged prison_facilities 
var prison_facilities_shapes_region = ee.FeatureCollection([]); 

var south = ['Texas', 'Louisiana', 'Arkansas', 'Oklahoma', 'Mississippi', 'Alabama', 'Georgia', 
              'West Virginia', 'Virginia', 'North Carolina', 'South Carolina', 'Florida', 
              'Kentucky', 'Tennessee'];
            
var midwest = ['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 
                'Minnesota', 'Iowa', 'Missouri', 'Wisconsin', 'Illinois', 
                'Indiana', 'Michigan', 'Ohio'];
                
var northeast = ['Maine', 'Vermont', 'New Hampshire', 'Massachusetts', 
                  'Rhode Island', 'Connecticut', 'New Jersey', 'Delaware', 
                  'Maryland', 'New York', 'Pennsylvania'];

var hi_and_ak = ["Hawaii", "Alaska"]; 
            
var west =  [ 'Washington', 'Oregon', 'California', 'Idaho', 'Nevada', 'Arizona', 
              'Montana', 'Wyoming', 'Utah', 'Colorado', 'New Mexico']

//var test = ['Washington', 'Oregon']

// ---------- FUNCTIONS 

// --- ARSET or Common Functions

// function is creating a mask for clouds
function cloudMask(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(1 << 3)
    .or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(mask.not());
}

// Create a funtion using Landsat scale factors for deriving ST in Kelvin and Celsius.
function applyScaleFactors(image) {
  var thermalBands = image.select('ST.*').multiply(0.00341802).add(149.0) // Scale factors for Kelvin
  .subtract(273.15); // Scale factor for degrees Celsius
  return image.addBands(thermalBands, null, true);
}


// --- MIA Created Functions 

// function that creates the range of years and places them in a array 
// we're interested in 1990 to 2022
function rangeYears(start_year, end_year) {
  for (var i = start_year; i < end_year; i++) {
    range_years.push(i)
  }
}

// --- MERGE LANDSAT Data. Data preparation. 
function mergeLandsat() {
// -- calling all datasets
  var L4 = ee.ImageCollection('LANDSAT/LT04/C02/T1_L2')
    .select(LC_Past_bands, bandName)
    .filterBounds(STUDYBOUNDS)
    .filter(DATE_RANGE)
    .map(cloudMask);

  var L5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
    .select(LC_Past_bands, bandName)
    .filterBounds(STUDYBOUNDS)
    .filter(DATE_RANGE)
    .map(cloudMask);
    
  var L7 = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
    .select(LC_Past_bands, bandName)
    .filterBounds(STUDYBOUNDS)
    .filter(DATE_RANGE)
    .map(cloudMask);
  
  var L8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .select(LC_New_bands, bandName)
    .filterBounds(STUDYBOUNDS)
    .filter(DATE_RANGE)
    .map(cloudMask);
  
  var L9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
    .select(LC_New_bands, bandName)
    .filterBounds(STUDYBOUNDS)
    .filter(DATE_RANGE)
    .map(cloudMask);
  
  // -- filter all image collections
  var filtered_L4 = L4.filter(ee.Filter.lt('CLOUD_COVER', 20));
  var filtered_L5 = L5.filter(ee.Filter.lt('CLOUD_COVER', 20));
  var filtered_L7 = L7.filter(ee.Filter.lt('CLOUD_COVER', 20));
  var filtered_L8 = L8.filter(ee.Filter.lt('CLOUD_COVER', 20));
  var filtered_L9 = L9.filter(ee.Filter.lt('CLOUD_COVER', 20));
  
  // -- merge image collections
  var LandsatColl = filtered_L4.merge(filtered_L5).merge(filtered_L7).merge(filtered_L8).merge(filtered_L9);
  
  // -- apply scale 
  landsatST = LandsatColl.map(applyScaleFactors);
}

/*
    prisonSTPerYear(year) 
    input --> integer, a year 
    output --> feature collection
    doesn't return, but updates global arrays, [stat]_each_year_prisonST
    description: insert a year. then it filters the Landset image collection and 
    returns a feature collection of both max ST and mean ST of each facility in the state. 
*/ 

function prisonSTPerYear(year) {
  
// bit is created for Hawaii error 
// skipping computation of years with the issues. 

//   if (year >= 1993 && year <= 1998) {
//     return 0;
//   }
  
  // creating the year filter. it's just one year. 
  var YEAR_RANGE = ee.Filter.calendarRange(year, year, 'year');
  
  // apply filter on image collection
  var landsatST_year = landsatST.filter(YEAR_RANGE);

  // mean of pixels in the image collection
  var mean_LandsatST = landsatST_year.mean();
  
  // structure the image collection to the state
  var clip_mean_ST = mean_LandsatST.clip(STUDYBOUNDS);
   
  
  // calculate the mean ST of each prison facility 
  var mean_per_prison_state_fc = clip_mean_ST.reduceRegions({
    collection: prisons_shapes_state_buff,
    reducer: ee.Reducer.mean(),
    scale: 30});
  
  // calculate the max ST of each prison facility 
  var max_per_prison_state_fc = clip_mean_ST.reduceRegions({
    collection: prisons_shapes_state_buff,
    reducer: ee.Reducer.max(),
    scale: 30});
    
  // selecting only Facility ID and ST from the recently computed mean ST feature collection
  var stat_mean_prison_state = mean_per_prison_state_fc.select({
    propertySelectors: ['ST', 'FACILITYID', 'STATE'],
    newProperties: ['ST_Mean', 'FACILITYID', 'STATE'], 
    retainGeometry: false
  })
  
  // selecting only Facility ID and ST from the recently computed max ST feature collection
  var stat_max_prison_state = max_per_prison_state_fc.select({
    propertySelectors: ['ST', 'FACILITYID', 'STATE'],
    newProperties: ['ST_Max', 'FACILITYID', 'STATE'],
    retainGeometry: false
  })
   
  // adding year to each stat ST feature collection
  var stat_mean_prison_state_year = stat_mean_prison_state.map(function(feature) {
    return feature.set('Year', year)
  });
  
    
  var stat_max_prison_state_year = stat_max_prison_state.map(function(feature) {
    return feature.set('Year', year)
  });
  
  // adding the computed statistics feature collections of a year of the state to the relevant holding array
  mean_each_year_prisonST.push(stat_mean_prison_state_year);
  max_each_year_prisonST.push(stat_max_prison_state_year);
  
  return 0;
}

/*
    mergeMeanPrisonFC(fc) or mergeMaxPrisonFC(fc)
    input --> a FeatureCollection
    output --> feature collection
    doesn't return, but updates global variables, [stat]_prisonST_all_years
    description: insert a feature collection. then it merges that feature collection to the 
    larger feature collection [stat]_prisonST_all_years.
*/ 

function mergeMeanPrisonFC(fc) {
  mean_prisonST_all_years = mean_prisonST_all_years.merge(fc);
  return 0;
}

function mergeMaxPrisonFC(fc) {
  max_prisonST_all_years = max_prisonST_all_years.merge(fc);
  
  return 0;
}

/*
    perState(state_name)
    input --> a string, name of state 
    output --> feature collection
    doesn't return, but updates global variables
    description: it calls all relevant functions to calculate max and mean ST per state for each year in time series
*/ 

    
function perState(state_name) {
  var state_shape = states.filter(ee.Filter.eq('NAME', state_name))
  
  // filter shape fc by a single state
  var prisons_shapes_state = interested_prisons_shapes.filterBounds(state_shape)
  
  // This function adds a 30m buffer to each feature.
  var addBuffer = function(feature) {
    return feature.buffer(30);
  };
  
  // apply buffer
  prisons_shapes_state_buff = prisons_shapes_state.map(addBuffer)
  
  //add to bigger array 
  prison_facilities_shapes_region = prison_facilities_shapes_region.merge(prisons_shapes_state_buff); 
  
  // interested images associated with our state
  var AOI = state_shape
  
  STUDYBOUNDS = AOI //aoi;
  
  // creating our image collection needed
  mergeLandsat(); 

  // calculate each prison facility within a state mean and maximum ST per year (within range_years)
  // and push each created FeatureCollection to `[stat]_each_year_prisonST`
  range_years.map(prisonSTPerYear);
}

function exportData(region, start_year, end_year) {
  
  // creating file names for each dataset
  var region_csv_name = 'Current_Prison_Facilities_';
  region_csv_name = region_csv_name.concat(region);
  
  var max_csv_name = 'Max_LST_'; 
  max_csv_name = max_csv_name.concat(region).concat('_').concat(start_year).concat('_').concat(end_year); 
  
  var mean_csv_name = 'Mean_LST_'; 
  mean_csv_name = mean_csv_name.concat(region).concat('_').concat(start_year).concat('_').concat(end_year); 
  
  max_prisonST_all_years = max_prisonST_all_years.map(function(f) {
    f = f.set(f.toDictionary().combine({ST_Max: 'NA'}, false))
    return f;
  });
  
  mean_prisonST_all_years = mean_prisonST_all_years.map(function(f) {
    f = f.set(f.toDictionary().combine({ST_Mean: 'NA'}, false))
    return f;
  });
  
  // exporting each dataset to drive 
  Export.table.toDrive({
    collection: prison_facilities_shapes_region,
    description: region_csv_name,
    fileFormat: 'CSV'
  });
  
  Export.table.toDrive({
    collection: max_prisonST_all_years,
    description: max_csv_name,
    fileFormat: 'CSV'
  });
  
  
  Export.table.toDrive({
    collection: mean_prisonST_all_years,
    description: mean_csv_name,
    fileFormat: 'CSV'
  });
}
// ---------- FUNCTION CALLS

// the end year is exclusive 
// computing approriate range of years
rangeYears(1990, 2024); 

// calling array of states to begin computation 
midwest.map(perState); 

//update variables to hold the first FeatureCollection in array
max_prisonST_all_years = max_each_year_prisonST.shift(); 
mean_prisonST_all_years = mean_each_year_prisonST.shift(); 

//update [stat]_prisonST_all_years to be big merged FeatureCollections, which includes each element in `each_year_prisonST`
max_each_year_prisonST.map(mergeMaxPrisonFC);
mean_each_year_prisonST.map(mergeMeanPrisonFC);

// export our computed datasets 
exportData('Midwest', 1990, 2023);
