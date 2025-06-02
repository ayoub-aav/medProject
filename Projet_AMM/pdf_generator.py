import os
from fpdf import FPDF
from datetime import datetime, timedelta
import random
import hashlib
import qrcode
import io

class PDFGenerator:
    def __init__(self):
        self.font_path = None  # Set to your font file if needed
        self.logo_path = None  # Set to 'logo.png' if you have one
        
        # Create output directory if it doesn't exist
        os.makedirs("pdf_output", exist_ok=True)

    def generate_hash(self, data):
        """Generate SHA-256 hash of document content"""
        return hashlib.sha256(data.encode()).hexdigest()

    def add_qr_code(self, pdf, data, x, y, size=30):
        """Add QR code with verification data"""
        try:
            qr = qrcode.QRCode(version=1, box_size=2, border=2)
            qr.add_data(data)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            pdf.image(img_bytes, x=x, y=y, w=size)
        except Exception as e:
            print(f"QR code generation failed: {e}")

    def create_amm_pdf(self, is_valid=True):
        """Generate AMM PDF document (fraud version without red markings)"""
        try:
            # Document data with suspicious values
            data = {
                'num_amm': 'AMM-2023-' + str(random.randint(1000, 9999)),
                'medicament': 'PARACETAMOL ZENITH 1000mg',  # Suspiciously high dosage
                'substance': 'paracétamol',
                'forme': 'comprimé pelliculé',
                'fab_date': (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d'),
                'exp_date': (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d'),  # Short expiration
                'fabricant': 'LABORATOIRES ZENITH',
                'pays': 'France',
                'lot': 'LOT' + str(random.randint(100, 999)),  # Suspiciously short lot number
                'cond_temp': '2-8°C',
                'cond_hum': 'max 60%'
            }

            doc_content = f"{data['num_amm']}{data['medicament']}{data['fab_date']}{data['exp_date']}"
            data['hash_securite'] = self.generate_hash(doc_content)[:32]

            pdf = FPDF()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)

            # Set font (using default if custom font not available)
            pdf.set_font("helvetica", size=12)

            # Header
            pdf.set_font("helvetica", 'B', 16)
            pdf.cell(0, 10, 'ATTESTATION DE MISE SUR LE MARCHÉ', 0, 1, 'C')
            pdf.ln(10)

            # Main content
            fields = [
                ('Numéro AMM', data['num_amm']),
                ('Médicament', data['medicament']),
                ('Substance Active', data['substance']),
                ('Forme Pharmaceutique', data['forme']),
                ('Date Fabrication', data['fab_date']),
                ('Date Péremption', data['exp_date']),
                ('Fabricant', data['fabricant']),
                ('Pays d\'Origine', data['pays']),
                ('Numéro de Lot', data['lot']),
                ('Conditions de Conservation', f"{data['cond_temp']}, {data['cond_hum']}"),
            ]

            for label, value in fields:
                pdf.cell(60, 8, label + ':', 0, 0)
                pdf.set_font("helvetica", 'B', 12)
                pdf.cell(0, 8, value, 0, 1)
                pdf.set_font("helvetica", size=12)
                pdf.ln(3)

            # Security features
            self.add_qr_code(pdf, 
                f"AMM:{data['num_amm']}|HASH:{data['hash_securite']}", 
                x=160, y=pdf.get_y())

            # Save to file
            filename = f"pdf_output/{data['num_amm']}_FRAUD.pdf"
            pdf.output(filename)
            print(f"Successfully generated fraudulent document: {filename}")
            return filename

        except Exception as e:
            print(f"Error generating PDF: {e}")
            return None

if __name__ == "__main__":
    generator = PDFGenerator()
    print("Generating fraudulent PDF...")
    fraud_pdf = generator.create_amm_pdf(is_valid=False)
    print("Done! Check the 'pdf_output' folder.")