#!/bin/sh
#===========================================================================================
# import-cwe.sh: Import CWE data in CSV format (originating from the Mitre site) into the
#                WAPT Runner's MongoDB
# Prerequisites: run env.sh that contains an environment value for MONGO_URL
#===========================================================================================

# Import parameters
DATA_DIR="../data"
IMPORTED_CSVFILE="CWE3.2-Import-Data.csv"
OLD_HEADER="ID,Name,Weakness_Abstraction,Status,Description_Summary,Likelihood_of_Exploit,Causal_Nature"
STD_HEADER="CWE-ID,Name,Weakness Abstraction,Status,Description,Extended Description,Related Weaknesses,Weakness Ordinalities,Applicable Platforms,Background Details,Alternate Terms,Modes Of Introduction,Exploitation Factors,Likelihood of Exploit,Common Consequences,Detection Methods,Potential Mitigations,Observed Examples,Functional Areas,Affected Resources,Taxonomy Mappings,Related Attack Patterns,Notes"
NEW_HEADER="ID,Name,Weakness_Abstraction,Status,Description_Summary,Extended_Description,Related_Weaknesses,Weakness_Ordinalities,Applicable_Platforms,Background_Details,Alternate_Terms,Modes_Of_Introduction,Exploitation_Factors,Likelihood_of_Exploit,Common_Consequences,Detection_Methods,Potential_Mitigations,Observed_Examples,Functional_Areas,Affected_Resources,Taxonomy_Mappings,Related_Attack_Patterns,Notes"
NO_CWE_FOUND_DATA='0,"No CWE found",,,"No CWE was found to represent this issue/finding."'
TOP10_2013_A9='937,"Using Components with Known Vulnerabilities (Top-10 2013)",,Incomplete,"See OWASP Top 10 2013 (A9)."'
TOP10_2017_A9='1026,"Using Components with Known Vulnerabilities (Top-10 2017)",,Incomplete,"See OWASP Top 10 2017 (A9)."'
URL_BASE="https://cwe.mitre.org/data/csv"
CWE_VIEW_ID[0]="2000"
CWE_VIEW_ID[1]="1026"
CWE_VIEW_ID[2]="928"
CWE_VIEW_NAME[0]="COMPREHENSIVE_LIST"
CWE_VIEW_NAME[1]="OWASP_TOP10_2017"
CWE_VIEW_NAME[2]="OWASP_TOP10_2013"
LAST_VIEW=2

# cd to $DATA_DIR to simplify things
mkdir "$DATA_DIR" 2>/dev/null
cd "$DATA_DIR"


# Check if we didn't run this script by mistake
read -p "Ready to import CWEs? [n] " answer
if [ "$answer" != y ];then
  echo "See you later!"
  exit 1
fi


# Check if we have the MongoDB URL
if [ "$MONGO_URL" == "" ];then
  echo "Missing MongoDB URL in MONGO_URL env. var! Exiting."  
  exit 2
fi


# Save the previous files just in case
mv "$IMPORTED_CSVFILE" "$IMPORTED_CSVFILE.old.$$" 2>/dev/null


# Convert CSV file from Mitre into the format we currently support 
# TODO: code change in WAPT Runner app to avoid having to do this.
echo "Creating a new file"
echo "$NEW_HEADER"            > "$IMPORTED_CSVFILE"
echo "$NO_CWE_FOUND_DATA"    >> "$IMPORTED_CSVFILE"
echo "$TOP10_2013_A9"        >> "$IMPORTED_CSVFILE"
echo "$TOP10_2017_A9"        >> "$IMPORTED_CSVFILE"


# Download CSV files from the Mitre site and append their content
for view in $(seq 0 $LAST_VIEW); do
  file="${CWE_VIEW_ID[$view]}.csv"
  if [ ! -f "$file" ];then

    # Download CSV files from the Mitre site 
    curl -o "${file}.zip" "${URL_BASE}/${file}.zip"

    # Unzip the file
    unzip "$file"

    # Remove zip file
    rm "${file}.zip"
  fi

  # Append the data 
  echo "Append the data from $file"
  sed -n '2,$p' "${file}" >> "$IMPORTED_CSVFILE"
done


# 

# Run mongodump
read -p "Run mongoimport for CWE list? [n] " answer
if [ "$answer" = y ];then
  mongoimport --drop --uri="$MONGO_URL" --collection cwe --type csv --file "$IMPORTED_CSVFILE" --headerline
fi


# cd back to where we were
cd -
