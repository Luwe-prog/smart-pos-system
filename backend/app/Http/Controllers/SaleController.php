<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Services\QRReceiptService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    protected $qrService;

    public function __construct(QRReceiptService $qrService)
    {
        $this->qrService = $qrService;
    }

    public function index(Request $request)
    {
        $query = Sale::with(['user', 'items.product']);

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $sales = $query->orderBy('created_at', 'desc')
                       ->paginate($request->get('per_page', 60));

        return response()->json($sales);
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'items' => 'required|array|min:1',
        'items.*.product_id' => 'required|exists:products,id',
        'items.*.quantity' => 'required|integer|min:1',
        'payment_type' => 'required|in:cash,card,digital',
        'payment_received' => 'nullable|numeric|min:0',
        'discount' => 'nullable|numeric|min:0',
    ]);

    return DB::transaction(function () use ($request, $validated) {
        // Calculate totals
        $subtotal = 0;
        $saleItems = [];

        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            
            // Check stock
            if ($product->stock < $item['quantity']) {
                throw new \Exception("Insufficient stock for {$product->name}");
            }

            $itemSubtotal = $product->price * $item['quantity'];
            $subtotal += $itemSubtotal;

            $saleItems[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
                'subtotal' => $itemSubtotal,
            ];

            // Reduce stock
            $product->reduceStock($item['quantity']);
        }

        $discount = $validated['discount'] ?? 0;
        $tax = ($subtotal - $discount) * 0.10; // 10% tax
        $total = $subtotal - $discount + $tax;

        // Create sale
        $sale = Sale::create([
            'user_id' => $request->user()->id,
            'receipt_number' => Sale::generateReceiptNumber(),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'discount' => $discount,
            'total_amount' => $total,
            'payment_type' => $validated['payment_type'],
            'payment_received' => $validated['payment_received'] ?? $total,
            'change_amount' => max(0, ($validated['payment_received'] ?? $total) - $total),
        ]);

        // Create sale items
        foreach ($saleItems as $item) {
            $sale->items()->create($item);
        }

        // Generate QR receipt
        try {
            $receiptUrl = url("/receipt/{$sale->receipt_number}");
            $qrPath = $this->qrService->generateQR($receiptUrl, $sale->receipt_number);
            
            if ($qrPath) {
                $sale->update([
                    'qr_code_path' => $qrPath,
                    'receipt_url' => $receiptUrl,
                ]);
            }
        } catch (\Exception $e) {
            // Log error but don't fail the sale
            \Log::error('QR generation failed: ' . $e->getMessage());
        }

        return response()->json([
            'sale' => $sale->load(['items', 'user']),
            'message' => 'Sale completed successfully'
        ], 201);
    });
}

    public function show(Sale $sale)
    {
        return response()->json($sale->load(['user', 'items.product']));
    }

    public function receipt($receiptNumber)
    {
        $sale = Sale::where('receipt_number', $receiptNumber)
            ->with(['user', 'items'])
            ->firstOrFail();

        return response()->json($sale);
    }
}

