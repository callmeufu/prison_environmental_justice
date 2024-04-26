# Import libraries
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
import numpy as np

"""
This code takes in daily max heat index for prisons from summer 1990 - 2023
It then calculates the summer max heat index for each prison (rather than daily) 
& the annual summer mean
"""

# Import Processed daily max heat index data
path = '/Users/ufuoma/Documents/Projects/Reuters/daily_max_hi/' #change path as needed
heat_index_df = pd.read_csv(path + 'nldas_westStates_sub1_1990_2023_maxheatindex.csv')
region = 'WEST_sub1' # !RENAME EACH TIME!

# Facility IDs
df = heat_index_df
ids = df["FACILITYID"]
df = df[ids.isin(ids[ids.duplicated()])].sort_values("FACILITYID")
unique_ids = df.FACILITYID.unique()

years = np.linspace(1990, 2023, 34).astype(int)
df_annual_hi_all = pd.DataFrame()
appended_data = []
for year in years:

    df_year = df[df['Year'] == year]

    all_prisons_year_max = df_year.groupby("FACILITYID")["max_heat_index"]
    all_prisons_year_max_idx = all_prisons_year_max.idxmax().to_list() #list of indices

    df_annual_max_hi = df_year.loc[all_prisons_year_max_idx] #max summer heat index
    avg_hi_col = all_prisons_year_max.mean() #average summer heat index
    appended_data.append(df_annual_max_hi)

appended_df = pd.concat(appended_data)

path = '/Users/ufuoma/Documents/Projects/Reuters/heat_index_by_region/'
appended_df.to_csv(path + region + '_annual_max_hi.csv')

