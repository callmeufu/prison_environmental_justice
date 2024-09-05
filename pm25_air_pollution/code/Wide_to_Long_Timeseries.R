dir <- './Documents/Dissertation/Data/pm_25/V5_GL_04/pm25_annual_conc/1998_2022_pm25.csv'

df <- read.csv(dir)

# dir <- './Documents/Dissertation/Data/pm_25/V5_GL_03/Data/Time_Series_Means.csv'
# df_old <- read.csv(dir)


#Construct dataframe with desired output shape
output <- rep(df$FACILITYID, each = 25)
output <- data.frame(output, rep(df$STATE, each = 25), rep(df$POPULATION, each = 25), 
                     rep(df$SOURCEDATE, each = 25), rep(df$TYPE, each = 25), rep(1998:2022, nrow(df)))
names(output) <- c("FACILITYID", "STATE", "POPULATION", "SOURCEDATE", "TYPE", "YEAR")
output$value <- 0

#Add in pm2.5 values
for (i in 1998:2022)
{
  output[output$YEAR == i, ]$value <- df[, i-1996]
  
}

write.csv(output, "./Documents/Dissertation/Data/pm_25/V5_GL_04/pm25_annual_conc/1998_2022_pm25_long.csv")
