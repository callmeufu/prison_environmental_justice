#import required libraries
#library(raster)
library(terra)
library(Gmisc)

# Set the base directory
base_dir <- './Documents/Dissertation/Data/pm_25/V5_GL_04'

#list files (in this case raster TIFFs)
ff <- list.files(pathJoin(base_dir, "/tif_files"), pattern = "\\.tif$", full=TRUE)

#create a raster stack
s <- rast(ff)

#read-in the polygon shapefile - prison polygons, N = 2,102
#poly <- vect(pathJoin(base_dir, "/filtered_hifld_shp/filtered_hifld_shp.shp"))
poly <- vect("./Documents/Dissertation/Data/raw_hifld/state_federal_cis/state_federal_cis.shp")

#extract raster cell count (sum) within each polygon area (poly)
ex <- extract(s, poly, fun='mean', na.rm=TRUE)

#write to a data frame
df <- data.frame(ex)
df$FACILITYID <- poly$FACILITYID
df$STATE <- poly$STATE
df$POPULATION <- poly$POPULATION
df$SOURCEDATE <- poly$SOURCEDATE
df$TYPE <- poly$TYPE
df = subset(df, select = -c(ID) )

#write to a CSV file
write.csv(df, file = pathJoin(base_dir, "/pm25_annual_conc/1998_2022_pm25.csv"))
