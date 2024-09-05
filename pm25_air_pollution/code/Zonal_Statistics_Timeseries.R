#Create dataframe to store results:
library(foreign)

names_df <- read.dbf("/Users/westnoteast/Library/CloudStorage/GoogleDrive-andrew.west@yale.edu/My Drive/MSRP Extension/Global Analysis/Data/Zonal_Statistics_Data/1998.dbf")
names <- names_df$NAME

df <- data.frame(names = names, matrix(0, nrow = length(names), ncol = 24))
colnames(df) <- c("names", 1998:2021)


#Read through results one by one
for (i in 1998:2021)
{
  path <- paste0("/Users/westnoteast/Library/CloudStorage/GoogleDrive-andrew.west@yale.edu/My Drive/MSRP Extension/Global Analysis/Data/Zonal_Statistics_Data/", i, ".dbf")
  current <- read.dbf(path)
  df[, i-1996] <- current$X_mean
  
}

df$FACILITYID <- names_df$FACILITYID

write.csv(df, "/Users/westnoteast/Library/CloudStorage/GoogleDrive-andrew.west@yale.edu/My Drive/MSRP Extension/Time Series Means/Code:Results/Time Series Means.csv")

