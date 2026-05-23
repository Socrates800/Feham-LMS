<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class PdfService
{
    public function challan(array $data): Response
    {
        $pdf = Pdf::loadView('pdf.challan', $data);

        return $pdf->download('challan-'.$data['challan']->challan_number.'.pdf');
    }

    public function salarySlip(array $data): Response
    {
        $pdf = Pdf::loadView('pdf.salary-slip', $data);

        return $pdf->download('salary-'.$data['slip']->id.'.pdf');
    }
}
