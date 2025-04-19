from fpdf import FPDF
from .. import models
import logging
import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDF(FPDF):
    def header(self):
        # Arial bold 15
        self.set_font('Arial', 'B', 15)
        # Move to the right
        self.cell(80)
        # Title
        self.cell(30, 10, 'Meeting Notes Report', 0, 0, 'C')
        # Line break
        self.ln(20)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('Arial', 'I', 8)
        # Page number
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')

def generate_meeting_pdf(meeting: models.Meeting) -> bytes:
    """
    Generates a PDF report for a meeting using fpdf2.
    Includes filename, date, summary, action items, and optionally the transcript.
    Returns the PDF content as bytes.
    """
    logger.info(f"Generating PDF for meeting {meeting.id}...")

    try:
        pdf = PDF()
        pdf.alias_nb_pages() # Enable page numbering alias {nb}
        pdf.add_page()
        pdf.set_font("Arial", size=12)

        # --- Meeting Info ---
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, txt="Meeting Details", ln=1)
        pdf.set_font("Arial", size=12)
        pdf.cell(0, 7, txt=f"Original Filename: {meeting.filename or 'N/A'}", ln=1)
        upload_time_str = meeting.upload_time.strftime("%Y-%m-%d %H:%M:%S UTC") if meeting.upload_time else "N/A"
        pdf.cell(0, 7, txt=f"Uploaded On: {upload_time_str}", ln=1)
        pdf.cell(0, 7, txt=f"Processing Status: {meeting.status.value}", ln=1)
        pdf.ln(5)

        # --- Summary ---
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, txt="Summary", ln=1)
        pdf.set_font("Arial", size=12)
        # Encode text to handle potential unicode errors before adding to cell
        summary_text = (meeting.summary or "No summary generated.").encode('latin-1', errors='replace').decode('latin-1')
        pdf.multi_cell(0, 7, txt=summary_text)
        pdf.ln(5)

        # --- Action Items ---
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, txt="Action Items", ln=1)
        pdf.set_font("Arial", size=12)
        # Encode text to handle potential unicode errors
        action_items_text = (meeting.action_items or "No action items identified.").encode('latin-1', errors='replace').decode('latin-1')
        pdf.multi_cell(0, 7, txt=action_items_text)
        pdf.ln(10)

        # --- Transcript (Optional - Add a page break if long) ---
        if meeting.transcript:
            pdf.add_page() # Start transcript on a new page
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(0, 10, txt="Full Transcript", ln=1)
            pdf.set_font("Arial", size=10) # Smaller font for transcript
            # Encode text to handle potential unicode errors
            transcript_text = meeting.transcript.encode('latin-1', errors='replace').decode('latin-1')
            pdf.multi_cell(0, 5, txt=transcript_text)

        # Generate PDF bytes
        # pdf.output(dest='S') already returns bytes (or bytearray)
        pdf_bytes = pdf.output(dest='S') 
        logger.info(f"PDF generation complete for meeting {meeting.id}.")
        return bytes(pdf_bytes) # Ensure it's returned as standard bytes type

    except Exception as e:
        logger.error(f"Error generating PDF for meeting {meeting.id}: {e}", exc_info=True)
        # Return empty bytes or raise an exception depending on desired error handling
        return b""
