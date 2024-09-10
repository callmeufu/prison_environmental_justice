import pandas as pd
from fuzzywuzzy import fuzz  # Install this library using: pip install fuzzywuzzy
from difflib import SequenceMatcher

# Load your datasets
bjs2005 = pd.read_csv(r"C:\Users\HP\Downloads\BJS_data_2005.csv") #spreadsheet1 
ucla = pd.read_csv(r"C:\Users\HP\Downloads\UCLA_data.csv") #spreadsheet2
hifld = pd.read_csv(r"C:\Users\HP\Downloads\hifld_dataset.csv") #spreadsheet3
bjs2019 = pd.read_csv(r"C:\Users\HP\Downloads\BJS_data_2019.csv") #spreadsheet4
output_path = r"C:\Users\HP\Downloads\matched_facilities_w_year_opened.csv" #for adding years to facilities
output_path_similarity = r"C:\Users\HP\Downloads\hifld_w_context_data.csv" #for adding contextual data via name similarity matching
current_facilities_summer_23 = pd.read_csv(r"C:\Users\HP\Downloads\Current_Facilities_Summer23.xlsx - Sheet1.csv") #spreadsheet5
hifld_unmatched_geocoding = pd.read_csv(r"C:\Users\HP\Downloads\unmatched_for_ahmed\unmatched_for_ahmed\hifld_prisons_filt_3.csv")
bjs2019_unmatched_geocoding = pd.read_csv(r"C:\Users\HP\Downloads\unmatched_for_ahmed\unmatched_for_ahmed\df_census_filt_3.csv") 



# function to pull the year of open from bjs and connect them to the HIFLD spreadsheet & and from current_facilities_summer_2023
def add_years_opened(spreadsheet1_df, spreadsheet2_df, spreadsheet3_df, spreadsheet5_df):

    #variable initialization
    bjstotal = 0
    bjsmatcheswithucla = 0
    bjsnonmatcheswithucla = 0
    bjsmissingyear = 0
    bjsuclamatch_noHIFLDmatch = 0
    bjsuclamatch_HIFLDmatch = 0
    currentfacility_no_year_opened = 0
    currentfacility_addedto_matcheddataset = 0
    currentfacility_alreadyin_matcheddataset = 0
    currentfacility_notin_matcheddataset = 0

    # Add years opened column to spreadsheet 3 (HIFLD)
    if 'Year Opened' not in spreadsheet3_df.columns:
        spreadsheet3_df['Years Opened'] = None

    # Iterate over facility ids in spreadsheet1

    spreadsheet2_df['BJS.ID'] = spreadsheet2_df['BJS.ID'].drop_duplicates()

    for facility_id in spreadsheet1_df['V1']:
        bjstotal += 1

        # Get the 'Year of construction completion' value from the row in the first spreadsheet
        year_of_construction_completion = spreadsheet1_df.loc[spreadsheet1_df["V1"] == facility_id, 'V41'].iloc[0]
        year_of_construction_completion_numeric = pd.to_numeric(year_of_construction_completion, errors='coerce')
        if facility_id in spreadsheet2_df['BJS.ID'].values:
            #find the corresponding HIFLDID in spreadsheet 2 for a given BJSID
            bjsmatcheswithucla += 1
            corresponding_HIFLD_ID = spreadsheet2_df[spreadsheet2_df['BJS.ID'] == facility_id]['HIFLD.ID'].iloc[0]

            if corresponding_HIFLD_ID in spreadsheet3_df['FACILITYID'].values and not pd.isna(year_of_construction_completion_numeric):
                condition = spreadsheet3_df['FACILITYID'] == corresponding_HIFLD_ID
                if spreadsheet3_df.loc[condition, 'Years Opened'].isna().all():
                    # Update only if 'Years Opened' is not already populated
                    spreadsheet3_df.loc[condition, 'Years Opened'] = year_of_construction_completion
                    bjsuclamatch_HIFLDmatch += 1
                else:
                    print(f"The Years Opened for FID {corresponding_HIFLD_ID} is already populated.")
            elif corresponding_HIFLD_ID in spreadsheet3_df['FACILITYID'].values and pd.isna(year_of_construction_completion_numeric):
                bjsmissingyear += 1
                print("This facility whose match was found between BJSID and HIFLD has no value for the year of open")
                continue
            else:
                bjsuclamatch_noHIFLDmatch += 1
                print('The matched HIFLD from UCLA dataset is not found in the HIFLD spreadsheet')
                continue
        else:
            bjsnonmatcheswithucla +=1
            print('Facility identification number from BJS dataset not found in UCLA dataset')
            continue 
    for facilityid in spreadsheet5_df['FACILITYID']:
        # Check if a facilityid is in both dataframes
        if facilityid in spreadsheet3_df['FACILITYID'].values and facilityid in spreadsheet5_df['FACILITYID'].values:
            #Extract 'Opening Date' for the current facility ID in spreadsheet5_df
            year_opened = spreadsheet5_df.loc[spreadsheet5_df['FACILITYID'] == facilityid, 'Opening Date'].iloc[0]
            if spreadsheet3_df.loc[spreadsheet3_df['FACILITYID'] == facilityid, 'Years Opened'].isna().all():
                try:
                    numeric_value = pd.to_numeric(year_opened, errors='coerce') #converts year_opened to a numeric value
                    if pd.isna(numeric_value):
                        print('Year opened is NaN, cannot add year to matched facility.')
                        currentfacility_no_year_opened += 1
                    else:
                        currentfacility_addedto_matcheddataset += 1
                        spreadsheet3_df.loc[spreadsheet3_df['FACILITYID'] == facilityid, 'Years Opened'] = year_opened
                except Exception as e:
                    print(f'Error processing facility {facilityid}: {e}')
            elif not spreadsheet3_df.loc[spreadsheet3_df['FACILITYID'] == facilityid, 'Years Opened'].isna().all():
                currentfacility_alreadyin_matcheddataset += 1
        else:
            currentfacility_notin_matcheddataset += 1
    # Save the updated DataFrame to the existing third spreadsheet  
    spreadsheet3_df.to_csv(output_path, index='False')
    print("updated HIFLD addded to output path")
    print('bjstotal: ', bjstotal)
    print('bjsmatcheswithucla: ', bjsmatcheswithucla)
    print('bjsnonmatcheswithucla: ', bjsnonmatcheswithucla)
    print('bjsuclamatch_noHIFLD: ', bjsuclamatch_noHIFLDmatch)
    print('bjsuclamatch_HIFLDmatch:', bjsuclamatch_HIFLDmatch)
    print('bjsmissingyear:', bjsmissingyear)
    print ('currentfacility_no_year_opened:', currentfacility_no_year_opened)
    print('currentfacility_addedto_matcheddataset:', currentfacility_addedto_matcheddataset)
    print('currentfacility_alreadyin_matcheddataset:', currentfacility_alreadyin_matcheddataset)
    print('currentfacility_notin_matcheddataset:', currentfacility_notin_matcheddataset)
 
