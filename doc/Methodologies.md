<link rel="stylesheet" href="/dist/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" href="/stylesheets/documentation.css">
<div class="container">

# Methodologies

**Table of Contents**

<!-- TOC -->

-   [Methodologies](#methodologies)
    -   [Supported Methodologies](#supported-methodologies)
        -   [Filters](#filters)
    -   [References](#references)
        -   [API Tests](#api-tests)
        -   [Bugcrowd VRT](#bugcrowd-vrt)
        -   [CWE Top 25](#cwe-top-25)
        -   [Extras](#extras)
        -   [OWASP API Top 10](#owasp-api-top-10)
        -   [OWASP TG](#owasp-tg)
        -   [OWASP WSTG](#owasp-wstg)
        -   [OWASP ASVS](#owasp-asvs)
        -   [SANS SEC-542](#sans-sec-542)
        -   [SANS SEC-642](#sans-sec-642)
        -   [TBHM](#tbhm)
        -   [WAHH](#wahh)
        -   [Web Services](#web-services)

<!-- /TOC -->

## Supported Methodologies

| Type        | Methodology Name                                              | Version Supported | Summary                                           |
| ----------- | ------------------------------------------------------------- | ----------------- | ------------------------------------------------- |
| Combination | All Tests                                                     |                   | Includes all tests from below methodologies       |
| Combination | [API Tests](#api-tests)                                       |                   | Includes API tests from below methodologies       |
| Combination | Default (all stars)                                           |                   | Combination of the best sources (in bold)         |
| Helpers     | [BugCrowd Vulnerability Rating Taxonomy](#bugcrowd-vrt) (VRT) | v1.3 (2017)       | Not a methodology but a useful ref.               |
| De-facto    | **[Bug Hunter](#tbhm)** (TBHM)                                | v1.0 (2015)       | Useful tests for bug hunting                      |
| Helpers     | [CWE Top 25](#cwe-top-25)                                     | (2020)            | SANS' list of top 25 software bugs (as CWEs)      |
| Helpers     | **[Extras](#extras)**                                         |
| OWASP       | [OWASP API Top 10](#owasp-api-top-10)                         | V1.0 (2019)       | API Top 10 from OWASP                             |
| OWASP       | [OWASP ASVS](#owasp-asvs)                                     | v4.0.2 (2020)     | App Security Verification Standard from OWASP     |
| OWASP       | [OWASP TG4](#owasp-tg)                                        | V4.0 (2014)       | Test Guide from OWASP (current release)           |
| OWASP       | **[OWASP WSTG](#owasp-wstg)**                                 | V5.0 (2020)       | Web Security Test Guide from OWASP (next release) |
| SANS        | [SEC542](#sans-sec-542)                                       |                   | SANS Web App Pen Testing Methodology              |
| SANS        | [SEC642](#sans-sec-642)                                       |                   | SANS Advanced Web App Pen Testing (add-ons)       |
| De-facto    | **[Web App Hacking Handbook (WAHH)](#wahh)**                  | Vol. 2 (2011)     | Well-respected methodology (de-facto)             |
| Helpers     | [Web Services](#web-services)                                 | TBD               | Web Services testing methodology (from a book)    |

### Filters

| Key | Purpose                                                           |
| --- | ----------------------------------------------------------------- |
| PCI | Tests that are applicable to help meet PCI-DSS (R6.5/R6.6)        |
| T10 | Tests that apply to the OWASP Top 10 Issues                       |
| T25 | Tests that apply to the SANS/CWE Top 25 dangerous security issues |
| Std | Tests to perform in most assessments                              |

## References

### API Tests

Our combined list of API tests from various sources. A complex database query is used to build this list.

### Bugcrowd VRT

The [Bugcrowd’s Vulnerability Rating Taxonomy](https://bugcrowd.com/vulnerability-rating-taxonomy) is a resource outlining Bugcrowd’s baseline priority rating, including certain edge cases, for common vulnerabilities.

<img src="../screenshots/BCVRT.png" width="800"/>

### CWE Top 25

The 2020 Common Weakness Enumeration (CWE™) [Top 25 Most Dangerous Software Weaknesses](https://cwe.mitre.org/top25/archive/2020/2020_cwe_top25.html) (CWE Top 25) is a demonstrative list of the most common and impactful issues experienced over the previous two calendar years. These weaknesses are dangerous because they are often easy to find, exploit, and can allow adversaries to completely take over a system, steal data, or prevent an application from working. The CWE Top 25 is a valuable community resource that can help developers, testers, and users — as well as project managers, security researchers, and educators — provide insight into the most severe and current security weaknesses.

<img src="../screenshots/Top25.png" width="800"/>

### Extras

The [Extras](https://github.com/jourzero/waptrun/blob/master/dbinit/testkb-extras.csv) include tests that were missing from common methodologies and were added manually in the Testing screen.

### OWASP API Top 10

Refer to [OWASP Web App Testing Guide](https://owasp.org/www-project-web-security-testing-guide/assets/archive/OWASP_Testing_Guide_v4.pdf) (v4).

### OWASP TG

Refer to [OWASP Web App Testing Guide](https://owasp.org/www-project-web-security-testing-guide/assets/archive/OWASP_Testing_Guide_v4.pdf) (v4).

### OWASP WSTG

Refer to the current [Web Security Test Guide](https://github.com/OWASP/wstg) (v5).

<img src="../screenshots/WSTG-UseAndMisuseCase.png" width="700"/>

### OWASP ASVS

Refer to [OWASP ASVS v4.0.2](https://github.com/OWASP/ASVS/tree/v4.0.2/4.0/en).

<img src="../screenshots/asvs_40_levels.png" width="1000"/>

### SANS SEC-542

Refer to the SANS [SEC-542 Syllabus](https://www.sans.org/cyber-security-courses/web-app-penetration-testing-ethical-hacking/).

### SANS SEC-642

Refer to the SANS [SEC-642 Syllabus](https://www.sans.org/cyber-security-courses/advanced-web-app-penetration-testing-ethical-hacking/).

### TBHM

Refer to the [Bug Hunter's Methodology](https://github.com/jhaddix/tbhm#the-bug-hunters-methodology-tbhm) (TBHM).

### WAHH

Refer to the [Web Application Hacker's Handbook](https://portswigger.net/web-security/web-application-hackers-handbook). There's also the related [Burp Documentation](https://portswigger.net/burp/documentation/contents) that provides additional substance and [workflow](https://portswigger.net/burp/documentation/desktop/penetration-testing#testing-workflow) details.

<img src="../screenshots/WAHH.jpg" width="800"/>

### Web Services

> TODO: Add details on this methodology book.

</div>
