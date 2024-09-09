![image](https://github.com/user-attachments/assets/0e335ca5-4649-4051-9e9e-08cdb12e9837)

# Prison environmental justice

This is the working repository for an ongoing research project in part supported by NASA ROSES-21 A.49 Earth Science Applications: Equity and Environmental Justice funded grant (Award No 80NSSC22K1673) titled "EVDT Integrated Modeling Framework Applied to Measure Environmental Injustice and Socioeconomic Disparities in Prison Landscapes" and a grant from MIT’s IDSS Initiative on Combating Systemic Racism. This work was also supported by personnel and resources from the Reuters news agency and the Brown Institute for Media Innovation at Columbia University.

The purpose of this project is to develop time-series datasets and analysis of spatiotemporal patterns of prison exposure to air pollution, air temperature, land surface temperature, and other environmental risk factors. This repository describes the workflow used to carry out the spatial analysis, from data retrieval to producing the final datasets that are hosted (here). Below are further details on the repository structure, how to use the code, and data sources. Please send questions reguarding this repository to Ufuoma Ovienmhada (ufuoma@mit.edu). Please cite using the DOI: [10.5281/zenodo.13313914](https://zenodo.org/doi/10.5281/zenodo.13313914)

## Folder Descriptions
- `prison_datasets` Includes data in geographic boundaries of carceral facilities (prisons, jails, and immigrant detention center) and a prison specific dataset
- `daymet_air_temp` Includes python code and output data using the [Daymet v4](https://daymet.ornl.gov/overview) air temperature model to compute statistics in prison landscapes
- `pm25_air_pollution` Includes python code and output data using the [Washington University St. Louis](https://sites.wustl.edu/acag/datasets/surface-pm2-5/) particulate matter 2.5 air pollution concentrations to compute statistics in prison landscapes
- `nldas_heat_index` Includes python code and output data using NASA's North American Land Data Assimilation System (NLDAS) data on air temperature and humidity to compute heat index statistics in prison landscapes
- `climate-projections` Includes python code and output data for temperature projections in prison landscapes using the [NASA Earth Exchange (NEX) Downscaled Climate Projections (NEX-DCP30)](https://www.nccs.nasa.gov/services/data-collections/land-based-products/nex-dcp30)*

*For questions specifically related to the `climate-projections` data, please contact Michael Krisch (mkrisch@columbia.edu)

We thank the Campaign to Fight Toxic Prisons for their research collaboration and for the formerly and currently incarcerated people impacted by toxic prisons that motivate and inform this work.
