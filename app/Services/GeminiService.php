<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    public function generateTasks(string $title, ?string $description = null): array
    {
        $prompt = "Generate a JSON array of project tasks. Project title: {$title}. Project description: {$description}.
Requirements:
- Generate 5-8 realistic tasks.
- Each task must contain strictly these keys: title, description, priority (priority only: low, medium, high, critical).";

        try {
            $apiKey = env('GEMINI_API_KEY');

            if (empty($apiKey)) throw new \Exception('API ключ не знайдено в .env файлі');

            // Передаємо ключ через заголовок x-goog-api-key
            $response = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                ]
            ]);

            // Логуємо помилку
            if (!$response->successful()) {
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $response->json() ?? $response->body()
                ]);
                throw new \Exception('Помилка Gemini API. Перевірте логи.');
            }

            $text = data_get($response->json(), 'candidates.0.content.parts.0.text');

            $decoded = json_decode(trim($text), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Помилка парсингу JSON', ['raw_text' => $text]);
                throw new \Exception('Gemini повернув невалідний JSON');
            }

            return $decoded;

        } catch (\Exception $e) {
            Log::error('GeminiService Exception: ' . $e->getMessage());
            throw $e;
        }
    }
}

// Gemini 2.5 Pro