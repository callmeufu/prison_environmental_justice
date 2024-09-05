# Documentation for development of Prison PM2.5 Air Pollution Dataset

## Particulate Matter 2.5 Air Pollution Processing and Analysis 

1. **Prison Data:** We obtain information on the boundaries of 1,593 prisons in the contiguous U.S. from the dataset [state_fed_prisons.csv](../prison_datasets/state_fed_prisons.csv) developed by Ovienmhada et al 2024 and located in this repository.
2. **Loading PM2.5 Data:** We obtained annual mean PM2.5 surface concentrations from 'V5.GL.04' of the [dataset developed by van Donkelaar et al. (2021)](https://sites.wustl.edu/acag/datasets/surface-pm2-5/), which combines Aerosol Optical Depth (AOD) retrievals from several satellite instruments with the GEOSChem chemical transport model, and ground-based observations (van Donkelaar et al., 2021).
  - We used the version of the dataset gridded at 0.01° × 0.01° (˜1km) for the years 1998 – 2022.
  - We converted these files from NetCDF to TIF for usability using the code [NC_to_Tif_Loop.R](./code). These TIFs are located in `./output`
3. **Constructing PM2.5 Time series:** We estimated annual PM2.5 averages for each year from 1998 – 2022 for 1,593
prisons by averaging gridded values within the prison boundaries weighted by the intersecting areas
  - The code [zonal_stats_to_dataframe.R](./code) computes PM2.5 values for each year (1998 to 2022) at each prison facility using zonal statistics. The output [1998_2022_pm25.csv](./output), is a csv/dataframe
  - We reformatted the dataframe from wide to long for usability purposes using the code [Wide_to_Long_Timeseries.R](./code), see output file [1998_2022_pm25_long](./output). This version is used in the research studies
