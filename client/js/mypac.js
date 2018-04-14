// See examples here: http://findproxyforurl.com/pac-code-snippets-examples/
function FindProxyForURL(url, host) {
  var pacValue = "DIRECT";

    // If this is a test target, send to Burp
  if ((shExpMatch(url, "http://127.0.0.1/*")) ||
      (shExpMatch(host, "burp")) ||
      (shExpMatch(host, "k1")) ||
      (shExpMatch(host, "nodegoat")) ||
      (shExpMatch(url, "*/mutillidae*")) ||
      (shExpMatch(url, "https://127.0.0.1:8443*")))
    pacValue = "PROXY 127.0.0.1:8080";

    // If this is a swiss target, use SSH tunnel
  else if ((shExpMatch(host, "*.ch")) || 
           (shExpMatch(host, "waptr*"))   ||              
           //(shExpMatch(host, "k1"))   ||              
           (shExpMatch(host, "ssh-proxied.local")))
    pacValue = "SOCKS 127.0.0.1:9999";

  return pacValue;
}
