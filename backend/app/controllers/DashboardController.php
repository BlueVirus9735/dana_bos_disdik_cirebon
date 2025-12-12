<?php
require_once __DIR__ . "/../models/IjazahModel.php";
require_once __DIR__ . "/../models/EvaluasiBosModel.php";

class DashboardController {
    
    public function getStats() {
        $ijazahModel = new IjazahModel();
        $bosModel = new EvaluasiBosModel();

        try {
            $totalIjazah = $ijazahModel->countAll();
            $recentIjazah = $ijazahModel->getRecent(5);
            $yearDistribution = $ijazahModel->getYearDistribution();

            $totalSiswa = $bosModel->getTotalSiswa();
            $totalDanaBos = $bosModel->getTotalDanaBos();
            $countSekolah = $bosModel->countSekolah();
            $akreditasiDist = $bosModel->getAkreditasiDistribution();

            // Prepare Chart Data
            $chartData = [];
            foreach ($yearDistribution as $item) {
                $chartData[] = [
                    'name' => (string)$item['tahun'],
                    'value' => (int)$item['count']
                ];
            }

            // Prepare Pie Data
            $pieData = [];
            foreach ($akreditasiDist as $item) {
                $pieData[] = [
                    'name' => "Akreditasi " . $item['akreditasi'],
                    'value' => (int)$item['count']
                ];
            }

            echo json_encode([
                "status" => "success",
                "data" => [
                    "counts" => [
                        "total_ijazah" => $totalIjazah,
                        "total_sekolah" => $countSekolah,
                        "total_siswa" => number_format($totalSiswa, 0, ',', '.'),
                        "total_dana_bos" => (float)$totalDanaBos,
                    ],
                    "charts" => [
                        "ijazah_per_year" => $chartData,
                        "akreditasi_distribution" => $pieData
                    ],
                    "recent_docs" => $recentIjazah
                ]
            ]);

        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}
?>
