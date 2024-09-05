# Prison environmental justice

This is the working repository for an ongoing research project in part supported by NASA ROSES-21 A.49 Earth Science Applications: Equity and Environmental Justice funded grant (Award No 80NSSC22K1673) titled "EVDT Integrated Modeling Framework Applied to Measure Environmental Injustice and Socioeconomic Disparities in Prison Landscapes" and a grant from MIT’s IDSS Initiative on Combating Systemic Racism. This work was also supported by resources from the Reuters news agency and the Brown Institute for Media Innovation at Columbia University.

The purpose of this project is to develop time-series datasets and analysis of spatiotemporal patterns of prison exposure to air pollution, air temperature, land surface temperature, and other environmental risk factors. This repository describes the workflow used to carry out the spatial analysis, from data retrieval to producing the final datasets that are hosted (here). Below are further details on the repository structure, how to use the code, and data sources. Please send any questions reguarding this repository to Ufuoma Ovienmhada (ufuoma@mit.edu). Please cite as using the DOI: [10.5281/zenodo.13313914](https://doi.org/10.5281/zenodo.13313915)  

## Folder Descriptions
- `prison_datasets` Includes data in geographic boundaries of carceral facilities (prisons, jails, and immigrant detention center) and a prison specific dataset
- `daymet_air_temp` Includes python code and output data using the [Daymet v4](https://daymet.ornl.gov/overview) air temperature model to compute statistics in prison landscapes
- `pm25_air_pollution` Includes python code and output data using the [Washington University St. Louis](https://sites.wustl.edu/acag/datasets/surface-pm2-5/) particulate matter 2.5 air pollution concentrations to compute statistics in prison landscapes
- `ac_datasets` Includes information on ac availability in a fraction of U.S. prisons obtained via the Freedom of Information Act
- `nldas_heat_index` Includes python code and output data using NASA's North American Land Data Assimilation System (NLDAS) data on air temperature and humidity to compute heat index statistics in prison landscapes
- `climate-projections` Includes python code and output data using the [NASA Earth Exchange (NEX) Downscaled Climate Projections (NEX-DCP30)](https://www.nccs.nasa.gov/services/data-collections/land-based-products/nex-dcp30)

We thank the Campaign to Fight Toxic Prisons for their research collaboration and for the formerly and currently incarcerated people impacted by toxic prisons that motivate and inform this work.
