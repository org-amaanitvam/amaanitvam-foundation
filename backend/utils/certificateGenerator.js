import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export const generateCertificatePDF = async (cert) => {
    // Load the template
    const templatePath = '/home/codespace/Desktop/GH_ANTIGRAVITY/amaanitvam/jitisha_certificate.pdf';
    
    let pdfBytes;
    try {
        pdfBytes = fs.readFileSync(templatePath);
    } catch (err) {
        throw new Error('Certificate template not found.');
    }

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Use standard fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Dynamic data
    const name = cert.issuedTo || 'Recipient Name';
    const course = cert.domain || 'Course Name';
    const dateStr = cert.issueDate 
        ? new Date(cert.issueDate).toLocaleDateString('en-IN') 
        : new Date().toLocaleDateString('en-IN');
    
    // Draw Name (Centered, large font)
    const nameFontSize = 42;
    const nameTextWidth = helveticaFont.widthOfTextAtSize(name, nameFontSize);
    firstPage.drawText(name, {
        x: (width / 2) - (nameTextWidth / 2),
        y: height / 2, // middle of the page roughly
        size: nameFontSize,
        font: helveticaFont,
        color: rgb(0.1, 0.1, 0.1),
    });

    // Draw Details (Course/Domain)
    const detailText = `For successfully completing the ${cert.type} in ${course}`;
    const detailFontSize = 18;
    const detailWidth = helveticaRegular.widthOfTextAtSize(detailText, detailFontSize);
    firstPage.drawText(detailText, {
        x: (width / 2) - (detailWidth / 2),
        y: (height / 2) - 50,
        size: detailFontSize,
        font: helveticaRegular,
        color: rgb(0.3, 0.3, 0.3),
    });

    // Draw Date
    const dateLabel = `Date: ${dateStr}`;
    const dateFontSize = 14;
    firstPage.drawText(dateLabel, {
        x: 120, // bottom left area
        y: 120,
        size: dateFontSize,
        font: helveticaRegular,
        color: rgb(0.2, 0.2, 0.2),
    });

    // Draw Certificate ID
    const idLabel = `ID: ${cert.certificateId}`;
    const idWidth = helveticaRegular.widthOfTextAtSize(idLabel, dateFontSize);
    firstPage.drawText(idLabel, {
        x: width - 120 - idWidth, // bottom right area
        y: 120,
        size: dateFontSize,
        font: helveticaRegular,
        color: rgb(0.2, 0.2, 0.2),
    });

    // Serialize to bytes
    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
};
