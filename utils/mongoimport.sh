#!/bin/bash
#========================================================================================
# mongoexport.sh: Run mongoexport in Docker container, using MONGODB_URL from .env
#========================================================================================
. ../.env
CONTAINER_NAME="waptrdb"
COLLECTIONS[1]="testkb"
COLLECTIONS[2]="issues"
COLLECTIONS[3]="project"
COLLECTIONS[4]="cwe"
NUM_COLLS=4
INPUT_DIR=/utils/import
DB_LOCATION="remote"

read -p "Do you want the operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
    DB_LOCATION="local"
fi

for i in $(seq 1 $NUM_COLLS);do
    IN_FILENAME="$INPUT_DIR/${COLLECTIONS[$i]}.csv"
    echo -e "\n-- Importing data to ${COLLECTIONS[$i]} collection from $IN_FILENAME..."
    if [ -f "../$IN_FILENAME" ];then
        docker exec -it "$CONTAINER_NAME" /usr/bin/mongoimport \
        --headerline \
        --db=waptrunner \
        --collection="${COLLECTIONS[$i]}" \
        --file="$IN_FILENAME"  \
        --type=csv \
        --drop  \
        $MONGODB_URL
    else
        echo "ERROR: Input file ../$IN_FILENAME does not exist"
    fi
done

#Usage:
#  mongoimport <options> <connection-string> <file> 
#
#Import CSV, TSV or JSON data into MongoDB. If no file is provided, mongoimport reads from stdin.
#
#Connection strings must begin with mongodb:// or mongodb+srv://.
#
#See http://docs.mongodb.com/database-tools/mongoimport/ for more information.
#
#general options:
#      --help                                      print usage
#      --version                                   print the tool version and exit
#
#verbosity options:
#  -v, --verbose=<level>                           more detailed log output (include multiple times for more verbosity, e.g. -vvvvv, or
#                                                  specify a numeric value, e.g. --verbose=N)
#      --quiet                                     hide all log output
#
#connection options:
#  -h, --host=<hostname>                           mongodb host to connect to (setname/host1,host2 for replica sets)
#      --port=<port>                               server port (can also use --host hostname:port)
#
#ssl options:
#      --ssl                                       connect to a mongod or mongos that has ssl enabled
#      --sslCAFile=<filename>                      the .pem file containing the root certificate chain from the certificate authority
#      --sslPEMKeyFile=<filename>                  the .pem file containing the certificate and key
#      --sslPEMKeyPassword=<password>              the password to decrypt the sslPEMKeyFile, if necessary
#      --sslCRLFile=<filename>                     the .pem file containing the certificate revocation list
#      --sslFIPSMode                               use FIPS mode of the installed openssl library
#      --tlsInsecure                               bypass the validation for server's certificate chain and host name
#
#authentication options:
#  -u, --username=<username>                       username for authentication
#  -p, --password=<password>                       password for authentication
#      --authenticationDatabase=<database-name>    database that holds the user's credentials
#      --authenticationMechanism=<mechanism>       authentication mechanism to use
#      --awsSessionToken=<aws-session-token>       session token to authenticate via AWS IAM
#
#kerberos options:
#      --gssapiServiceName=<service-name>          service name to use when authenticating using GSSAPI/Kerberos (default: mongodb)
#      --gssapiHostName=<host-name>                hostname to use when authenticating using GSSAPI/Kerberos (default: <remote server's
#                                                  address>)
#
#namespace options:
#  -d, --db=<database-name>                        database to use
#  -c, --collection=<collection-name>              collection to use
#
#uri options:
#      --uri=mongodb-uri                           mongodb uri connection string
#
#input options:
#  -f, --fields=<field>[,<field>]*                 comma separated list of fields, e.g. -f name,age
#      --fieldFile=<filename>                      file with field names - 1 per line
#      --file=<filename>                           file to import from; if not specified, stdin is used
#      --headerline                                use first line in input source as the field list (CSV and TSV only)
#      --jsonArray                                 treat input source as a JSON array
#      --parseGrace=<grace>                        controls behavior when type coercion fails - one of: autoCast, skipField, skipRow, stop
#                                                  (default: stop)
#      --type=<type>                               input format to import: json, csv, or tsv
#      --columnsHaveTypes                          indicates that the field list (from --fields, --fieldsFile, or --headerline) specifies
#                                                  types; They must be in the form of '<colName>.<type>(<arg>)'. The type can be one of:
#                                                  auto, binary, boolean, date, date_go, date_ms, date_oracle, decimal, double, int32,
#                                                  int64, string. For each of the date types, the argument is a datetime layout string. For
#                                                  the binary type, the argument can be one of: base32, base64, hex. All other types take
#                                                  an empty argument. Only valid for CSV and TSV imports. e.g. zipcode.string(),
#                                                  thumbnail.binary(base64)
#      --legacy                                    use the legacy extended JSON format
#      --useArrayIndexFields                       indicates that field names may include array indexes that should be used to construct
#                                                  arrays during import (e.g. foo.0,foo.1). Indexes must start from 0 and increase
#                                                  sequentially (foo.1,foo.0 would fail).
#
#ingest options:
#      --drop                                      drop collection before inserting documents
#      --ignoreBlanks                              ignore fields with empty values in CSV and TSV
#      --maintainInsertionOrder                    insert the documents in the order of their appearance in the input source. By default
#                                                  the insertions will be performed in an arbitrary order. Setting this flag also enables
#                                                  the behavior of --stopOnError and restricts NumInsertionWorkers to 1.
#  -j, --numInsertionWorkers=<number>              number of insert operations to run concurrently
#      --stopOnError                               halt after encountering any error during importing. By default, mongoimport will attempt
#                                                  to continue through document validation and DuplicateKey errors, but with this option
#                                                  enabled, the tool will stop instead. A small number of documents may be inserted after
#                                                  encountering an error even with this option enabled; use --maintainInsertionOrder to
#                                                  halt immediately after an error
#      --mode=[insert|upsert|merge|delete]         insert: insert only, skips matching documents. upsert: insert new documents or replace
#                                                  existing documents. merge: insert new documents or modify existing documents. delete:
#                                                  deletes matching documents only. If upsert fields match more than one document, only one
#                                                  document is deleted. (default: insert)
#      --upsertFields=<field>[,<field>]*           comma-separated fields for the query part when --mode is set to upsert or merge
#      --writeConcern=<write-concern-specifier>    write concern options e.g. --writeConcern majority, --writeConcern '{w: 3, wtimeout:
#                                                  500, fsync: true, j: true}'
#      --bypassDocumentValidation                  bypass document validation