let sampleXml1 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE albums>
<albums>
  <album artist="Prince" title="Purple Rain" year="1984" />
  <album artist="Rick James" title="Street Songs" year="1981" />
</albums>
`;

let sampleXml2 = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
<book>
  <title>The C++ Programming Language</title>
  <author>Bjarne Stroustrup</author>
  <year>2003</year>
</book>
<book>
  <title>The Pragmatic Programmer</title>
  <author>Andrew Hunt</author>
  <year>2005</year>
</book>
<book>
  <title>Learning XML</title>
  <author>Erik T. Ray</author>
  <year>2003</year>
</book>
</bookstore>`;

let sampleXml3 = `<?xml version="1.0" encoding="UTF-8"?>
<products>
    <product>
        <name>Xbox One</name>
        <code>23</code>
        <tags>gaming console</tags>
        <description>Gaming console by Microsoft</description>
    </product>
    <product>
        <name>Playstation 4</name>
        <code>26</code>
        <tags>gaming console</tags>
        <description>Gaming console by Sony</description>
    </product>
</products>`;

let sampleXml4 = `<!DOCTYPE foo [<!ELEMENT foo ANY >
    <!ENTITY bar SYSTEM "file:///etc/passwd" >]>
    <products>
       <product>
          <name>Playstation 4</name>
          <code>274</code>
          <tags>gaming console</tags>
          <description>&bar;</description>
       </product>
    </products>`;

var sampleXml = sampleXml4;
