<?php

require_once __DIR__ . "/../models/EvaluasiBosModel.php";

class DashboardController {
    
    public function getStats() {

        $bosModel = new EvaluasiBosModel();

        try {


            $totalSiswa = $bosModel->getTotalSiswa();
            $totalDanaBos = $bosModel->getTotalDanaBos();
            $countSekolah = $bosModel->countSekolah();
            $akreditasiDist = $bosModel->getAkreditasiDistribution();



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
                        "total_sekolah" => $countSekolah,
                        "total_siswa" => number_format($totalSiswa, 0, ',', '.'),
                        "total_dana_bos" => (float)$totalDanaBos,
                    ],
                    "charts" => [
                        "akreditasi_distribution" => $pieData
                    ]
                ]
            ]);

        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}
?>
