import google.generativeai as genai
import pandas as pd
import os
import re
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime

# Load Gemini API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ==== PDF STYLES ====
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Header", fontSize=18, leading=22, spaceAfter=10, alignment=1))
styles.add(ParagraphStyle(name="SubHeader", fontSize=14, leading=18, spaceAfter=10, textColor=colors.darkblue))
styles.add(ParagraphStyle(name="Body", fontSize=11.5, leading=16))
styles.add(ParagraphStyle(name="Footer", fontSize=9, alignment=1, textColor=colors.grey))

def generate_report(df: pd.DataFrame, output_path: str, query: str, graphs: list, author: str = "Sujnan", title: str = "Report") -> None:
    """
    Generate an executive-level PDF report using Gemini AI based on a dataframe and query.

    Args:
        df (pd.DataFrame): Data to analyze.
        query (str): The user's prompt or question.
        author (str): Name to display as the author in the PDF.
        output_path (str): Output PDF file name.

    Returns:
        None. Saves a well-formatted PDF report to disk.
    """
    data_description = df.to_string(index=False)

    prompt = f"""
    You are a professional data analyst. Analyze the following dataset and generate a **clean, structured, executive-level report** based on the query.

    ### Dataset:
    {data_description}

    ### Query:
    {query}

    ### Output Style:
    - Executive summary
    - Key observations
    - Patterns (spikes, dips, trends)
    - Conclusions & recommendations

    Return a clean plain-text report only, no markdown or special formatting.
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    report_text = response.text.strip()

    print("Grpahs here : ", graphs)

    _create_pdf(report_text, output_path=output_path, author=author, graphs=graphs)


def _create_pdf(report_text: str, output_path: str, author: str, graphs: list):
    """
    Render the report text and optional graph images into a styled PDF report.

    Args:
        report_text (str): The main text content of the report.
        output_path (str): The file path to save the PDF.
        author (str): Name of the report author.
        graphs (list): List of full image file paths to embed.

    Returns:
        None
    """
    doc = SimpleDocTemplate(output_path, pagesize=A4,
                            rightMargin=50, leftMargin=50,
                            topMargin=72, bottomMargin=50)
    story = []

    # Header
    story.append(Paragraph("Executive Data Analysis Report", styles['Header']))
    story.append(Paragraph(f"Author: {author}", styles['Body']))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y')}", styles['Body']))
    story.append(HRFlowable(width="100%", color=colors.grey, spaceBefore=8, spaceAfter=12))
    story.append(Spacer(1, 0.2 * inch))

    # Report Text Content
    for para in report_text.split("\n"):
        if para.strip().lower().startswith(("executive summary", "key observations", "conclusion", "recommendation")):
            story.append(Paragraph(para.strip(), styles['SubHeader']))
        elif para.strip().endswith(":"):
            story.append(Spacer(1, 0.1 * inch))
            story.append(Paragraph(para.strip(), styles['SubHeader']))
        elif para.strip():
            story.append(Paragraph(para.strip(), styles['Body']))
            story.append(Spacer(1, 0.12 * inch))

    # Embedded Graphs Section
    if graphs != []:
        print("Graph is there hurrya  : ", graphs)
        story.append(PageBreak())
        story.append(Paragraph("📊 Visual Summaries", styles['SubHeader']))
        for graph_path in graphs:
            try:
                story.append(Spacer(1, 0.2 * inch))
                story.append(Image(graph_path, width=6.5 * inch, height=3.5 * inch))
                story.append(Spacer(1, 0.3 * inch))
            except Exception as e:
                story.append(Paragraph(f"⚠️ Failed to embed graph: {graph_path}", styles['Body']))
                story.append(Paragraph(f"Error: {str(e)}", styles['Body']))

    # Footer
    story.append(Spacer(1, 0.4 * inch))
    story.append(HRFlowable(width="100%", color=colors.grey))
    story.append(Paragraph("Confidential - Generated by AI | Crypton Club | © 2025", styles['Footer']))

    doc.build(story)
    print(f"\n✅ Final PDF report saved at: {output_path}")
