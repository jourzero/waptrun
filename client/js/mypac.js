// See examples here: http://findproxyforurl.com/pac-code-snippets-examples/
function FindProxyForURL(url, host) {
  var pacValue = "DIRECT";

    // If this is a test target, send to Burp
  if ((shExpMatch(url, "http://127.0.0.1/*")) ||
      (shExpMatch(host, "burp")) ||
      (shExpMatch(host, "k1")) ||
      (shExpMatch(host, "nodegoat")) ||
      (shExpMatch(url, "*/mutillidae/*")) ||
      (shExpMatch(url, "https://127.0.0.1:8443*")))
    pacValue = "PROXY 127.0.0.1:8080";

    // If this is a swiss target, use SSH tunnel
  else if ((shExpMatch(host, "*.ch")) || 
           (shExpMatch(host, "waptr.jourzero.com"))   ||              
           //(shExpMatch(host, "k1"))   ||              
           (shExpMatch(host, "ssh-proxied.local")))
    pacValue = "SOCKS 127.0.0.1:9999";

  //console.log("FindProxyForURL(" + url + ", " + host + ") = " + pacValue);
  return pacValue;

  /*
  debugPAC ="PAC Debug Information\n";
  debugPAC +="-----------------------------------\n";
  debugPAC +="Machine IP: " + myIpAddress() + "\n";
  debugPAC +="Hostname: " + host + "\n";
  if (isResolvable(host)) {resolvableHost = "True"} else {resolvableHost = "False"};
  debugPAC +="Host Resolvable: " + resolvableHost + "\n";
  debugPAC +="Hostname IP: " + dnsResolve(host) + "\n";
  if (isPlainHostName(host)) {plainHost = "True"} else {plainHost = "False"};
  debugPAC +="Plain Hostname: " + plainHost + "\n";
  debugPAC +="Domain Levels: " + dnsDomainLevels(host) + "\n";
  debugPAC +="URL: " + url + "\n";

  // Protocol can only be determined by reading the entire URL.
  if (url.substring(0,5)=="http:") {protocol="HTTP";} else
    if (url.substring(0,6)=="https:") {protocol="HTTPS";} else
      if (url.substring(0,4)=="ftp:") {protocol="FTP";}
      else {protocol="Unknown";}
  debugPAC +="Protocol: " + protocol + "\n";

  //alert(debugPAC);
  console.log(debugPAC);

    // If the hostname matches, send direct.
  if (dnsDomainIs(host, "intranet.domain.com") ||
    shExpMatch(host, "(*.abcdomain.com|abcdomain.com)"))
    return "DIRECT";

  // If the protocol or URL matches, send direct.
  if (url.substring(0, 4)=="ftp:" ||
        shExpMatch(url, "http://abcdomain.com/folder/*"))
        return "DIRECT";

  // If the requested website is hosted within the internal network, send direct.
  if (isPlainHostName(host) ||
        shExpMatch(host, "*.local") ||
        isInNet(dnsResolve(host), "10.0.0.0", "255.0.0.0") ||
        isInNet(dnsResolve(host), "172.16.0.0",  "255.240.0.0") ||
        isInNet(dnsResolve(host), "192.168.0.0",  "255.255.0.0") ||
        isInNet(dnsResolve(host), "127.0.0.0", "255.255.255.0"))
        return "DIRECT";

  // If the IP address of the local machine is within a defined
  // subnet, send to a specific proxy.
  if (isInNet(myIpAddress(), "10.10.5.0", "255.255.255.0"))
        return "PROXY 1.2.3.4:8080";

  // DEFAULT RULE: All other traffic, use below proxies, in fail-over order.
  return "PROXY 4.5.6.7:8080; PROXY 7.8.9.10:8080";
  */
}
