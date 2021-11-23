#!/bin/bash
#===========================================================================================
# import-cwe.sh: Import CWE data in CSV format (originating from the Mitre site) into the
#                WAPT Runner's MongoDB
#===========================================================================================

# Import parameters
DATA_DIR="/app/data"
UTILS_DIR="/app/utils"
IMPORTED_CSVFILE="$DATA_DIR/cwe-data-from-mitre.csv"
IMPORTED_CSVFILE_TOP10="$DATA_DIR/cwe-top10s.csv"
OLD_HEADER="ID,Name,Weakness_Abstraction,Status,Description_Summary,Likelihood_of_Exploit,Causal_Nature"
STD_HEADER="CWE-ID,Name,Weakness Abstraction,Status,Description,Extended Description,Related Weaknesses,Weakness Ordinalities,Applicable Platforms,Background Details,Alternate Terms,Modes Of Introduction,Exploitation Factors,Likelihood of Exploit,Common Consequences,Detection Methods,Potential Mitigations,Observed Examples,Functional Areas,Affected Resources,Taxonomy Mappings,Related Attack Patterns,Notes"
NEW_HEADER="ID.int32(),Name.string(),Weakness_Abstraction.string(),Status.string(),Description_Summary.string(),Extended_Description.string(),Related_Weaknesses.string(),Weakness_Ordinalities.string(),Applicable_Platforms.string(),Background_Details.string(),Alternate_Terms.string(),Modes_Of_Introduction.string(),Exploitation_Factors.string(),Likelihood_of_Exploit.string(),Common_Consequences.string(),Detection_Methods.string(),Potential_Mitigations.string(),Observed_Examples.string(),Functional_Areas.string(),Affected_Resources.string(),Taxonomy_Mappings.string(),Related_Attack_Patterns.string(),Notes.string()"
NO_CWE_FOUND_DATA='0,"No CWE found",,,"No CWE was found to represent this issue/finding."'
#TOP10_2013_A9='937,"Using Components with Known Vulnerabilities (Top-10 2013)",,Incomplete,"See OWASP Top 10 2013 (A9)."'
#TOP10_2017_A9='1026,"Using Components with Known Vulnerabilities (Top-10 2017)",,Incomplete,"See OWASP Top 10 2017 (A9)."'
#SEC_MISCONFIG='16,"Security Misconfiguration",,Incomplete,"Click the CWE link for more details."'
URL_BASE="https://cwe.mitre.org/data/csv"
CWE_VIEW_ID[0]="2000"
CWE_VIEW_ID[1]="1026"
CWE_VIEW_ID[2]="928"
CWE_VIEW_ID[3]="699"
CWE_VIEW_ID[4]="635"
CWE_VIEW_ID[5]="1337"
CWE_VIEW_ID[6]="1344"
CWE_VIEW_NAME[0]="Comprehensive List"
CWE_VIEW_NAME[1]="OWASP Top Ten 2017"
CWE_VIEW_NAME[2]="OWASP Top Ten 2013"
CWE_VIEW_NAME[3]="Software Development"
CWE_VIEW_NAME[4]="Weaknesses Originally Used by NVD from 2008 to 2016"
CWE_VIEW_NAME[5]="CWE Top 25 (2021)"
CWE_VIEW_NAME[6]="OWASP Top Ten (2021)"
LAST_VIEW=6
MONGODB_URL="mongodb://127.0.0.1:27017/waptrunner"

# cd to $DATA_DIR to simplify things
mkdir "$DATA_DIR" 2>/dev/null

# Check if we didn't run this script by mistake
if [ $(id -u) -eq 0 ];then
    read -p "-- Ready to import CWEs? [n] " answer
else
    answer="y"
fi
if [ "$answer" != y ];then
  echo "See you later!"
  exit 1
fi

# Save the previous files just in case
mv "$IMPORTED_CSVFILE" "$IMPORTED_CSVFILE.old.$$" 2>/dev/null

# Convert CSV file from Mitre into the format we currently support 
# TODO: code change in WAPT Runner app to avoid having to do this.
echo -e "\n-- Creating a new file $IMPORTED_CSVFILE"
echo "$NEW_HEADER"            > "$IMPORTED_CSVFILE"
echo "$NO_CWE_FOUND_DATA"    >> "$IMPORTED_CSVFILE"
echo "$TOP10_2013_A9"        >> "$IMPORTED_CSVFILE"
echo "$TOP10_2017_A9"        >> "$IMPORTED_CSVFILE"
echo "$SEC_MISCONFIG"        >> "$IMPORTED_CSVFILE"


# Download CSV files from the Mitre site and append their content
cd "$DATA_DIR"
for view in $(seq 0 $LAST_VIEW); do
  file="${CWE_VIEW_ID[$view]}.csv"
  echo -e "\n- Processing view ${CWE_VIEW_ID[$view]}"
  if [ ! -f "$file" ];then

    # Download CSV files from the Mitre site 
    echo -e "- Downloading ${URL_BASE}/${file}.zip"
    curl --silent -o "${file}.zip" "${URL_BASE}/${file}.zip"

    # Unzip the file
    echo -e "- Uncompressing ${file}.zip"
    unzip "$file"

    # Remove zip file
    echo -e "- Removing zip file ${file}.zip"
    rm "${file}.zip"
  else
    echo "File already exists. Skipping download."
  fi

  # Append the data 
  echo -e "- Appending data from $file"
  sed -n '2,$p' "${file}" >> "$IMPORTED_CSVFILE"
  echo -e "Done building content in $IMPORTED_CSVFILE."
done

# Add Top 10s
file="${IMPORTED_CSVFILE_TOP10}"
echo -e "- Appending Top 10 data from $file"
sed -n '2,$p' "${file}" >> "$IMPORTED_CSVFILE"

# Drop the existing cwe collection and create index
cd "$UTILS_DIR"
echo ""
read -p "-- Drop the CWE collection and create index before import? [n] " answer
if [ "$answer" = y ];then
    ./mongo.sh /app/utils/createCweColl.js 
fi

# Run mongoimport
echo ""
read -p "-- Run mongoimport for CWE list? [n] " answer
if [ "$answer" = y ];then
  mongoimport \
  --uri="$MONGODB_URL" --collection cwe --type csv \
  --file "$IMPORTED_CSVFILE" --headerline  --columnsHaveTypes 
fi