<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function analytics(Request $request)
    {
        $period = $request->get('period', 'daily'); // daily, weekly, monthly

        return response()->json([
            'stats' => $this->getStats($period),
            'sales_trend' => $this->getSalesTrend($period),
            'top_products' => $this->getTopProducts(),
            'low_stock_products' => $this->getLowStockProducts(),
            'recent_sales' => $this->getRecentSales(),
        ]);
    }

    private function getStats($period)
    {
        $startDate = $this->getStartDate($period);

        $totalSales = Sale::where('created_at', '>=', $startDate)->sum('total_amount');
        $totalOrders = Sale::where('created_at', '>=', $startDate)->count();
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        $previousStart = $this->getPreviousStartDate($period);
        $previousSales = Sale::whereBetween('created_at', [$previousStart, $startDate])->sum('total_amount');
        
        $growth = $previousSales > 0 
            ? (($totalSales - $previousSales) / $previousSales) * 100 
            : 0;

        return [
            'total_sales' => round($totalSales, 2),
            'total_orders' => $totalOrders,
            'average_order_value' => round($avgOrderValue, 2),
            'growth_percentage' => round($growth, 2),
            'period' => ucfirst($period),
        ];
    }

    private function getSalesTrend($period)
    {
        $startDate = $this->getStartDate($period);
        $groupBy = $period === 'monthly' ? '%Y-%m-%d' : '%Y-%m-%d %H:00:00';

        return Sale::where('created_at', '>=', $startDate)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$groupBy}') as period"),
                DB::raw('SUM(total_amount) as total'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();
    }

    private function getTopProducts()
    {
        return DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->select(
                'products.name',
                'products.category',
                DB::raw('SUM(sale_items.quantity) as total_sold'),
                DB::raw('SUM(sale_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.category')
            ->orderBy('total_sold', 'desc')
            ->limit(10)
            ->get();
    }

    private function getLowStockProducts()
    {
        return Product::whereRaw('stock <= low_stock_threshold')
            ->where('is_active', true)
            ->select('id', 'name', 'category', 'stock', 'low_stock_threshold')
            ->orderBy('stock')
            ->get();
    }

    private function getRecentSales()
    {
        return Sale::with(['user', 'items'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    private function getStartDate($period)
    {
        return match($period) {
            'daily' => Carbon::today(),
            'weekly' => Carbon::now()->startOfWeek(),
            'monthly' => Carbon::now()->startOfMonth(),
            default => Carbon::today(),
        };
    }

    private function getPreviousStartDate($period)
    {
        return match($period) {
            'daily' => Carbon::yesterday(),
            'weekly' => Carbon::now()->subWeek()->startOfWeek(),
            'monthly' => Carbon::now()->subMonth()->startOfMonth(),
            default => Carbon::yesterday(),
        };
    }
}