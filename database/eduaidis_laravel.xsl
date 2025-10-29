<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
   <xsl:template match="/">
     <xsl:apply-templates select="CACHE" />
   </xsl:template>
   <xsl:template match="CACHE">
     <html>
        <head>
          <xsl:apply-templates select="TITLE" />
          <xsl:apply-templates select="STYLES" />
        </head>
        <body>
          <xsl:apply-templates select="LINES" />
        </body>
     </html>
   </xsl:template>
   <xsl:template match="TITLE">
     <title>
       <xsl:value-of select="." />
     </title>
   </xsl:template>
   <xsl:template match="STYLES">
     <style type="text/css">
       table td { overflow: hidden; padding: 0px;}
       <xsl:apply-templates select="STYLE" />
     </style>
   </xsl:template>
   <xsl:template match="STYLE">
     .Style<xsl:value-of select="@Id" />
     { 
       border-style: solid;
       padding: <xsl:value-of select="@CellPadding" />;
       font-family: <xsl:value-of select="@FontName" />;
       mso-font-charset: <xsl:value-of select="@FontCharset" />;
       font-size: <xsl:value-of select="@FontSize" />pt;
       color: <xsl:value-of select="@FontColor" />;
       background-color: <xsl:value-of select="@BrushBkColor" />;
     <xsl:if test="@Bold='True'">
       font-weight: bold;
     </xsl:if>
     <xsl:if test="@Italic='True'">
       font-style: italic;
     </xsl:if>
     <xsl:if test="@Underline='True'">
       text-decoration: underline;
     </xsl:if>
     <xsl:if test="@StrikeOut='True'">
       text-decoration: line-through;
     </xsl:if>
     <xsl:apply-templates select="BORDER_LEFT" />
     <xsl:apply-templates select="BORDER_UP" />
     <xsl:apply-templates select="BORDER_RIGHT" />
     <xsl:apply-templates select="BORDER_DOWN" />
     }
   </xsl:template>
   <xsl:template match="BORDER_LEFT">
     border-left-width: <xsl:value-of select="@Width" />px;
     border-left-color: <xsl:value-of select="@Color" />;
   </xsl:template>
   <xsl:template match="BORDER_UP">
     border-top-width: <xsl:value-of select="@Width" />px;
     border-top-color: <xsl:value-of select="@Color" />;
   </xsl:template>
   <xsl:template match="BORDER_RIGHT">
     border-right-width: <xsl:value-of select="@Width" />px;
     border-right-color: <xsl:value-of select="@Color" />;
   </xsl:template>
   <xsl:template match="BORDER_DOWN">
     border-bottom-width: <xsl:value-of select="@Width" />px;
     border-bottom-color: <xsl:value-of select="@Color" />;
   </xsl:template>
   <xsl:template match="LINES">
     <table border="0" cellspacing="0" style="border-collapse: collapse;">
       <xsl:apply-templates select="LINE" />
     </table>
   </xsl:template>
   <xsl:template match="LINE">
     <tr>
       <xsl:attribute name="height"><xsl:value-of select="@Height" /></xsl:attribute>
       <xsl:apply-templates select="CELL" />
     </tr>
   </xsl:template>
   <xsl:template match="CELL">
     <td>
       <xsl:attribute name="nowrap"></xsl:attribute>
       <xsl:attribute name="width"><xsl:value-of select="@Width" /></xsl:attribute>
       <xsl:attribute name="height"><xsl:value-of select="@Height" /></xsl:attribute>
       <xsl:attribute name="align"><xsl:value-of select="@Align" /></xsl:attribute>
       <xsl:attribute name="colspan"><xsl:value-of select="@ColSpan" /></xsl:attribute>
       <xsl:attribute name="rowspan"><xsl:value-of select="@RowSpan" /></xsl:attribute>
       <xsl:attribute name="class">Style<xsl:value-of select="@StyleClass" /></xsl:attribute>
       <xsl:choose>
         <xsl:when test="LINES">
           <xsl:apply-templates select="LINES" />
         </xsl:when>
         <xsl:when test="IMAGE">
           <xsl:apply-templates select="IMAGE" />
         </xsl:when>
         <xsl:otherwise>
           <xsl:value-of select="." />
         </xsl:otherwise>
       </xsl:choose>
     </td>
   </xsl:template>
   <xsl:template match="IMAGE">
     <img>
       <xsl:attribute name="src"><xsl:value-of select="@Src" /></xsl:attribute>
       <xsl:value-of select="." />
     </img>
   </xsl:template>
</xsl:stylesheet>