<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    description: "L5 Swagger OpenApi description",
    title: "Transport API",
)]
#[OA\Server(
    url: L5_SWAGGER_CONST_HOST,
    description: "Demo API Server"
)]
abstract class Controller
{
    #[OA\Get(
        path: '/api/test',
        summary: 'Test endpoint',
        tags: ['Test'],
        responses: [
            new OA\Response(response: 200, description: 'Success')
        ]
    )]
    public function test()
    {
        return response()->json(['message' => 'Success']);
    }
}
