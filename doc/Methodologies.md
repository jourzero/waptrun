<link rel="stylesheet" href="/dist/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" href="/stylesheets/main.css">

# Methodologies

<!-- TOC -->

-   [Methodologies](#methodologies)
    -   [Summary](#summary)
    -   [Filters](#filters)
    -   [References](#references)
        -   [Bugcrowd VRT](#bugcrowd-vrt)
        -   [CWE Top 25](#cwe-top-25)
        -   [Extras](#extras)
        -   [OWASP TG](#owasp-tg)
        -   [OWASP WSTG](#owasp-wstg)
        -   [OWASP ASVS](#owasp-asvs)
        -   [SANS SEC-542](#sans-sec-542)
        -   [SANS SEC-642](#sans-sec-642)
        -   [TBHM](#tbhm)
        -   [WAHH](#wahh)

<!-- /TOC -->

## Summary

| Type        | Methodology Name                                        | Version Supported | Summary                                      |
| ----------- | ------------------------------------------------------- | ----------------- | -------------------------------------------- |
| Combination | All Tests                                               |                   | Includes all tests from below methodologies  |
| Combination | Combo                                                   |                   | Includes combination of below with "(\*)"    |
| Helpers     | [BugCrowd Vulnerability Rating Taxonomy](#bugcrowd-vrt) | 1.3 (2017)        | Not a methodology but a useful ref.          |
| Helpers     | [CWE Top 25](#cwe-top-25)                               | (2020)            | SANS' list of top 25 software bugs (as CWEs) |
| Helpers     | [Extras](#extras) (\*)                                  | (2020)            | Tests we added manually ourselves            |
| OWASP       | [Test Guide](#owasp-tg)                                 | v4                | Test Guide from OWASP (current release)      |
| OWASP       | [Web Security Testing Guide](#owasp-wstg) (\*)          |                   | Test Guide from OWASP (next release)         |
| OWASP       | [ASVS](#owasp-asvs)                                     | 4.0.2 (2020)      | App Security Verification Standard           |
| SANS        | [SEC542](#sans-sec-542)                                 |                   | SANS Web App Pen Testing Methodology         |
| SANS        | [SEC642](#sans-sec-642)                                 |                   | SANS Advanced Web App Pen Testing (add-ons)  |
| De-facto    | [The Bug Hunter Methodology](#tbhm) (\*)                | (2015)            | Useful tests for bug hunting                 |
| De-facto    | [Web App Hacking Handbook (WAHH)](#wahh) (\*)           | v2                | Well-respected methodology (de-facto)        |

## Filters

| Key | Purpose                                                           |
| --- | ----------------------------------------------------------------- |
| PCI | Tests that are applicable to help meet PCI-DSS (R6.5/R6.6)        |
| T10 | Tests that apply to the OWASP Top 10 Issues                       |
| T25 | Tests that apply to the SANS/CWE Top 25 dangerous security issues |
| Std | Tests that we want to perform in most of our assessments          |

## References

### Bugcrowd VRT

The [Bugcrowd’s Vulnerability Rating Taxonomy](https://bugcrowd.com/vulnerability-rating-taxonomy) is a resource outlining Bugcrowd’s baseline priority rating, including certain edge cases, for common vulnerabilities.

![BCVRT Screenshot](../screenshots/BCVRT.png)

### CWE Top 25

The 2020 Common Weakness Enumeration (CWE™) [Top 25 Most Dangerous Software Weaknesses](https://cwe.mitre.org/top25/archive/2020/2020_cwe_top25.html) (CWE Top 25) is a demonstrative list of the most common and impactful issues experienced over the previous two calendar years. These weaknesses are dangerous because they are often easy to find, exploit, and can allow adversaries to completely take over a system, steal data, or prevent an application from working. The CWE Top 25 is a valuable community resource that can help developers, testers, and users — as well as project managers, security researchers, and educators — provide insight into the most severe and current security weaknesses.

![Top25](../screenshots/Top25.png)

### Extras

The [Extras](https://github.com/jourzero/waptrun/blob/master/dbinit/testkb-extras.csv) include tests that we felt were missing from common methodologies and that we decided to add manually in the Testing screen.

### OWASP TG

### OWASP WSTG

### OWASP ASVS

### SANS SEC-542

### SANS SEC-642

### TBHM

### WAHH
