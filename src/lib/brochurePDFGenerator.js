import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { generateAIBrochureData } from './brochureAIService';

// Consistent Color Palette
const COLOR_PRIMARY_NAVY = [27, 54, 93];       // #1B365D - Marvel Deep Navy Blue
const COLOR_PRIMARY_BLUE = [30, 86, 199];      // #1E56C7 - Accent Blue
const COLOR_BRAND_ORANGE = [234, 88, 12];      // #EA580C - Marvel Vibrant Orange (Single Primary Accent)
const COLOR_DARK_ORANGE  = [234, 88, 12];      // #EA580C - Deep Orange
const COLOR_LIGHT_BG     = [248, 250, 252];    // #F8FAFC - Card Background
const COLOR_BLUE_TINT    = [239, 246, 255];    // #EFF6FF - Soft Blue Box
const COLOR_ORANGE_TINT  = [255, 247, 237];    // #FFF7ED - Soft Orange Box
const COLOR_BORDER       = [226, 232, 240];    // #E2E8F0 - Clean Border Gray
const COLOR_TEXT_DARK    = [15, 23, 42];       // #0F172A - Heading Navy/Black
const COLOR_TEXT_BODY    = [51, 65, 85];       // #334155 - Body Text
const COLOR_TEXT_MUTED   = [100, 116, 139];    // #64748B - Secondary Notes
const COLOR_WATERMARK    = [244, 247, 252];    // #F4F7FC - Subtle Background Watermark

/**
 * Strips non-ASCII / problematic Unicode characters (like Rupee symbol ₹ or emojis)
 * that corrupt font metrics in standard jsPDF WinAnsi / Latin-1 fonts.
 */
function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/₹/g, 'INR ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Converts image URL into Base64 DataURL
 */
