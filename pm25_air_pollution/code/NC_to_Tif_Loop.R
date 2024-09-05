library(raster)
library(ncdf4)

# Set the input and output directories
input_dir <- './Documents/Dissertation/Data/pm_25/V5_GL_04/nc_files'
output_dir <- './Documents/Dissertation/Data/pm_25/V5_GL_04/tif_files'

# Get a list of all NetCDF files in the input directory
nc_files <- list.files(path = input_dir, pattern = "\\.nc$", full.names = TRUE)

for (path in nc_files) {
  # Open the NetCDF file
  ncfile <- ncdf4::nc_open(path)
  
  # Extract variable name
  varname <- names(ncfile$var)[1]
  
  # Create raster stack from NetCDF file
  nc2raster <- raster(path, varname = varname, band = 1)
  
  # Extract the relevant part of the file name for the output
  output_name <- substr(basename(path), 32, 35)  # Assuming the pattern is consistent
  
  # Change the output path for each file
  output <- file.path(output_dir, paste0(output_name, ".tif"))
  
  # Write raster to GeoTIFF
  writeRaster(nc2raster, output, format = 'GTiff', overwrite = TRUE)
  
  # Close the NetCDF file
  ncdf4::nc_close(ncfile)
}

# Optionally, you can include additional visualization or analysis steps outside the loop if needed.
