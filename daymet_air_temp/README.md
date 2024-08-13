## Data Preprocessing

1. **Loading and Cleaning Data:**
  - The raw prison boundaries data was read into a GeoDataFrame (prisonsRaw) and ensured that the FACILITYID column is treated as a string.
  - The [clean list of prisons](./Input) was loaded into a DataFrame (prisonsClean), also ensuring the FACILITYID column is treated as a string.
  - The raw data was filtered to include only those prisons whose FACILITYID was present in the clean list. The filtered data was then deep-copied to create prisonsFinal.
2. **Geometric Transformation:**
  - The filtered dataset was reprojected to the EPSG:2163 coordinate reference system to ensure accurate spatial calculations for centroid determination.
  - The centroids of the reprojected geometries were calculated to enhance the efficiency of temperature data retrieval. Using centroids, rather than the full geometries, significantly reduces processing time while still providing accurate temperature data. Given that averaging temperatures across a small polygon typically yields results very similar to those of its centroid, the additional computational effort required to process full geometries is unnecessary.
  - A new GeoDataFrame (prisons_centroids) was created, containing the original attributes and the computed centroids.
  - The centroids GeoDataFrame was reprojected back to the WGS84 coordinate reference system (EPSG:4326), which is the default CRS for Daymet coordinate queries.

## Air Temperature Processing and Analysis 
[Daymet](https://daymet.ornl.gov/overview) is a data product derived from a collection of algorithms and computer software designed to interpolate and extrapolate from daily meteorological observations to produce gridded estimates of daily weather parameters. Weather parameters generated include daily surfaces of minimum and maximum temperature, precipitation, vapor pressure, radiation, snow water equivalent, and day length produced on a 1 km x 1 km gridded surface. The choice of Daymet for air temperature was selected because it is high in spatial resolution and offers spatially continuous measurements up to the most recently completed calendar year.

The primary code for this analysis is <here>
1. **Global Variables:**
- Defined variables for the date range (first_day_summer and last_day_summer), the start and end years (begin_year and end_year), and placeholder variables (prisons_shapes, time_series, csv_writer) used across functions.
2. **Temperature Conversion and Heat Estimation:**
- **Conversion Function:** celsius_to_fahrenheit converts Celsius temperatures to Fahrenheit.
- **Mean Calculation Function:** calc_mean computes the daily mean temperature in Fahrenheit.
- **Extreme Heat Estimation Function:** estimate_extreme_heat identifies days where the temperature exceeds a given threshold.
3. **Heatwave Calculation:**
- **Heatwave Definition:** A heatwave is defined as a period where the daily maximum temperature exceeds the 90th percentile of maximum temperatures for the given period.
- **Heatwave Calculation Function:** calculate_heatwaves calculates the number of single-day, two-day, and three-or-more-day heatwaves based on daily maximum temperatures.
4. **Heat Statistics Retrieval:**
- **Function get_heat_stats:** This function retrieves and processes heat statistics for each prison over a range of years.
  - It queries the Daymet Single Pixel Extraction API for daily maximum (tmax) and minimum (tmin) temperatures for each prison's centroid coordinates. The API call is constructed with the latitude and longitude of the prison centroid and the desired variables (tmax, tmin, vp), as well as the date range (start and end dates of summer for each year). For this study, summer is defined as June 1 through August 31.
    - tmax = Daily maximum 2-meter air temperature (°C)
    - tmin = Daily minimum 2-meter air temperature (°C)
    - vp = Water vapor pressure (Pa)
  - The function converts temperatures from Celsius to Fahrenheit, calculates daily mean temperatures, and computes various summer statistics:
    - **Summer Mean Temperature:** The average of daily mean temperatures.
    - **Summer Maximum Temperature:** The average of daily maximum temperatures.
    - **90th Percentile Temperature:** The 90th percentile of daily maximum temperatures, which is used as a threshold to define heatwaves.
    - **Count of Extreme Heat Days:** The number of days where the mean temperature exceeds the summer mean temperature by more than 10°F, and the number of days where the mean temperature exceeds 85°F.
  - The function also calculates heatwaves (according to the definition from Skarha et al. (2023) using the precomputed 90th percentile temperature:
    - **Single-Day Heatwaves (heatwave1):** Count of days where the maximum temperature exceeds the 90th percentile for one day.
    - **Two-Day Heatwaves (heatwave2):** Count of periods where the maximum temperature exceeds the 90th percentile for two consecutive days.
    - **Three-or-More-Day Heatwaves (heatwave3):** Count of periods where the maximum temperature exceeds the 90th percentile for three or more consecutive days.
5. **Data Processing Workflow:**
- The prisons_centroids GeoDataFrame was split into 10 chunks for parallel processing.
- Function **process_dataset:** This function processes each chunk of the dataset, retrieves heat statistics, and logs the progress.
It uses a ThreadPoolExecutor to parallelize the get_heat_stats function for each prison in the chunk.
Results from each chunk are concatenated into a single DataFrame.
6. **Combining and Saving Results:**
- All processed chunks were combined into a single DataFrame.
- The combined DataFrame was saved as a CSV file, containing the processed heat statistics for all prisons over the specified range of years.
