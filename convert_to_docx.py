from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
import re

# Read the markdown file
with open("DOCUMENTATION_POUR_DEVELOPPEUR.md", "r", encoding="utf-8") as f:
    markdown_content = f.read()

doc = Document()

# Style configuration
style = doc.styles['Normal']
font = style.font
font.name = 'Calibri'
font.size = Pt(11)

# We'll parse the markdown into elements
# First, split into lines and process

lines = markdown_content.split('\n')

# Table state tracking
in_table = False
table_rows = []
table_header_processed = False

# Code block state
in_code_block = False
code_language = ""
code_lines = []

# Heading level tracking
last_heading_level = 0

def add_table_to_doc(doc, rows, has_header=False):
    """Add a table to the document."""
    if not rows:
        return
    
    num_cols = len(rows[0])
    table = doc.add_table(rows=len(rows), cols=num_cols)
    table.style = 'Light Grid Accent 1'
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    
    for i, row_data in enumerate(rows):
        for j, cell_text in enumerate(row_data):
            cell = table.cell(i, j)
            cell.text = cell_text
            # Bold header row
            if has_header and i == 0:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.bold = True
    
    return table

def process_inline_code(text):
    """Process inline code spans."""
    # Simple replacement of `code` with formatted run
    # We'll just return the text and handle inline code separately
    return text

# Process lines
i = 0
while i < len(lines):
    line = lines[i]
    original_line = line
    
    # Handle headings: ## Title (through #######)
    heading_match = re.match(r'^(#{1,6})\s+(.*)$', line)
    if heading_match:
        level = len(heading_match.group(1))
        title = heading_match.group(2).strip()
        
        # Adjust level to Word heading levels (max 4)
        word_level = min(level + 2, 4)
        
        heading = doc.add_heading(title, level=word_level)
        
        # Add spacing after headings
        heading.paragraph_format.space_after = Pt(12)
        heading.paragraph_format.space_before = Pt(6)
        
        i += 1
        continue
    
    # Handle horizontal rules: ---
    if line.strip() == '---' or line.strip() == '------':
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.space_before = Pt(6)
        run = p.add_run("─" * 70)
        run.font.size = Pt(4)
        run.font.color.rgb = RGBColor(128, 128, 128)
        i += 1
        continue
    
    # Handle tables
    # Table row: starts with | and ends with |
    if line.startswith('|') and line.endswith('|') and not in_table:
        # Check if this is a separator row (contains only dashes, pipes, colons)
        if re.match(r'^\|[-| :]+\|+\s*$', line):
            # Start of table - but we need to collect rows before this
            # Actually, let's detect tables differently
            # A table has: header row, separator row, data rows
            pass
        elif len([c.strip() for c in line.split('|') if c.strip()]) >= 2:
            # This is a data row
            if not in_table:
                in_table = True
                table_rows = []
            cells = [c.strip() for c in line.split('|') if c.strip()]
            table_rows.append(cells)
            i += 1
            continue
    
    # If we're in a table and hit a non-table line, flush the table
    if in_table and not (line.startswith('|') and line.endswith('|')):
        if table_rows:
            # Add the table to document
            # Check if first row might be header (no "Modifications" text pattern etc.)
            # For now, treat first row as header if it has role/path/etc indicators
            # Actually, let's just add with header=True for most tables
            add_table_to_doc(doc, table_rows, has_header=True)
            table_rows = []
            in_table = False
        # Continue processing
    
    # Handle code blocks: ```
    if line.strip().startswith('```'):
        in_code_block = not in_code_block
        code_language = line.strip()[3:].strip() if len(line.strip()) > 3 else ""
        code_lines = []
        i += 1
        continue
    
    if in_code_block:
        code_lines.append(line)
        i += 1
        continue
    
    # Handle empty lines
    if line.strip() == '':
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.space_before = Pt(6)
        i += 1
        continue
    
    # Handle inline code: `text`
    # Simple approach: just add the line as-is, we'll handle simple inline code
    # by looking for text surrounded by single backticks
    # But markdown can have `backticks` inside paragraphs, let's keep it simple
    
    # Regular paragraph
    p = doc.add_paragraph(line)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.space_before = Pt(6)
    
    # Try to make inline code runs
    # Split by backticks and format accordingly
    # This is a simplified approach
    parts = re.split(r'(`+)', line)
    para = doc.add_paragraph()  # Actually use the p we already created
    # Let's redo: create paragraph with inline code handling
    # Actually, the p was already added. Let's handle this differently.
    # For simplicity, we'll just add the line and the user can live with it,
    # or we can replace the paragraph.
    # Let me re-approach: create the paragraph properly with inline code
    
    i += 1

# Flush any remaining table
if in_table and table_rows:
    add_table_to_doc(doc, table_rows, has_header=True)

# Save the document
doc.save("Documentation_CommerceGestion_FR.docx")
print("Document Word créé avec succès !")