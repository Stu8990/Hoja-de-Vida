function generatePDF() {
    // Ocultar el botón temporalmente
    const button = document.getElementById('downloadPDF');
    button.style.display = 'none';

    // Configuración del PDF
    const element = document.querySelector('.cv-container');
    const opt = {
        margin: [0, 0, 0, 0],
        filename: 'Stuart_Palma_CV.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generar PDF
    html2pdf().set(opt).from(element).save().then(() => {
        // Mostrar el botón de nuevo
        button.style.display = 'flex';
    }).catch((error) => {
        console.error('Error al generar PDF:', error);
        button.style.display = 'flex';
        alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
    });
}

// Prevenir que el botón se incluya en el PDF al imprimir
window.addEventListener('beforeprint', () => {
    const button = document.getElementById('downloadPDF');
    if (button) button.style.display = 'none';
});

window.addEventListener('afterprint', () => {
    const button = document.getElementById('downloadPDF');
    if (button) button.style.display = 'flex';
});
