<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
                          ->paginate($request->get('per_page', 20));

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')
                ->store('products', 'public');
        }

        $product = Product::create($validated);

        return response()->json($product, 201);
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



}}

