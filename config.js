module.exports = {
        'port'      : 5000,
        'appname'   : "WAPT Runner", 
        //'mongodbUrl': 'mongodb://USERNAME:PASSWORD!@HOSTNAME:PORT/DBNAME',
        'mongodbUrl': 'mongodb://waptrdb:27017/waptrunner',
        
        // Base URI and suffix part (to append after the query) for searching CVEs based on a partial software name
        'CveRptBase': "http://www.cvedetails.com/google-search-results.php?q=",
        //'CveRptBase': "https://web.nvd.nist.gov/view/vuln/search-results?query=",
        'CveRptSuffix':  "",

        // Base URI for getting CWE details
        'CweUriBase': "https://cwe.mitre.org/data/definitions/",

        // Base URI for gettign CVE details
        'CveUriBase': "http://www.cve.mitre.org/cgi-bin/cvename.cgi?name=",

        // Path to add to URI to show test reference details
        //'TestRefBase': "/WAPT",
        'TestRefBase': "https://k1/static",

        // Query for use to show a subset of available projects
        //PrjSubset    : "2016.*"
        //'PrjSubset'    : ".*Prod.*"
        'PrjSubset': ".*"
};
