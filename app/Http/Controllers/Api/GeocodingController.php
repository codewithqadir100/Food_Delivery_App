<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GeocodingController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->query('q');
        
        if (!$query || strlen($query) < 2) {
            return response()->json([], 200);
        }

        try {
            $url = 'https://nominatim.openstreetmap.org/search?format=json&q=' . urlencode($query) . '&countrycodes=pk&limit=8';
            $response = $this->fetchFromNominatim($url);
            
            return response()->json($response ?? [], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Search failed'], 500);
        }
    }

    public function reverse(Request $request)
    {
        $lat = $request->query('lat');
        $lon = $request->query('lon');

        if (!$lat || !$lon) {
            return response()->json(['error' => 'Invalid coordinates'], 400);
        }

        try {
            $url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' . $lat . '&lon=' . $lon;
            $response = $this->fetchFromNominatim($url);
            
            return response()->json($response ?? [], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Reverse geocoding failed'], 500);
        }
    }

    private function fetchFromNominatim($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_USERAGENT, 'FoodDeliveryApp/1.0');
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            throw new \Exception('Nominatim request failed');
        }

        return json_decode($response, true);
    }
}