async function loadLogoDataUrl(url) {
  if (!url || typeof window === 'undefined') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          w: img.naturalWidth || img.width,
          h: img.naturalHeight || img.height,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generates an extensive, perfectly aligned, professional educational PDF brochure.
 */
export async function generate12PageCourseBrochurePDF(course, siteSettings = {}) {
  const data = await generateAIBrochureData(course, siteSettings);
  const logoInfo = await loadLogoDataUrl(siteSettings?.logo_url);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const margin = 16;
  const contentW = pageW - margin * 2; // 178mm
  const bottomLimit = pageH - 22;      // 275mm

  let cursorY = 32;

  function setFill(rgb) { pdf.setFillColor(rgb[0], rgb[1], rgb[2]); }
  function setStroke(rgb) { pdf.setDrawColor(rgb[0], rgb[1], rgb[2]); }
  function setText(rgb) { pdf.setTextColor(rgb[0], rgb[1], rgb[2]); }

  // Draw Background Watermark on current page
  function drawWatermark() {
    pdf.saveGraphicsState();
    setText(COLOR_WATERMARK);
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(38);
    pdf.text('MARVEL SLICE', 105, 140, { align: 'center', angle: 45 });
    pdf.setFontSize(12);
    pdf.text('INSTITUTE FOR SOFTWARE LEARNING', 105, 158, { align: 'center', angle: 45 });
    pdf.restoreGraphicsState();
  }

  // Draw Top Header on every page
  function drawPageHeader() {
    drawWatermark();

    const headerY = 10;

    // Draw Logo on left corner
    let textStartX = margin;
    if (logoInfo?.dataUrl) {
      try {
        const logoH = 10;
        const logoW = Math.min(24, (logoInfo.w / logoInfo.h) * logoH);
        pdf.addImage(logoInfo.dataUrl, 'PNG', margin, headerY, logoW, logoH);
        textStartX = margin + logoW + 4;
      } catch {
        drawEmblemLogo(headerY);
        textStartX = margin + 17;
      }
    } else {
      drawEmblemLogo(headerY);
      textStartX = margin + 17;
    }

    // Left Title Block
    pdf.setFontSize(13);
    pdf.setFont('Helvetica', 'bold');
    setText(COLOR_PRIMARY_NAVY);
    pdf.text('Marvel Slice', textStartX, headerY + 4.5);

    pdf.setFontSize(6.5);
    pdf.setFont('Helvetica', 'bold');
    setText(COLOR_BRAND_ORANGE);
    pdf.text('INSTITUTE FOR SOFTWARE LEARNING AND COMPETITIVE EXAMS', textStartX, headerY + 8.5);

    // Right Contact Block (clean ASCII text, no emoji artifacts)
    pdf.setFontSize(7);
    pdf.setFont('Helvetica', 'bold');
    setText(COLOR_PRIMARY_NAVY);
    pdf.text('Phone: +91 63809 57390 / +91 80882 18609', pageW - margin, headerY + 4.5, { align: 'right' });

    pdf.setFontSize(7);
    pdf.setFont('Helvetica', 'bold');
    setText(COLOR_BRAND_ORANGE);
    pdf.text('Email: sales@marvelslice.com', pageW - margin, headerY + 8.5, { align: 'right' });

    // Single Consistent Accent Divider Line
    const lineY = headerY + 12;
    setStroke(COLOR_BRAND_ORANGE);
    pdf.setLineWidth(0.7);
    pdf.line(margin, lineY, pageW - margin, lineY);
  }

  function drawEmblemLogo(y) {
    setFill(COLOR_PRIMARY_NAVY);
    pdf.roundedRect(margin, y, 13, 9.5, 1.5, 1.5, 'F');
    pdf.setFontSize(6.5);
    pdf.setFont('Helvetica', 'bold');
    setText([255, 255, 255]);
    pdf.text('MS', margin + 6.5, y + 6.2, { align: 'center' });
  }

  function checkSpace(neededMm = 15) {
    if (cursorY + neededMm > bottomLimit) {
      pdf.addPage();
      drawPageHeader();
      cursorY = 28;
    }
  }

  // Section Heading with perfectly measured underline
  function addSectionHeading(title) {
    checkSpace(20);
    cursorY += 5;
    pdf.setFontSize(12.5);
    pdf.setFont('Helvetica', 'bold');
    setText(COLOR_PRIMARY_NAVY);
    pdf.text(sanitize(title), margin, cursorY);

    // Single Consistent Accent Underline
    cursorY += 2;
    setStroke(COLOR_BRAND_ORANGE);
    pdf.setLineWidth(1.0);
    pdf.line(margin, cursorY, margin + 30, cursorY);
    cursorY += 5.5;
  }

  // Subheading with clean vertical marker
  function addSubHeading(title) {
    checkSpace(12);
    cursorY += 3;

    // Small vertical marker
    setFill(COLOR_BRAND_ORANGE);
    pdf.rect(margin, cursorY - 3.2, 2, 4, 'F');

    pdf.setFontSize(9.5);
    pdf.setFont('Helvetica', 'bold');
    setText(COLOR_PRIMARY_BLUE);
    pdf.text(sanitize(title), margin + 4.5, cursorY);
    cursorY += 5;
  }

  // Paragraph formatting with standard line height & clean wrapping
  function addParagraph(text, isMuted = false) {
    if (!text) return;
    const cleanStr = sanitize(text);
    if (!cleanStr) return;

    pdf.setFontSize(8.5);
    pdf.setFont('Helvetica', 'normal');
    setText(isMuted ? COLOR_TEXT_MUTED : COLOR_TEXT_BODY);

    const lines = pdf.splitTextToSize(cleanStr, contentW);
    const requiredH = lines.length * 4.2 + 2;
    checkSpace(requiredH);

    pdf.text(lines, margin, cursorY);
    cursorY += lines.length * 4.2 + 2;
  }

  // Multi-Line Bullet Point with zero overlapping text
  function addBulletPoint(title, desc = '', indent = 4) {
    const cleanTitle = sanitize(title);
    const cleanDesc = sanitize(desc);

    const bulletX = margin + indent;
    const textX = margin + indent + 4;
    const textW = contentW - indent - 4;

    if (cleanTitle && cleanDesc) {
      // Formatted as: Title on line 1 in bold, Description beneath or inline
      pdf.setFontSize(8.5);
      const descLines = pdf.splitTextToSize(cleanDesc, textW);
      const requiredH = (descLines.length + 1) * 4.2 + 3;
      checkSpace(requiredH);

      // Bullet dot
      setFill(COLOR_BRAND_ORANGE);
      pdf.circle(bulletX, cursorY - 1, 1, 'F');

      // Title in Bold Navy
      pdf.setFont('Helvetica', 'bold');
      setText(COLOR_PRIMARY_NAVY);
      pdf.text(cleanTitle, textX, cursorY);
      cursorY += 4.2;

      // Description in Slate
      pdf.setFont('Helvetica', 'normal');
      setText(COLOR_TEXT_BODY);
      pdf.text(descLines, textX, cursorY);
      cursorY += descLines.length * 4.2 + 2;
    } else {
      const lineText = cleanTitle || cleanDesc;
      if (!lineText) return;

      pdf.setFontSize(8.5);
      const lines = pdf.splitTextToSize(lineText, textW);
      const requiredH = lines.length * 4.2 + 2;
      checkSpace(requiredH);

      // Bullet dot
      setFill(COLOR_BRAND_ORANGE);
      pdf.circle(bulletX, cursorY - 1, 1, 'F');

      pdf.setFont('Helvetica', 'normal');
      setText(COLOR_TEXT_BODY);
      pdf.text(lines, textX, cursorY);
      cursorY += lines.length * 4.2 + 2;
    }
  }

  // Callout Box
  function addCalloutBox(title, text, type = 'blue') {
    const cleanTitle = sanitize(title);
    const cleanText = sanitize(text);
    if (!cleanText) return;

    const bg = type === 'orange' ? COLOR_ORANGE_TINT : COLOR_BLUE_TINT;
    const border = type === 'orange' ? [254, 215, 170] : [191, 219, 254];
    const textColor = type === 'orange' ? COLOR_DARK_ORANGE : COLOR_PRIMARY_BLUE;

    pdf.setFontSize(8);
    pdf.setFont('Helvetica', 'normal');
    const lines = pdf.splitTextToSize(cleanText, contentW - 12);
    const boxH = lines.length * 4 + 11;

    checkSpace(boxH + 4);

    setFill(bg);
    setStroke(border);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, cursorY, contentW, boxH, 2, 2, 'FD');

    // Left single accent color vertical bar
    setFill(COLOR_BRAND_ORANGE);
    pdf.rect(margin, cursorY, 2.2, boxH, 'F');

    pdf.setFontSize(8.5);
    pdf.setFont('Helvetica', 'bold');
    setText(textColor);
    pdf.text(cleanTitle, margin + 6, cursorY + 5.5);

    pdf.setFontSize(8);
    pdf.setFont('Helvetica', 'normal');
    setText(COLOR_TEXT_BODY);
    pdf.text(lines, margin + 6, cursorY + 10);

    cursorY += boxH + 4;
  }

  // ==========================================
  // PAGE 1: HEADER & COURSE MAIN TITLE CARD
  // ==========================================
  drawPageHeader();
  cursorY = 28;

  // Course Main Title Card
  setFill(COLOR_LIGHT_BG);
  setStroke(COLOR_BORDER);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, cursorY, contentW, 44, 2.5, 2.5, 'FD');

  // Badge in top-right
  setFill(COLOR_BRAND_ORANGE);
  pdf.roundedRect(pageW - margin - 42, cursorY + 5, 38, 5.5, 1.2, 1.2, 'F');
  pdf.setFontSize(6.5);
  pdf.setFont('Helvetica', 'bold');
  setText([255, 255, 255]);
  pdf.text('CAREER PROGRAM', pageW - margin - 23, cursorY + 8.8, { align: 'center' });

  // Main Course Title
  pdf.setFontSize(14);
  pdf.setFont('Helvetica', 'bold');
  setText(COLOR_PRIMARY_NAVY);
  const cleanMainTitle = sanitize(data.meta.title);
  const titleLines = pdf.splitTextToSize(cleanMainTitle, contentW - 48);
  pdf.text(titleLines, margin + 6, cursorY + 11);

  // Subtitle
  pdf.setFontSize(8.5);
  pdf.setFont('Helvetica', 'normal');
  setText(COLOR_BRAND_ORANGE);
  const cleanSub = sanitize(data.meta.subtitle);
  const subLines = pdf.splitTextToSize(cleanSub, contentW - 12);
  pdf.text(subLines, margin + 6, cursorY + 13 + titleLines.length * 5.5);

  // Meta Stats Line
  pdf.setFontSize(7.5);
  pdf.setFont('Helvetica', 'bold');
  setText(COLOR_PRIMARY_BLUE);
  const metaText = `Duration: ${sanitize(data.meta.duration)}   •   Mode: ${sanitize(data.meta.mode)}   •   Category: ${sanitize(data.meta.category)}   •   Track: ${sanitize(data.meta.subCategory)}`;
  pdf.text(metaText, margin + 6, cursorY + 39);

  cursorY += 50;

  // Section 1: Executive Overview & Summary
  addSectionHeading('1. Program Overview & Executive Summary');
  data.overview.paragraphs.forEach(p => addParagraph(p));

  addSubHeading('Key Curriculum Highlights');
  data.overview.keyHighlights.forEach(h => addBulletPoint(h));

  // Section 2: Target Audience & Prerequisites
  addSectionHeading('2. Target Audience Profile & Prerequisites');
  data.audience.paragraphs.forEach(p => addParagraph(p));

  addSubHeading('Who Should Enroll in this Program?');
  data.audience.targetProfiles.forEach(prof => {
    addBulletPoint(prof.title, prof.desc);
  });

  addCalloutBox('Prerequisites & Eligibility Guidelines', data.audience.prerequisitesText, 'orange');

  // Section 3: Learning Outcomes & Competencies
  addSectionHeading('3. Program Learning Outcomes & Core Competencies');
  data.outcomes.paragraphs.forEach(p => addParagraph(p));

  addSubHeading('Competencies You Will Master');
  data.outcomes.bulletPoints.forEach((outcome, idx) => {
    addBulletPoint(`Competency ${idx + 1}`, outcome);
  });

  // Section 4: Complete In-Depth Curriculum & Syllabus Breakdown
  addSectionHeading('4. Complete In-Depth Curriculum & Syllabus Breakdown');
  addParagraph('The curriculum is engineered in sequential phases to guide students systematically from foundational computational principles to complex production-grade software architectures.');

  data.modules.forEach((mod, idx) => {
    const modNum = mod.moduleNumber || String(idx + 1).padStart(2, '0');
    addSubHeading(`Module ${modNum}: ${mod.title || mod.name}`);

    if (mod.objective || mod.description) {
      addParagraph(mod.objective || mod.description);
    }

    if (Array.isArray(mod.topics) && mod.topics.length > 0) {
      pdf.setFontSize(8.5);
      pdf.setFont('Helvetica', 'bold');
      setText(COLOR_PRIMARY_NAVY);
      checkSpace(6);
      pdf.text('Topics & Concepts Covered:', margin + 4, cursorY);
      cursorY += 4.5;

      mod.topics.forEach(t => {
        addBulletPoint(typeof t === 'string' ? t : (t.title || t.name || ''));
      });
    }

    if (mod.handsOnLab || mod.practical_lab) {
      addCalloutBox('Hands-On Practical Lab Assignment', mod.handsOnLab || mod.practical_lab, 'blue');
    }

    cursorY += 2;
  });

  // Section 5: Technology & Tools Matrix
  addSectionHeading('5. Comprehensive Technology & Tooling Matrix');
  data.techMatrix.paragraphs.forEach(p => addParagraph(p));

  data.techMatrix.categories.forEach(cat => {
    addSubHeading(cat.title);
    addParagraph(`Technologies & Developer Tools: ${cat.items.join('  •  ')}`);
  });

  // Section 6: Real-World Capstone Projects
  addSectionHeading('6. Production Capstone Projects & Portfolio Building');
  data.capstones.paragraphs.forEach(p => addParagraph(p));

  data.capstones.projects.forEach((proj, idx) => {
    addSubHeading(`Capstone ${idx + 1}: ${proj.title}`);
    if (proj.subheading) {
      addParagraph(proj.subheading, true);
    }
    proj.paragraphs.forEach(p => addParagraph(p));
    addBulletPoint('Tech Stack Used', proj.techStack);
    addCalloutBox('Portfolio & Recruiter Value', proj.portfolioImpact, 'orange');
  });

  // Section 7: Career Pathways & Placement Support
  addSectionHeading('7. Career Pathways, Industry Demand & Placement Assistance');
  data.career.paragraphs.forEach(p => addParagraph(p));

  addSubHeading('Target Engineering Roles & Compensation Benchmarks');
  data.career.jobRoles.forEach(r => {
    addBulletPoint(`${r.role} (${r.salary})`, `${r.exp}. ${r.desc}`);
  });

  addSubHeading('The Marvel Slice 5-Step Placement Blueprint');
  data.career.placementBlueprint.forEach(step => {
    addBulletPoint(step.step, step.desc);
  });

  // Section 8: Certification & Mentorship Model
  addSectionHeading('8. Verified Industry Certification & Mentorship Model');
  data.certification.paragraphs.forEach(p => addParagraph(p));

  addSubHeading('1-on-1 Mentorship & Code Review Ecosystem');
  data.certification.mentorshipPillars.forEach(m => {
    addBulletPoint(m.title, m.desc);
  });

  // Section 9: Admissions Process & FAQs
  addSectionHeading('9. Admissions Process & Frequently Asked Questions');
  addSubHeading('Simple 4-Step Enrollment Roadmap');
  data.admissions.steps.forEach(step => {
    addBulletPoint(step.step, step.desc);
  });

  addSubHeading('Frequently Asked Questions (FAQs)');
  data.admissions.faqs.forEach(faq => {
    checkSpace(18);
    pdf.setFontSize(8.5);
    pdf.setFont('Helvetica', 'bold');
    setText(COLOR_PRIMARY_NAVY);
    pdf.text(`Q: ${sanitize(faq.q)}`, margin + 2, cursorY);
    cursorY += 4.5;

    pdf.setFontSize(8);
    pdf.setFont('Helvetica', 'normal');
    setText(COLOR_TEXT_BODY);
    const ansLines = pdf.splitTextToSize(sanitize(faq.a), contentW - 4);
    pdf.text(ansLines, margin + 4, cursorY);
    cursorY += ansLines.length * 4 + 3;
  });

  // Section 10: Campus Contact Information Box (Clean 2-Column Grid)
  addSectionHeading('10. Admissions Office & Campus Contact Information');
  checkSpace(44);

  setFill(COLOR_PRIMARY_NAVY);
  pdf.roundedRect(margin, cursorY, contentW, 38, 2.5, 2.5, 'F');

  pdf.setFontSize(10);
  pdf.setFont('Helvetica', 'bold');
  setText(COLOR_BRAND_ORANGE);
  pdf.text('Connect with Marvel Slice Admissions & Career Counseling', margin + 8, cursorY + 7.5);

  const colW = (contentW - 16) / 2; // 81mm each column
  const col1X = margin + 8;
  const col2X = margin + 8 + colW + 4;

  pdf.setFontSize(7.5);
  pdf.setFont('Helvetica', 'normal');
  setText([241, 245, 249]);

  // Left Column
  pdf.text(`Web: ${sanitize(data.meta.contact.website)}`, col1X, cursorY + 16);
  pdf.text(`Email: ${sanitize(data.meta.contact.email)}`, col1X, cursorY + 23);
  pdf.text(`Phone: ${sanitize(data.meta.contact.phone)}`, col1X, cursorY + 30);

  // Right Column
  const shortAddr = sanitize(data.meta.contact.address).slice(0, 42);
  pdf.text(`Campus: ${shortAddr}...`, col2X, cursorY + 16);
  pdf.text(`Weekdays: ${sanitize(data.meta.contact.weekdayHours)}`, col2X, cursorY + 23);
  pdf.text(`Saturdays: ${sanitize(data.meta.contact.saturdayHours)}`, col2X, cursorY + 30);

  cursorY += 42;

  // Add Page Numbers and Footer to all pages
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    const footerY = 289;
    setStroke(COLOR_BORDER);
    pdf.setLineWidth(0.3);
    pdf.line(margin, footerY - 3, pageW - margin, footerY - 3);

    pdf.setFontSize(7);
    pdf.setFont('Helvetica', 'bold');
    setText(COLOR_PRIMARY_NAVY);
    pdf.text('MARVEL SLICE INSTITUTE FOR SOFTWARE LEARNING AND COMPETITIVE EXAMS', margin, footerY);

    pdf.setFont('Helvetica', 'bold');
    setText(COLOR_BRAND_ORANGE);
    pdf.text(`Page ${i} of ${pageCount}`, pageW - margin, footerY, { align: 'right' });
  }

  // Save and download PDF
  const cleanTitle = (data.meta.title || 'Course_Brochure').replace(/[^a-zA-Z0-9]+/g, '_');
  pdf.save(`Marvel_Slice_${cleanTitle}_Brochure.pdf`);
}
