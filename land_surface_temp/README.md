# Documentation for development of Prison Land Surface Temperature (LST) Dataset

## LST Processing and Analysis 
This directory contains 'LST_Main', which is a JavaScript file to be used on Google Earth Engine, and 'LST_DataCleaning', which is an RMarkdown file. 'LST_Main' pulls Landsat data, merges and filters image collections, and computes the mean and maximum LST per summer per facility. 'LST_DataCleaning' merges, cleans, and formats all files computed by LST_Main. Additionally, this directory contains the final LST CSV files for the time frame 1990 - 2023 (Users can run the code for different time periods as desired).

**Land Surface Temperature Data:** We used pre-processed data products that provides land surface temperature for the Landsat 4 – 9 satellites at 30-meter resolution, calculated using a single-channel algorithm jointly created by the Rochester Institute of Technology (RIT) and NASA Jet Propulsion Laboratory (JPL). 

**Processing:** We applied additional processing steps in Google Earth Engine (GEE) to merge data from all five satellites into a single collection, mask clouds using the provided quality assurance bands, and compute annual summer means of LST for each prison polygon for the full study period. 

- 'US_Mean_LST_1990_2023.csv' contains a prisons average summer LST for a given year
- 'US_Max_LST_1990_2023.csv' contains a prisons max summer LST for a given year

We thank Mia Hines-Shanks who led the code development for this portion of the work.
