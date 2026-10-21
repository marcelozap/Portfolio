from html import escape
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt, RGBColor
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


OUT_DIR = Path(__file__).resolve().parent
DOCX_PATH = OUT_DIR / "Marcelo-Zapata-BI-Reporting-Analyst-Resume.docx"
PDF_PATH = OUT_DIR / "Marcelo-Zapata-BI-Reporting-Analyst-Resume.pdf"
TXT_PATH = OUT_DIR / "Marcelo-Zapata-BI-Reporting-Analyst-Resume.txt"

NAME = "MARCELO ZAPATA"
CONTACT = "marcelozapata08@gmail.com | linkedin.com/in/marcelozap | marcelozapata.com"
HEADLINE = "Software Engineer | Automation, Data Workflows & Business Intelligence"
SUMMARY = (
    "Software engineer with nearly four years of enterprise experience at Publix, progressing from "
    "Associate Software Engineer to Senior Software Engineer. Builds and improves quality automation, "
    "enterprise APIs, data workflows, AI-assisted delivery systems, and structured reporting across "
    "complex technology environments."
)
SKILLS = (
    "Python, SQL, C#, TypeScript, REST APIs, Kafka, Azure Databricks, data lake tooling, "
    "Playwright, Azure DevOps CI/CD, OpenShift, structured reporting, AI-assisted workflow design"
)
EXPERIENCE = [
    {
        "company": "Publix Super Markets",
        "role": "Senior Software Engineer",
        "dates": "May 2026 - Oct 2026",
        "bullets": [
            "Led AI-assisted quality and delivery workflows across four development teams inside a Fortune 100 technology organization.",
            "Built validation and automation processes across Playwright, Azure DevOps CI/CD, SQL, REST APIs, Kafka, and structured reporting to improve release confidence, traceability, and cross-team visibility.",
            "Standardized reusable AI workflow infrastructure for analysts, engineers, managers, and directors, including agents, prompt templates, documentation patterns, review checklists, and delivery routines.",
            "Designed onboarding and enablement materials that turned complex enterprise systems, QA standards, and AI-assisted workflows into repeatable practices for technical and nontechnical audiences.",
        ],
    },
    {
        "company": "Publix Super Markets",
        "role": "Software Engineer",
        "dates": "May 2024 - May 2025",
        "bullets": [
            "Built and modernized enterprise inventory-management APIs and integration services across ordering, item and inventory, invoice, supplier, and warehouse data domains.",
            "Supported data lake and enterprise reporting workflows using Python, SQL, Azure Databricks, and data lake tooling, with emphasis on traceability, data quality, and operational reliability.",
            "Built Azure DevOps AI workflow tools for resource planning, work-item generation, test-case creation, requirement summaries, standardized documentation, and completion tracking.",
            "Supported production troubleshooting, OpenShift deployment workflows, REST integrations, and cross-system debugging across enterprise systems.",
        ],
    },
    {
        "company": "Publix Super Markets",
        "role": "Associate Software Engineer",
        "dates": "Dec 2022 - May 2024",
        "bullets": [
            "Helped modernize warehouse technology systems supporting large-scale automation equipment, including crane and conveyor-control environments.",
            "Supported projects that moved legacy warehouse workflows toward URL-based control systems for crane and conveyor operations.",
            "Led engineering for reporting software used in pharmacy operations, supporting pharmaceutical traceability, operational visibility, and compliance-focused workflows.",
            "Drove a Playwright automation initiative from concept through adoption after identifying a major manual-testing gap; automated parallel UI coverage across four server-backed test applications, with suites running in approximately five minutes through Azure DevOps.",
            "Helped technical and nontechnical teammates adopt AI-assisted tools, workflow packages, documentation patterns, and automation practices.",
        ],
    },
]
PROJECT = (
    "XIV$ Financial Research OS - Built a local-first Python, FastAPI, and React system for financial "
    "research, risk review, execution analytics, structured notes, and automated reporting workflows."
)
EDUCATION = "Florida State University - Bachelor of Science in Computer Science & Business, 2019-2022"


def set_run(run, size=9.2, bold=False, color="1B1B1B"):
    run.font.name = "Aptos"
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)


