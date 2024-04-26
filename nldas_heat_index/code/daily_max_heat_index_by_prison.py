import pandas as pd
import math
import numpy as np

# Load the data
df = pd.read_csv(r"C:\Users\HP\Downloads\nldas_westStates_sub1_1990_2023.csv") #replace this with megadataset holding all years, temperatures, and humidities
# p_2 =  31.714725 #(hpa) - vapor pressure at 25 degrees celsius


# L_v = 2.5*(10**6) #(j/kg) #latent heat of vaporization for water
A_1 = 17.625 #experimental coefficient value from Lawrence (2005)
B_1 = 243.04 # (C) experimental coefficient value from Lawrence (2005)


# Define a function to calculate the heat index
def calculate_heat_index(temp, specific_humidity, surface_pressure):
   
    #final new equations from final correpsondence with textbook sources
    partial_vapor_pressure_final = (surface_pressure*specific_humidity)/(0.622 + specific_humidity*(1+0.622)) #source - https://pressbooks-dev.oer.hawaii.edu/atmo/chapter/chapter-4-water-vapor/
    saturation_vapor_pressure_final =  610.94* np.exp((A_1*temp)/(B_1+temp)) #source - Lawrence (2005)
    relative_humidity_final = 100 * (partial_vapor_pressure_final/saturation_vapor_pressure_final)

    temp = temp*(9/5) + 32 #converting temperature to fahrenheit for heat index calculation
    # Replace this with the actual formula for calculating heat index
    global heat_index 
    #base equation fxor heat index, courtesy of https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
    #heat index equation useful for heat indexes near 80 degrees
    heat_index_steadman = 0.5*(temp+61.0+(temp-68)*1.2+relative_humidity_final*0.094)
    heat_index = heat_index_steadman
    if heat_index > 80: 
        heat_index = (-42.379 + 2.04901523*(temp) + 10.14333127*(relative_humidity_final) - .22475541*(temp)*(relative_humidity_final) - .00683783*(temp)*(temp) - .05481717*relative_humidity_final*relative_humidity_final 
        + .00122874*temp*temp*relative_humidity_final + .00085282*temp*relative_humidity_final*relative_humidity_final - .00000199*temp*temp*relative_humidity_final*relative_humidity_final)
        if relative_humidity_final < 13 and temp in range(80, 112):  #heat_index condition for given parameters
            heat_index = heat_index - ((13-relative_humidity_final)/4)*math.sqrt((17-abs(temp-95))/17)
        elif relative_humidity_final > 85 and temp in range(80, 88): #heat_index condition for given parameters
            heat_index = heat_index + ((relative_humidity_final-85)/10) * ((87-temp)/5)
        else: #heat index for all other paramters   
            heat_index = heat_index
    else:
        heat_index = heat_index_steadman
    return heat_index

def heat_index_risk_level(heat_index):
    level1= 'Caution'
    level2 = 'Extreme Caution'
    level3 = 'Danger'
    level4 = 'Extreme Danger'
    #heat index levels determined from: https://www.weather.gov/ama/heatindex
    if heat_index < 91:
        return level1
    elif heat_index < 103:
        return level2
    elif heat_index < 126:
        return level3
    elif heat_index < 139:
        return level4
    else:
        return ('no risk level avail')
# Calculate max heat index per day for each facility
df['max_heat_index'] = df.apply(lambda row: calculate_heat_index(row['temperature'], row['specific_humidity'], row['pressure']), axis=1)
df['heat_index_risk_level'] = df['max_heat_index'].apply(heat_index_risk_level)

df = df.rename(columns={"Date": "DateTime"})
# Convert date column to datetime type
df['DateTime'] = pd.to_datetime(df['DateTime'])

# Extract date components
df['Date'] = df['DateTime'].dt.date
df['Date'] = pd.to_datetime(df['Date'])
df = df.drop(columns=['Month'])


# Group by facility and date, then calculate max heat index for each group
max_heat_index_per_day = df.groupby(['FACILITYID', pd.Grouper(key='Date', freq='D')])['max_heat_index'].max().reset_index()


final_df = pd.merge(df, max_heat_index_per_day, on=['FACILITYID', 'Date', 'max_heat_index'], how='inner')

# Drop unnecessary columns and rename temperature column
final_df = final_df.drop(columns=['.geo'])
final_df = final_df.rename(columns={"temperature": "temperature (Celsius)"})
# df = df.drop(columns=['.geo'])
# df = df.rename(columns={"temperature": "temperature (Celsius)"})

# Save the updated dataframe to a new CSV file
# df.to_csv(r'C:\Users\HP\Downloads\nldas_northeast_1990_2023_maxheatindex.csv', index=False) #update this output datafile with new max heat index value
final_df.to_csv(r"C:\Users\HP\Downloads\nldas_westStates_sub1_1990_2023_maxheatindex.csv", index=False)
print("Successfully updated CSV with max heat index per day for each facility.")
#r'C:\Users\HP\Downloads\nldas_south_1_1990_2023_maxheatindex.csv