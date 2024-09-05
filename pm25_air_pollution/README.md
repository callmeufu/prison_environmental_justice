# Documentation for development of Prison PM2.5 Air Pollution Dataset

## Prison data 
1. We obtain information on the boundaries of 1,593 prisons in the contiguous U.S. from the dataset [state_fed_prisons.csv](../prison_datasets/state_fed_prisons.csv) developed by Ovienmhada et al 2024 and located in this repository.

## Particulate Matter 2.5 Air Pollution Processing and Analysis 

1. **Loading Data:** We obtained annual mean PM2.5 surface concentrations from V5.GL.04 of the dataset developed by van Donkelaar et al. (2021), which combines Aerosol Optical Depth (AOD) retrievals from several satellite instruments with the GEOSChem chemical transport model, and ground-based observations (van Donkelaar et al., 2021).
  - We used the version of the dataset gridded at 0.01° × 0.01° (˜1km) for the years 1998 – 2022.
  - We converted these files from NetCDF to TIF for workability using the code [NC_to_Tif_Loop.R](./code)

2. **Constructing PM2.5 Time series:** We estimated annual PM2.5 averages for each year from 1998 – 2022 for 1,593
prisons by averaging gridded values within the prison boundaries weighted by the intersecting
areas
  - We manually used zonal statistics in QGIS to get PM2.5 values for each year at each facility. The outputted shapefiles from this process is in `./zonal_statistics_data`
  - The script [Zonal_Statistics_Timeseries.R](./code) combines the data from these shapefiles into one dataframe, [Time_Series_Means](./output)
  - We reformatted the dataframe from wide to long for workability purposes using the code [Wide_to_Long_Timeseries.R](./code), see output file [Long_Time_Series_Means](./output). This version is used in the research studies
