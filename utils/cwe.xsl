<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:cwe="http://cwe.mitre.org/cwe-6">
    <xsl:output method="text" encoding="UTF-8" />
    <xsl:template match="/">
        <xsl:text>"ID","Name"</xsl:text>
        <xsl:text>&#xA;</xsl:text>
        <xsl:for-each select="cwe:Weakness_Catalog/cwe:Categories/cwe:Category">
            <xsl:value-of select="concat('&quot;', @ID, '&quot;')"/>
            <xsl:text>,</xsl:text>
            <xsl:value-of select="concat('&quot;', @Name, '&quot;')"/>
            <xsl:text>,</xsl:text>
            <xsl:text>&#xA;</xsl:text>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>