add_years_opened(bjs2005, ucla, hifld, current_facilities_summer_23)

#functions to match based on name/street address similarity
def calculate_similarity(row1, row2, threshold=85):
    name_similarity = fuzz.token_sort_ratio(str(row2['NAME']), str(row1['V005']))
    street_address_similarity = fuzz.token_sort_ratio(str(row2['ADDRESS']), str(row1['V006']))

    return name_similarity >= threshold or street_address_similarity >= threshold

def fuzzy_match(row, spreadsheet4, threshold=85):
    similarities = spreadsheet4.apply(lambda x: calculate_similarity(row, x, threshold), axis=1)
    return similarities

def main_matching(spreadsheet3, spreadsheet4, output_path_similarity, threshold=85):
    matched_rows = 0
    unmatched_rows = 0

    def copy_data(row2_index, row1_index):

        index_mapping = {
            -9: "Out of Scope",
            -8: "Skipped on critical item form",
            -4: "Not reported",
            -3: "Not reported", 
            -1: "Not reported", 
            0: "No",
            1: "Yes", 
            "Yes": "Yes"
        }       
        category_titles = ['Male_Inmate_Total', 'Female_Inmate_Total', 'Inmate_Total','Veteran_Housing', 'Black_Inmates', 'White_Inmates', 
                           'American_Indian_Inmates', 'Asian_Inmates', 'Total Inmates Held', 'Full-Time Total Staff', 'Part-Time Total Staff',  'Total Staff', 'Max Number of Inmates Housed',  'Design Capacity', 'Specific Conditions: Crowding', 'Inmates Sentenced to 1 year or less' ]

        codes = ['V070', 'V072', 'V074', 'V037', 'V084', 'V082', 'V088', 'V090', 'V109', 'V183', 'V185', 'V191', 'V044', 'V041', 'V048', 'V113']

        for category, code in zip(category_titles, codes):                                              
            xls3contextualdata = spreadsheet3.at[row1_index, code]
            xls3contextualdata1 = index_mapping.get(xls3contextualdata, xls3contextualdata)
            spreadsheet4.at[row2_index, category] = xls3contextualdata1
            continue
        spreadsheet4.at[row2_index, "Matched_Facility_Name"] = spreadsheet3.at[row1_index, 'V005']
        spreadsheet4.at[row2_index, "Matched_Facility_Address"] = spreadsheet3.at[row1_index, 'V006']

    for index, row in spreadsheet3.iterrows():
        similarities = fuzzy_match(row, spreadsheet4, threshold)
        potential_matches = similarities[similarities].index.tolist()

        max_similarity = 0
        best_match_index = None

        for match_index in potential_matches:
            similarity = calculate_similarity(row, spreadsheet4.loc[match_index], threshold)
            if similarity > max_similarity:
                max_similarity = similarity
                best_match_index = match_index

        if best_match_index is not None:
            matched_rows += 1
            copy_data(best_match_index, index)
        else:
            unmatched_rows += 1


    spreadsheet4.to_csv(output_path_similarity, index=False)
    print(f'Contextual data written to {output_path_similarity}')
    print("Number of matched rows: ", matched_rows)
    print('Number of unmatched rows: ', unmatched_rows)

#usage
main_matching(bjs2019_unmatched_geocoding, hifld_unmatched_geocoding, 'hifld_geocoding_extramatches2.csv', threshold=85)

#HIFLD+YearsOpened+NameMatching(facility-name_and_street-address)