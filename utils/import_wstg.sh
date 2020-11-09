#!/bin/bash
#==========================================================================================================
# Generate TestKB data for the OWASP Web Security Testing Guide 
# Prerequisite: Clone project:
#   cd ~/github
#   git clone https://github.com/OWASP/wstg.git
#==========================================================================================================
CSV_HEADER='TID.string(),TSource.string(),TTestName.string(),TType.string(),TDescription.string(),TIssueName.string(),TIssueType.string(),TSeverity.int32(),TTesterSupport.string(),TPhase.string(),TSection.string(),TStep.string(),TIssueBackground.string(),TRemediationBackground.string(),TRef1.string(),TRef2.string(),TTRef.string(),TCweID.string(),TPCI.boolean(),TTop10.boolean(),TTop25.boolean(),TStdTest.boolean()'
URI_BASE='https://github.com/OWASP/wstg/blob/master/document/4-Web_Application_Security_Testing'
CSV_FILE="$PWD/../data/testkb-wstg.csv"
CONTAINER_INPUT_DIR="/app/data"
CONTAINER_CSV_FILE="${CONTAINER_INPUT_DIR}/testkb-wstg.csv"
COLLECTION="testkb"
MONGODB_URL_LOCAL="mongodb://waptrdb:27017/waptrunner"
TSource="OWASP-WSTG"
TPhase="Discovery"
TSeverity=2
TIssueBackground=""
TRemediationBackground=""
TRef1=""
TRef2=""
TCweID=""
TPCI="false"
TTop10="false"
TTop25="false"
TStdTest="false"
TTesterSupport="Click TTRef link."

# Save PWD
START_DIR="$PWD"

# Update data
read -p "Update the local OWASP WSTG copy? [n] " answer
if [ "$answer" = "y" ];then
    cd ~/github/wstg
    git pull
fi

read -p "Overwrite ${CSV_FILE}? [n] " answer
if [ "$answer" = "y" ];then
    cp -p "${CSV_FILE}" "${CSV_FILE}.$$"
    echo "$CSV_HEADER" > "$CSV_FILE"
    cd ~/github/wstg/document/4-Web_Application_Security_Testing
    echo "Adding web app tests..."
    for line in $(ls */*.md | grep -v '^00-Introduction_and_Objectives' | grep -v "README.md" | sed 's/\//,/' | sed 's/.md$//');do
        #echo "LINE: $line" 
        section="$(echo $line | cut -f1 -d,)"
        testing="$(echo $line | cut -f2 -d,)"
        section_number="$(echo $section | cut -f1 -d-)"
        test_number="$(echo $testing | cut -f1 -d-)"
        section_name="$(echo $section | cut -f2- -d-)"
        test_name="$(echo $testing | cut -f2- -d- | sed 's/_/ /g')"
        TID="WSTG-${section_number}.${test_number}"
        TTestName="$test_name"
        TType="$section_name"
        TDescription="$(echo $TTestName | sed 's/Testing for//')"
        TIssueName="$(echo $TDescription| sed 's/$/ issue/')"
        TIssueType="$(echo $TTestName | sed 's/Testing for//')"
        TSection="$section_name"
        TStep="${section_number}.${test_number}"
        TTRef="$URI_BASE/${section}/${testing}.md"
        csv_line="$TID,$TSource,$TTestName,$TType,$TDescription,$TIssueName,$TIssueType,$TSeverity,$TTesterSupport,$TPhase,$TSection,$TStep,$TIssueBackground,$TRemediationBackground,$TRef1,$TRef2,$TTRef,$TCweID,$TPCI,$TTop10,$TTop25,$TStdTest"
        echo "$csv_line" >> "$CSV_FILE"
    done 

    # Adding other tests at other non-standard locations
    echo "Adding API tests..."
    TID="WSTG-12.01"
    TStep="12.01"
    TTestName="Test for APIs"
    TType="API Testing"
    TIssueName="API security issue"
    TTRef="https://github.com/OWASP/wstg/blob/master/Testing_for_APIs.md"
    TDescription="$TTestName"
    TSection="$TType"
    echo "$TID,$TSource,$TTestName,$TType,$TDescription,$TIssueName,$TIssueType,$TSeverity,$TTesterSupport,$TPhase,$TSection,$TStep,$TIssueBackground,$TRemediationBackground,$TRef1,$TRef2,$TTRef,$TCweID,$TPCI,$TTop10,$TTop25,$TStdTest" >> "$CSV_FILE"

    echo "Adding SSRF tests..."
    TID="WSTG-13.01"
    TStep="13.01"
    TTestName="Test for Server-Side Request Forgery"
    TType="SSRF Testing"
    TIssueName="Server-Side Request Forgery (SSRF)"
    TTRef="https://github.com/OWASP/wstg/blob/master/Testing_for_Server-Side_Request_Forgery.md"
    TDescription="$TTestName"
    TSection="$TType"
    echo "$TID,$TSource,$TTestName,$TType,$TDescription,$TIssueName,$TIssueType,$TSeverity,$TTesterSupport,$TPhase,$TSection,$TStep,$TIssueBackground,$TRemediationBackground,$TRef1,$TRef2,$TTRef,$TCweID,$TPCI,$TTop10,$TTop25,$TStdTest" >> "$CSV_FILE"
    echo "Results saved to ${CSV_FILE}"
fi


# Get path for mongoimport tool
cd "$START_DIR"
TOOL_PATH=$(ls mongodb-database-tools*/bin/mongoimport)
if [ $? -ne 0 -a -f "$TOOL_PATH" ];
then
    echo "ERROR Could not find the tool path"
    exit 1
fi
CMD="docker-compose exec app /app/utils/$TOOL_PATH"

# Prompt for destination
read -p "Do you want the import operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
fi

# Import CSV data (append)
read -p "Import data to ${COLLECTION} collection from $CONTAINER_CSV_FILE? [n] " answer
if [ "$answer" = "y" ];then
    $CMD \
    --db=waptrunner \
    --collection="${COLLECTION}" \
    --file="$CONTAINER_CSV_FILE"  \
    --type=csv \
    --columnsHaveTypes \
    --headerline \
    --ignoreBlanks \
    $MONGODB_URL
else
    echo "ERROR: Input file ../$IN_FILENAME does not exist"
fi