<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - {{ $sale->receipt_number }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            .no-print { display: none; }
            body { margin: 0; }
        }
    </style>
</head>
<body class="bg-gray-100 p-4">
    <div class="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 text-center">
            <h1 class="text-2xl font-bold">ButterBean Cafe</h1>
            <p class="text-sm mt-1">Thank you for your purchase!</p>
        </div>

        <!-- Receipt Details -->
        <div class="p-6 space-y-4">
            <!-- Receipt Info -->
            <div class="border-b pb-4">
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="text-gray-600">Receipt #:</div>
                    <div class="font-semibold text-right">{{ $sale->receipt_number }}</div>
                    
                    <div class="text-gray-600">Date:</div>
                    <div class="text-right">{{ date('M d, Y h:i A', strtotime($sale->created_at)) }}</div>
                    
                    <div class="text-gray-600">Cashier:</div>
                    <div class="text-right">{{ $sale->cashier_name }}</div>
                    
                    <div class="text-gray-600">Payment:</div>
                    <div class="text-right capitalize">{{ str_replace('_', ' ', $sale->payment_type) }}</div>
                </div>
            </div>

            <!-- Items -->
            <div class="space-y-3">
                <h3 class="font-bold text-lg">Items</h3>
                @foreach($items as $item)
                    <div class="border-b pb-2">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <p class="font-semibold">{{ $item->product_name }}</p>
                                <p class="text-sm text-gray-600">{{ $item->quantity }} x ₱{{ number_format($item->unit_price, 2) }}</p>
                                
                                <!-- Add-ons (if any) -->
                                @if(isset($item->addons) && count($item->addons) > 0)
                                    <div class="ml-4 mt-1 text-xs text-gray-500">
                                        @foreach($item->addons as $addon)
                                            <div>• {{ $addon->addon_name }} (+₱{{ number_format($addon->addon_price, 2) }})</div>
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                            <p class="font-bold">₱{{ number_format($item->subtotal, 2) }}</p>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Totals -->
            <div class="border-t pt-4 space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal:</span>
                    <span>₱{{ number_format($sale->subtotal, 2) }}</span>
                </div>
                
                @if($sale->discount > 0)
                    <div class="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-₱{{ number_format($sale->discount, 2) }}</span>
                    </div>
                @endif
                
                @if($sale->tax > 0)
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Tax:</span>
                        <span>₱{{ number_format($sale->tax, 2) }}</span>
                    </div>
                @endif
                
                <div class="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Total:</span>
                    <span class="text-amber-600">₱{{ number_format($sale->total_amount, 2) }}</span>
                </div>
                
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Payment Received:</span>
                    <span>₱{{ number_format($sale->payment_received, 2) }}</span>
                </div>
                
                @if($sale->change_amount > 0)
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Change:</span>
                        <span>₱{{ number_format($sale->change_amount, 2) }}</span>
                    </div>
                @endif
            </div>

            <!-- QR Code -->
            @if($sale->qr_code_path)
                <div class="text-center pt-4 border-t">
                    <p class="text-sm text-gray-600 mb-2">Scan for digital receipt</p>
                    <img 
                        src="{{ asset('storage/' . $sale->qr_code_path) }}" 
                        alt="QR Code" 
                        class="w-32 h-32 mx-auto"
                    >
                </div>
            @endif

            <!-- Footer -->
            <div class="text-center text-sm text-gray-500 pt-4 border-t">
                <p>Visit us again soon!</p>
                <p class="mt-1">www.butterbeancafe.com</p>
            </div>
        </div>

        <!-- Print Button -->
        <div class="p-4 bg-gray-50 no-print">
            <button 
                onclick="window.print()" 
                class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
                Print Receipt
            </button>
        </div>
    </div>
</body>
</html>
```

