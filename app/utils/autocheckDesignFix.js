"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Fixes autocheck print media styles
 * @param chunks - html
 */
function fixStyles(chunks) {
    const links = `
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Welcome to AutoCheck - Full Report</title>
        <link rel="stylesheet" 
            href="https://www.autocheck.com/reportservice/common/bootstrap4/iso_bootstrap4.1.0min.css" 
            media="print">
        <link rel="stylesheet"
            href="https://www.autocheck.com/reportservice/report/fullReport/stylesheet/full-report.css"
            media="print" />
        <link rel="stylesheet"
            href="https://www.autocheck.com/reportservice/report/fullReport/stylesheet/full-report-mqueries.css"
            media="print" />
        <link rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.4.1/jquery.fancybox.css">
        <script 
            type="text/javascript" 
            src="https://www.autocheck.com/members/common/jquery-3.3.1.min.js"></script>
        <script 
            type="text/javascript" 
            src="https://www.autocheck.com/members/common/jquery.fancybox.min.js"></script>
        <script 
            type="text/javascript" 
            src="https://www.autocheck.com/members/common/autocheck.js"></script>
        <script 
            type="text/javascript" 
            src="https://www.autocheck.com/reportservice/report/fullReport/js/bootstrap.min.js"></script>
        <style type="text/css">
            .row.backTop, #singleSummaryButton {
                display: none;
            }
            .break-after {
                page-break-after: always;
            }	
            .no-break {
                page-break-inside: avoid;
            }
            .section-divider-print, .history, .glossary{
                page-break-inside: avoid;
            }
            .summary-header-section-recall, .recallprintMargin {
                page-break-inside: avoid;
            }   
            .summary-area-print {
                page-break-after: always;
            }
            #full-report .mainScore {
                font-size: 8.7vw;
            }                                            
        </style>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    </head>
    `;
    chunks = chunks.replace(/<head>[\s\S]*<\/head>/, links);
    return chunks;
}
exports.default = fixStyles;
//# sourceMappingURL=autocheckDesignFix.js.map