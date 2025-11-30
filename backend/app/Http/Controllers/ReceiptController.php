<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReceiptController extends Controller
{
    public function show($receiptNumber)
    {
        try {
            // Get sale details
            $sale = DB::table('sales')
                ->join('users', 'sales.user_id', '=', 'users.id')
                ->where('sales.receipt_number', $receiptNumber)
                ->select(
                    'sales.*',
                    'users.name as cashier_name'
                )
                ->first();

            if (!$sale) {
                abort(404, 'Receipt not found');
            }

            // Get sale items with add-ons
            $items = DB::table('sale_items as si')
                ->where('si.sale_id', $sale->id)
                ->select('si.*')
                ->get();

            // Get add-ons for each item (if your system supports it)
            foreach ($items as $item) {
                $item->addons = DB::table('sale_item_addons')
                    ->where('sale_item_id', $item->id)
                    ->get();
            }

            return view('receipt', compact('sale', 'items'));
            
        } catch (\Exception $e) {
            abort(500, 'Error loading receipt: ' . $e->getMessage());
        }
    }
}