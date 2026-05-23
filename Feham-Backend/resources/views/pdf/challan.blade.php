<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1e293b; margin: 24px; }
        .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
        .school-name { font-size: 22px; font-weight: bold; color: #4338ca; }
        .challan-no { font-size: 18px; font-weight: bold; margin-top: 8px; }
        .meta td { padding: 4px 8px; }
        table.items { width: 100%; border-collapse: collapse; margin: 16px 0; }
        table.items th, table.items td { border: 1px solid #e2e8f0; padding: 8px; }
        table.items th { background: #eef2ff; }
        .total { font-weight: bold; }
        .bank { margin-top: 20px; padding: 12px; background: #f8fafc; }
        .cut-line { border-top: 2px dashed #94a3b8; margin: 24px 0; text-align: center; color: #64748b; font-size: 10px; }
        .footer { text-align: center; font-size: 10px; color: #64748b; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="header">
        <p class="school-name">{{ $school->name }}</p>
        <p>{{ $school->address }}</p>
        <p class="challan-no">Challan #{{ $challan->challan_number }}</p>
    </div>

    <table class="meta">
        <tr><td><strong>Student:</strong></td><td>{{ $challan->student->name }}</td></tr>
        <tr><td><strong>Roll No:</strong></td><td>{{ $challan->student->roll_number }}</td></tr>
        <tr><td><strong>Class:</strong></td><td>{{ $challan->student->section->schoolClass->name }} - {{ $challan->student->section->name }}</td></tr>
        <tr><td><strong>Month:</strong></td><td>{{ $challan->month }}</td></tr>
        <tr><td><strong>Due Date:</strong></td><td>{{ $challan->due_date->format('d M Y') }}</td></tr>
    </table>

    <table class="items">
        <thead>
            <tr><th>Fee Item</th><th style="text-align:right">Amount (PKR)</th></tr>
        </thead>
        <tbody>
            @foreach($challan->fee_items_snapshot as $item)
            <tr>
                <td>{{ $item['label'] }}</td>
                <td style="text-align:right">{{ number_format($item['amount'], 2) }}</td>
            </tr>
            @endforeach
            <tr>
                <td class="total">Total</td>
                <td class="total" style="text-align:right">{{ number_format($challan->total_amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <section class="bank">
        <strong>Bank Details:</strong><br>
        {{ $school->bank_name }} — Account: {{ $school->bank_account }}
    </section>

    <p class="cut-line">— — — cut here — — —</p>
    <p class="footer">Pay at bank or online via Feham portal</p>
</body>
</html>
