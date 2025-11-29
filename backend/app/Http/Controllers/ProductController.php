<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('category', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('low_stock')) {
            $query->whereRaw('stock <= low_stock_threshold');
        }

        $products = $query->where('is_active', true)
                          ->orderBy('name')
                          ->paginate($request->get('per_page', 60));

        return response()->json($products);
    }

 public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category' => 'required|string|max:100',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'low_stock_threshold' => 'nullable|integer|min:0',
                'description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            // Set default values
            $validated['is_active'] = true;
            if (!isset($validated['low_stock_threshold'])) {
                $validated['low_stock_threshold'] = 10;
            }

            if ($request->hasFile('image')) {
                $validated['image_path'] = $request->file('image')
                    ->store('products', 'public');
            }

            $product = Product::create($validated);

            \Log::info('Product created successfully:', ['id' => $product->id, 'name' => $product->name]);

            return response()->json([
                'success' => true,
                'data' => $product,
                'message' => 'Product created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error creating product:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('Error creating product:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function categories()
    {
        try {
            $categories = Product::where('is_active', true)
                ->select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category');

            return response()->json($categories);
        } catch (\Exception $e) {
            \Log::error('Categories error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to load categories',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Product $product)
    {
        // Debug: Log incoming data
        \Log::info('Update request data:', $request->all());

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Debug: Log validated data
        \Log::info('Validated data:', $validated);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $validated['image_path'] = $request->file('image')
                ->store('products', 'public');
        }

        $product->update($validated);

        // Debug: Log updated product
        \Log::info('Updated product:', $product->toArray());

        return response()->json([
            'product' => $product->fresh(), // Get fresh data from DB
            'message' => 'Product updated successfully'
        ]);
    }

    /**
     * Delete product with proper constraint handling
     * Uses soft delete (deactivate) if product has sales history
     */
    public function destroy(Product $product)
    {
        try {
            \Log::info('Attempting to delete product:', ['id' => $product->id, 'name' => $product->name]);

            // Check if product has sales history
            $salesCount = DB::table('sale_items')
                ->where('product_id', $product->id)
                ->count();

            // Check if product has inventory transactions
            $transactionsCount = DB::table('inventory_transactions')
                ->where('product_id', $product->id)
                ->count();

            \Log::info('Product usage check:', [
                'sales_count' => $salesCount,
                'transactions_count' => $transactionsCount
            ]);

            if ($salesCount > 0 || $transactionsCount > 0) {
                // Soft delete - mark as inactive instead of deleting
                $product->is_active = false;
                $product->save();

                \Log::info('Product deactivated (has history):', ['id' => $product->id]);

                return response()->json([
                    'success' => true,
                    'message' => "Product deactivated successfully. It has {$salesCount} sale(s) in history and cannot be permanently deleted.",
                    'deactivated' => true
                ], 200);
            }

            // No sales history - safe to delete permanently
            // Delete product image if exists
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }

            $product->delete();

            \Log::info('Product permanently deleted:', ['id' => $product->id]);

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
                'deleted' => true
            ], 200);

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error deleting product:', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ]);

            // Handle foreign key constraint errors
            if ($e->getCode() === '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete product - it is referenced in sales or transaction records. The product has been deactivated instead.'
                ], 400);
            }

            return response()->json([
                'success' => false,
                'message' => 'Database error while deleting product'
            ], 500);

        } catch (\Exception $e) {
            \Log::error('Unexpected error deleting product:', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred: ' . $e->getMessage()
            ], 500);
        }
    }
}