def add_heading(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(text.upper())
    set_run(r, size=9.2, bold=True, color="745A35")


def add_bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.left_indent = Inches(0.18)
    p.paragraph_format.first_line_indent = Inches(-0.12)
    p.paragraph_format.space_after = Pt(1.2)
    p.paragraph_format.line_spacing = 1.0
    set_run(p.add_run(text), size=8.55)


def build_docx():
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.45)
    section.bottom_margin = Inches(0.45)
    section.left_margin = Inches(0.55)
    section.right_margin = Inches(0.55)
    doc.styles["Normal"].font.name = "Aptos"
    doc.styles["Normal"].font.size = Pt(9)
    doc.styles["Normal"].paragraph_format.space_after = Pt(2)
    doc.styles["Normal"].paragraph_format.line_spacing = 1.0

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    set_run(p.add_run(NAME), size=17, bold=True, color="1B1B1B")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(1)
    set_run(p.add_run(HEADLINE), size=9.2, bold=True, color="745A35")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(5)
    set_run(p.add_run(CONTACT), size=8.5, color="55504A")

    add_heading(doc, "Professional Summary")
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    set_run(p.add_run(SUMMARY), size=8.8)

    add_heading(doc, "Technical Skills")
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    set_run(p.add_run(SKILLS), size=8.55)

    add_heading(doc, "Experience")
    for item in EXPERIENCE:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(0)
        set_run(p.add_run(item["company"]), size=9.2, bold=True)
        set_run(p.add_run(f" | {item['role']} | {item['dates']}"), size=8.6, color="55504A")
        for bullet in item["bullets"]:
            add_bullet(doc, bullet)

    add_heading(doc, "Selected Project")
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    set_run(p.add_run(PROJECT), size=8.6)

    add_heading(doc, "Education")
    p = doc.add_paragraph()
    set_run(p.add_run(EDUCATION), size=8.6)
    doc.save(DOCX_PATH)


def build_txt():
    lines = [NAME, HEADLINE, CONTACT, "", "PROFESSIONAL SUMMARY", SUMMARY, "", "TECHNICAL SKILLS", SKILLS, "", "EXPERIENCE"]
    for item in EXPERIENCE:
        lines.extend([f"{item['company']} | {item['role']} | {item['dates']}"])
        lines.extend([f"- {bullet}" for bullet in item["bullets"]])
        lines.append("")
    lines.extend(["SELECTED PROJECT", PROJECT, "", "EDUCATION", EDUCATION, ""])
    TXT_PATH.write_text("\n".join(lines), encoding="utf-8")


def build_pdf():
    styles = getSampleStyleSheet()
    body = ParagraphStyle("body", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.3, leading=10.1, textColor=colors.HexColor("#1B1B1B"), spaceAfter=2)
    bullet = ParagraphStyle("bullet", parent=body, leftIndent=12, firstLineIndent=-7, bulletIndent=0, spaceAfter=1.4)
    section = ParagraphStyle("section", parent=body, fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=colors.HexColor("#745A35"), spaceBefore=5, spaceAfter=2)
    name = ParagraphStyle("name", parent=body, fontName="Helvetica-Bold", fontSize=16, leading=17, alignment=1, spaceAfter=1)
    headline = ParagraphStyle("headline", parent=body, fontName="Helvetica-Bold", fontSize=8.8, leading=10, alignment=1, textColor=colors.HexColor("#745A35"), spaceAfter=1)
    contact = ParagraphStyle("contact", parent=body, fontSize=8, leading=9.5, alignment=1, textColor=colors.HexColor("#55504A"), spaceAfter=4)
    entry = ParagraphStyle("entry", parent=body, fontName="Helvetica-Bold", fontSize=8.7, leading=10.3, spaceBefore=2, spaceAfter=1)

    story = [Paragraph(NAME, name), Paragraph(escape(HEADLINE), headline), Paragraph(escape(CONTACT), contact)]
    story.extend([Paragraph("PROFESSIONAL SUMMARY", section), Paragraph(escape(SUMMARY), body)])
    story.extend([Paragraph("TECHNICAL SKILLS", section), Paragraph(escape(SKILLS), body)])
    story.append(Paragraph("EXPERIENCE", section))
    for item in EXPERIENCE:
        story.append(Paragraph(escape(f"{item['company']} | {item['role']} | {item['dates']}"), entry))
        for text in item["bullets"]:
            story.append(Paragraph(escape(text), bullet, bulletText="•"))
    story.extend([Paragraph("SELECTED PROJECT", section), Paragraph(escape(PROJECT), body)])
    story.extend([Paragraph("EDUCATION", section), Paragraph(escape(EDUCATION), body)])

    doc = SimpleDocTemplate(str(PDF_PATH), pagesize=letter, leftMargin=0.48 * inch, rightMargin=0.48 * inch, topMargin=0.4 * inch, bottomMargin=0.4 * inch)
    doc.build(story)


if __name__ == "__main__":
    build_docx()
    build_txt()
    build_pdf()
