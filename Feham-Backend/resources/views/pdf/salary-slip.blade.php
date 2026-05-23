<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1e293b; margin: 24px; }
        .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
        .school-name { font-size: 20px; font-weight: bold; color: #4338ca; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; }
        th { background: #eef2ff; text-align: left; }
        .net { font-size: 16px; font-weight: bold; }
    </style>
</head>
<body>
    <header class="header">
        <p class="school-name">{{ $school->name }}</p>
        <p>Salary Slip — {{ $slip->month }}</p>
    </header>

    <table>
        <tr><td><strong>Teacher</strong></td><td>{{ $slip->teacher->user->name }}</td></tr>
        <tr><td><strong>Employee Code</strong></td><td>{{ $slip->teacher->employee_code }}</td></tr>
        <tr><td><strong>Status</strong></td><td>{{ ucfirst($slip->status) }}</td></tr>
    </table>

    <table>
        <tr><th>Component</th><th style="text-align:right">Amount (PKR)</th></tr>
        <tr><td>Base Salary</td><td style="text-align:right">{{ number_format($slip->base_salary, 2) }}</td></tr>
        <tr><td>Allowances</td><td style="text-align:right">{{ number_format($slip->allowances, 2) }}</td></tr>
        <tr><td>Deductions</td><td style="text-align:right">{{ number_format($slip->deductions, 2) }}</td></tr>
        <tr><td class="net">Net Salary</td><td class="net" style="text-align:right">{{ number_format($slip->net_salary, 2) }}</td></tr>
    </table>
</body>
</html>
