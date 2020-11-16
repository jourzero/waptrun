#!/bin/bash
#===========================================================================================
# import-cwe.sh: Import CWE data in CSV format (originating from the Mitre site) into the
#                WAPT Runner's MongoDB
#===========================================================================================

# Import parameters
HOST_DATA_DIR="$PWD/../data"
CTR_DATA_DIR="/app/data"
IMPORTED_CSVFILE="$HOST_DATA_DIR/cwe-data-from-mitre.csv"
IMPORTED_CSVFILE_CTR="$CTR_DATA_DIR/cwe-data-from-mitre.csv"
OLD_HEADER="ID,Name,Weakness_Abstraction,Status,Description_Summary,Likelihood_of_Exploit,Causal_Nature"
STD_HEADER="CWE-ID,Name,Weakness Abstraction,Status,Description,Extended Description,Related Weaknesses,Weakness Ordinalities,Applicable Platforms,Background Details,Alternate Terms,Modes Of Introduction,Exploitation Factors,Likelihood of Exploit,Common Consequences,Detection Methods,Potential Mitigations,Observed Examples,Functional Areas,Affected Resources,Taxonomy Mappings,Related Attack Patterns,Notes"
NEW_HEADER="ID.0,Name,Weakness_Abstraction,Status,Description_Summary,Extended_Description,Related_Weaknesses,Weakness_Ordinalities,Applicable_Platforms,Background_Details,Alternate_Terms,Modes_Of_Introduction,Exploitation_Factors,Likelihood_of_Exploit,Common_Consequences,Detection_Methods,Potential_Mitigations,Observed_Examples,Functional_Areas,Affected_Resources,Taxonomy_Mappings,Related_Attack_Patterns,Notes"
NO_CWE_FOUND_DATA='0,"No CWE found",,,"No CWE was found to represent this issue/finding."'
TOP10_2013_A9='937,"Using Components with Known Vulnerabilities (Top-10 2013)",,Incomplete,"See OWASP Top 10 2013 (A9)."'
TOP10_2017_A9='1026,"Using Components with Known Vulnerabilities (Top-10 2017)",,Incomplete,"See OWASP Top 10 2017 (A9)."'
SEC_MISCONFIG='16,"Security Misconfiguration",,Incomplete,"Click the CWE link for more details."'
URL_BASE="https://cwe.mitre.org/data/csv"
CWE_VIEW_ID[0]="2000"
CWE_VIEW_ID[1]="1026"
CWE_VIEW_ID[2]="928"
CWE_VIEW_ID[3]="699"
CWE_VIEW_ID[4]="635"
CWE_VIEW_NAME[0]="Comprehensive List"
CWE_VIEW_NAME[1]="OWASP Top10 2017"
CWE_VIEW_NAME[2]="OWASP Top10 2013"
CWE_VIEW_NAME[3]="Software Development"
CWE_VIEW_NAME[4]="Weaknesses Originally Used by NVD from 2008 to 2016"
LAST_VIEW=4
MONGODB_URL="mongodb://waptrdb:27017/waptrunner"
SVC_NAME="waptrdb"

# cd to $DATA_DIR to simplify things
mkdir "$HOST_DATA_DIR" 2>/dev/null

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
cd "$HOST_DATA_DIR"
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
cd -

# Drop the existing cwe collection and create index
echo ""
read -p "-- Drop the CWE collection and create index before import? [n] " answer
if [ "$answer" = y ];then
    ./mongo.sh /app/utils/createCweColl.js 
fi

# Run mongoimport
echo ""
read -p "-- Run mongoimport for CWE list? [n] " answer
if [ "$answer" = y ];then
  docker-compose exec $SVC_NAME /usr/bin/mongoimport \
  --uri="$MONGODB_URL" --collection cwe --type csv \
  --file "$IMPORTED_CSVFILE_CTR" --headerline  --useArrayIndexFields
fi