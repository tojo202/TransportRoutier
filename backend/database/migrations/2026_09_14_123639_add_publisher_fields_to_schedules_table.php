<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->unsignedBigInteger('agency_id')->nullable()->after('driver_id');
            $table->string('published_by', 20)->default('admin')->after('agency_id');

            $table->foreign('agency_id')
                ->references('id')
                ->on('agencies')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropForeign(['agency_id']);
            $table->dropColumn(['agency_id', 'published_by']);
        });
    }
};
