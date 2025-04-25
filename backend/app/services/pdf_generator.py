import logging
import datetime
import io
import os
import re
from xhtml2pdf import pisa # Import pisa
from jinja2 import Environment, FileSystemLoader, select_autoescape # Import Jinja2
from .. import models

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Helper function to clean basic Markdown ---
# (Keep this function as it might still be useful for pre-processing summary)
def _clean_markdown(text: str) -> str:
    if not text:
        return ""
    # Remove **bold** -> HTML <b>
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Remove *italic* -> HTML <i> (optional)
    # text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    # Remove ### headings
    text = re.sub(r'^\s*#+\s*', '', text, flags=re.MULTILINE).strip()
    # Convert Markdown list items (- item) to HTML list items
    # This is basic, might need refinement for nested lists etc.
    text = re.sub(r'^\s*-\s+(.*)', r'<li>\1</li>', text, flags=re.MULTILINE)
    # Wrap converted list items in <ul> if any were found
    if '<li>' in text:
         text = '<ul>\n' + text + '\n</ul>'
    # Remove horizontal rules like --- or ***
    text = re.sub(r'^\s*[-*_]{3,}\s*$', '<hr />', text, flags=re.MULTILINE).strip()
    # Replace double newlines with paragraph breaks (basic)
    text = re.sub(r'\n{2,}', '<br /><br />', text).strip()
    # Replace single newlines with line breaks (optional, depends on desired output)
    # text = text.replace('\n', '<br />')
    return text

# --- Setup Jinja2 Environment ---
# Assuming templates are in backend/app/templates
template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
if not os.path.isdir(template_dir):
     logger.warning(f"Template directory not found: {template_dir}. PDF generation might fail.")
     # Optionally create the directory if it's guaranteed to be needed
     # os.makedirs(template_dir, exist_ok=True)

try:
    jinja_env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=select_autoescape(['html', 'xml'])
    )
    template = jinja_env.get_template("pdf_template.html")
    logger.info("Jinja2 environment and PDF template loaded successfully.")
except Exception as e:
     logger.error(f"Failed to load Jinja2 environment or template: {e}", exc_info=True)
     template = None # Set template to None if loading fails

# --- PDF Generation Function using xhtml2pdf ---
def generate_meeting_pdf(meeting: models.Meeting) -> bytes:
    """
    Generates a PDF report for a meeting using xhtml2pdf from an HTML template.
    Returns the PDF content as bytes.
    """
    logger.info(f"Generating PDF for meeting {meeting.id} using xhtml2pdf...")

    if not template:
         logger.error("PDF template not loaded. Cannot generate PDF.")
         return b""

    try:
        # --- Prepare Context Data ---
        upload_time_str = meeting.upload_time.strftime("%Y-%m-%d %H:%M:%S UTC") if meeting.upload_time else "N/A"

        # Determine which language content to use
        use_zh = meeting.detected_language == 'zh'
        summary = meeting.summary_zh if use_zh else meeting.summary_en
        action_items = meeting.action_items_zh if use_zh else meeting.action_items_en

        # Pre-process summary text (basic markdown to HTML)
        summary_html = _clean_markdown(summary or "No summary generated.")

        context = {
            "meeting": meeting,
            "upload_time_str": upload_time_str,
            "summary_html": summary_html, # Pass pre-processed HTML
            "action_items": action_items or [], # Ensure it's a list
        }

        # --- Render HTML Template ---
        html_content = template.render(context)

        # --- Convert HTML to PDF ---
        result = io.BytesIO() # PDF is written to this buffer
        pdf_status = pisa.CreatePDF(
            src=html_content, # HTML content
            dest=result,      # File-like object to write to
            encoding='UTF-8'  # Ensure UTF-8 encoding
        )

        # Check for errors during PDF generation
        if pdf_status.err:
            logger.error(f"Error generating PDF for meeting {meeting.id}: {pdf_status.err}")
            return b""

        # Get PDF bytes from the buffer
        pdf_bytes = result.getvalue()
        result.close()

        logger.info(f"PDF generation complete for meeting {meeting.id} using xhtml2pdf.")
        return pdf_bytes

    except Exception as e:
        logger.error(f"Error generating PDF for meeting {meeting.id}: {e}", exc_info=True)
        return b""
