# Standard Operating Procedure (SOP): Printable Document Generator
**Reference: Payslip Generator Implementation**

This document outlines the "Formula" and best practices for creating high-quality, printable documents (like Certificates, Invoices, or Payslips) in this project. Follow these settings to ensure precision, sharpness, and correct layout.

## 1. Page Layout & Dimensions (A4)

### CSS Configuration
Always use a fixed width in millimeters (mm) matching the physical paper size. Use `min-height` to allow content to expand if necessary, but try to fit within the fixed height for single-page documents.

**A4 Landscape:**
- Width: `297mm`
- Height: `210mm`
- Padding (Margins): `30mm` (Standard formal margin)

**A4 Portrait:**
- Width: `210mm`
- Height: `297mm`
- Padding (Margins): `30mm`

### Container Code Snippet
```tsx
<div 
    ref={documentRef}
    className="mx-auto bg-white shadow-2xl print:shadow-none print:mx-0 relative"
    style={{ width: '297mm', minHeight: '210mm', padding: '30mm' }}
>
    {/* Content goes here */}
</div>
```

### Print Styles (Global or Inline)
Inject these styles to ensure the browser's print dialog respects your settings.
```tsx
<style>
    {`
    @page {
        size: A4 landscape; /* or portrait */
        margin: 0; /* Let the container padding handle margins */
    }
    @media print {
        body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }
    `}
</style>
```

## 2. Typography & Rendering Sharpness

To prevent blurry text and ensure the document looks professional (crisp) on screen and in PDF:

- **Classes**: Always add `antialiased subpixel-antialiased`.
- **Color**: Use `text-gray-900` (Jet Black) for primary text. Avoid `text-gray-500` for small text as it may become unreadable when printed; use `text-gray-600` or darker.
- **Font**: For formal documents, use a serif font for headers: `style={{ fontFamily: '"Times New Roman", Times, serif' }}`.

## 3. Input Fields (The "ContentEditable" Rule)

**Do NOT use `<input>` tags for printable forms.**
Standard inputs have fixed heights, clip text (descenders like g, j, y), and don't wrap long text.

**Use `contentEditable` Divs instead:**
This allows the field to grow with content and renders text perfectly without clipping.

### Component Pattern
```tsx
<div
    contentEditable
    suppressContentEditableWarning
    onBlur={(e) => handleUpdate(e.currentTarget.textContent)}
    className="w-full bg-transparent h-auto min-h-[24px] py-1 leading-relaxed 
               text-gray-900 focus:outline-none focus:bg-orange-50 
               rounded px-1 transition-colors antialiased 
               break-words whitespace-pre-wrap"
>
    {value}
</div>
```

### Data Sanitization (For Numbers)
Since `contentEditable` works with strings, you must sanitize input for numeric fields.
```typescript
const handleAmountBlur = (id: number, value: string) => {
    // Remove non-digits, convert to number
    const numericValue = Number(value.replace(/\D/g, '')) || 0;
    updateState(id, numericValue);
};
```

## 4. Logo & Images (Anti-Distortion)

Flexbox containers often squeeze images. Always protect your logo.

- **Wrapper**: Wrap the logo in a div with `flex-shrink-0`.
- **SVG**: Ensure the SVG has a `viewBox` (e.g., `0 0 100 100`) and avoid fixed width/height attributes on the `<svg>` tag itself; control size via Tailwind classes on the parent.

```tsx
<div className="flex-shrink-0">
    <Logo size="xl" />
</div>
```

## 5. PDF Generation Strategy

Use `html2canvas` + `jspdf` for high-fidelity client-side generation.

### Configuration Formula
```typescript
const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    
    // 1. Capture Canvas
    const canvas = await html2canvas(documentRef.current, {
        scale: 2, // 2x scale for Retina-like sharpness
        useCORS: true, // Allow loading external images
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1123, // A4 Landscape px width (approx)
        windowHeight: 794
    });

    // 2. Convert to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'landscape', // or 'portrait'
        unit: 'mm',
        format: 'a4'
    });

    // 3. Add Image (Full Page)
    const pdfWidth = 297; // mm
    const pdfHeight = 210; // mm
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    pdf.save('Document_Name.pdf');
};
```

## 6. Footer & Signatures

- **Symmetry**: Use `flex-1 basis-0` for equal-width columns (e.g., Left, Center, Right).
- **Space**: Always set a `min-height` (e.g., `h-32`) for the signature area to ensure it doesn't collapse if empty.
