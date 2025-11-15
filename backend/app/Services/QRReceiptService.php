<?php

namespace App\Services;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;

class QRReceiptService
{
    public function generateQR($url, $receiptNumber)
    {
        try {
            \Log::info('Generating QR Code', ['url' => $url, 'receipt' => $receiptNumber]);

            // Ensure receipts directory exists
            if (!Storage::disk('public')->exists('receipts')) {
                Storage::disk('public')->makeDirectory('receipts');
            }

            // Build QR code
            $result = Builder::create()
                ->writer(new PngWriter())
                ->data($url)
                ->size(300)
                ->margin(10)
                ->build();

            // Save to storage
            $filename = "receipts/qr_{$receiptNumber}.png";
            Storage::disk('public')->put($filename, $result->getString());

            // Verify file was created
            if (Storage::disk('public')->exists($filename)) {
                \Log::info('QR Code created successfully', ['path' => $filename]);
                return $filename;
            } else {
                \Log::error('QR Code file not found after creation');
                return null;
            }
        } catch (\Exception $e) {
            \Log::error('QR Code generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    public function getQRPath($filename)
    {
        return Storage::url($filename);
    }
}