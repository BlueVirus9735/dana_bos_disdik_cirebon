<?php
require_once __DIR__ . "/../models/SekolahModel.php";
require_once __DIR__ . "/../models/EvaluasiBosModel.php";
require_once __DIR__ . "/../models/ClusteringModel.php";
require_once __DIR__ . "/../helpers/KMeans.php";

class ClusteringController {
    
    public function index() {
        $sekolah_id = isset($_GET['sekolah_id']) ? $_GET['sekolah_id'] : null;
        $model = new EvaluasiBosModel();
        $data = $model->getAll($sekolah_id);
        echo json_encode(["status" => "success", "data" => $data]);
    }

    public function process() {
        $input = json_decode(file_get_contents("php://input"), true);
        $k = isset($input['k']) ? (int)$input['k'] : 3;
        $tahun = isset($input['tahun']) ? (int)$input['tahun'] : 2024; // Default to current year logic later

        $evalModel = new EvaluasiBosModel();
        $rawData = $evalModel->getDataForClustering($tahun);

        if (empty($rawData)) {
            echo json_encode(["status" => "error", "message" => "Tidak ada data untuk tahun $tahun"]);
            return;
        }

        // Prepare data for K-Means
        // Features: [jumlah_siswa, jumlah_guru, dana_bos, jumlah_fasilitas, kondisi_fasilitas_rusak]
        $dataset = [];
        $idMapping = []; // map index back to DB ID
        
        foreach ($rawData as $index => $row) {
            // Calculate total units damaged from JSON
            $jumlah_fasilitas = 0;
            if (!empty($row['detail_kerusakan'])) {
                $details = json_decode($row['detail_kerusakan'], true);
                if (is_array($details)) {
                    foreach ($details as $item) {
                        $jumlah_fasilitas += isset($item['count']) ? (int)$item['count'] : 0;
                    }
                }
            }

            $dataset[] = [
                (float)$row['jumlah_siswa'],             // x1 (Index 0)
                (float)$row['jumlah_guru'],              // x2 (Index 1)
                (float)$row['dana_bos'],                 // x3 (Index 2)
                (float)$row['jumlah_rombel'],            // x4 (Index 3)
                (float)$row['kondisi_fasilitas_rusak'],  // x5 (Index 4)
                (float)$jumlah_fasilitas                 // x6 (Index 5)
            ];
            $idMapping[$index] = $row['id'];
        }

        // 2. Normalisasi (Min-Max) - WAJIB
        $numFeatures = 6;
        $min = array_fill(0, $numFeatures, PHP_FLOAT_MAX);
        $max = array_fill(0, $numFeatures, PHP_FLOAT_MIN);

        foreach ($dataset as $row) {
            for ($i = 0; $i < $numFeatures; $i++) {
                if ($row[$i] < $min[$i]) $min[$i] = $row[$i];
                if ($row[$i] > $max[$i]) $max[$i] = $row[$i];
            }
        }

        $normalizedDataset = [];
        foreach ($dataset as $row) {
            $normalizedRow = [];
            for ($i = 0; $i < $numFeatures; $i++) {
                $denom = $max[$i] - $min[$i];
                $normalizedRow[$i] = ($denom == 0) ? 0 : ($row[$i] - $min[$i]) / $denom;
            }
            $normalizedDataset[] = $normalizedRow;
        }

        // 3. Euclidean Distance (Handled by KMeans Class)
        $kmeans = new KMeans($k);
        $result = $kmeans->fit($normalizedDataset);
        $score = $kmeans->calculateSilhouetteScore();
        
        $centroids = $result['centroids']; 
        $clusterIndices = array_keys($centroids);
        
        // 6. Penentuan Prioritas (REKOMENDASI SISTEM)
        // Balanced Formula: Equity + Impact + Need
        usort($clusterIndices, function($a, $b) use ($centroids) {
            $calcScore = function($c) {
                // REBALANCED WEIGHTS (PHASE 2 - Synchronized)
                $skorScore    = $c[4] * 4.0;         // Rusak
                $fundScore    = (1.0 - $c[2]) * 5.0; // Miskin (Boosted)
                $studentScore = $c[0] * 0.5;         // Siswa (Reduced)
                $itemScore    = $c[5] * 0.5;
                $rombelScore  = $c[3] * 0.5;
                
                return $skorScore + $fundScore + $studentScore + $itemScore + $rombelScore;
            };

            $scoreA = $calcScore($centroids[$a]);
            $scoreB = $calcScore($centroids[$b]);
            
            return $scoreA <=> $scoreB;
        });

        $mapping = []; 
        foreach ($clusterIndices as $newLabel => $oldId) {
            $mapping[$oldId] = $newLabel;
        }

        $clusterModel = new ClusteringModel();
        $riwayatId = $clusterModel->saveRiwayat($k, "Proses K-Means Tahun $tahun", $score);

        $assignments = $result['assignments'];
        $distances = isset($result['distances']) ? $result['distances'] : [];
        
        $remappedAssignments = [];

        $kategoriNames = [
            0 => "Prioritas Rendah",
            1 => "Prioritas Sedang",
            2 => "Prioritas Tinggi"
        ];

        foreach ($assignments as $index => $oldClusterLabel) {
            $evalId = $idMapping[$index];
            $newLabel = $mapping[$oldClusterLabel]; 
            $remappedAssignments[$index] = $newLabel;
            
            $distance = isset($distances[$index]) ? $distances[$index] : 0;
            $kategori = isset($kategoriNames[$newLabel]) ? $kategoriNames[$newLabel] : "Cluster $newLabel";

            $clusterModel->saveDetail($riwayatId, $evalId, $newLabel, $kategori, $distance);
        }

        echo json_encode([
            "status" => "success", 
            "message" => "Clustering berhasil", 
            "data" => [
                "centroids" => $result['centroids'], 
                "iterations" => $result['iterations'],
                "assignments" => $remappedAssignments,
                "distances" => $distances,
                "silhouette_score" => $score
            ]
        ]);
    }

    public function trend() {
        $model = new ClusteringModel();
        $data = $model->getTrendStats();
        
        if (!empty($data)) {
            echo json_encode(["status" => "success", "data" => $data]);
        } else {
            echo json_encode(["status" => "error", "message" => "Belum ada data history clustering"]);
        }
    }

    public function results() {
        $model = new ClusteringModel();
        
        $tahun = isset($_GET['tahun']) ? $_GET['tahun'] : null;

        if ($tahun) {
            $res = $model->getResultByYear($tahun);
            if ($res) {
                echo json_encode(["status" => "success", "data" => $res]);
            } else {
                echo json_encode(["status" => "error", "message" => "Belum ada hasil clustering untuk tahun $tahun"]);
            }
        } else {
            $res = $model->getLatestResult();
            if ($res) {
                echo json_encode(["status" => "success", "data" => $res]);
            } else {
                echo json_encode(["status" => "error", "message" => "Belum ada hasil clustering"]);
            }
        }
    }
    
    public function upload() {
        if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
            try {
                $file = $_FILES['file']['tmp_name'];
                $handle = fopen($file, "r");
                
                $sekolahModel = new SekolahModel();
                $evalModel = new EvaluasiBosModel();
                
                fgetcsv($handle);
                
                $firstRowDebug = null;
                $count = 0;
                
                while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
                    if ($firstRowDebug === null) {
                        $firstRowDebug = [
                            'content' => $row,
                            'count' => count($row)
                        ];
                    }

                    if (count($row) < 2) continue; 

                    $row = array_pad($row, 10, null);

                    $npsn = $row[1];
                    if (strtolower($npsn) == 'npsn' || empty($npsn)) continue;

                    $sekolah = $sekolahModel->findByNPSN($npsn);
                    if (!$sekolah) {
                        $sekolahModel->create([
                            'nama_sekolah' => $row[0] ?? 'Unknown',
                            'npsn' => $npsn,
                            'alamat' => $row[2] ?? '',
                            'jumlah_siswa' => (int) preg_replace('/[^0-9]/', '', $row[4] ?? 0)
                        ]);
                        $sekolah = $sekolahModel->findByNPSN($npsn);
                    } else {
                         // Update existing school student count
                         $sekolahModel->update($sekolah['id'], [
                            'nama_sekolah' => $sekolah['nama_sekolah'],
                            'alamat' => $sekolah['alamat'], 
                            'jenjang' => $sekolah['jenjang'],
                            'jumlah_siswa' => (int) preg_replace('/[^0-9]/', '', $row[4] ?? 0)
                        ]);
                    }
                    
                    $evalModel->save([
                        'sekolah_id' => $sekolah['id'],
                        'tahun' => (int) preg_replace('/[^0-9]/', '', $row[3] ?? 0),
                        'jumlah_siswa' => (int) preg_replace('/[^0-9]/', '', $row[4] ?? 0),
                        'jumlah_guru' => (int) preg_replace('/[^0-9]/', '', $row[5] ?? 0),
                        'jumlah_rombel' => (int) preg_replace('/[^0-9]/', '', $row[6] ?? 0),
                        'dana_bos' => (float) preg_replace('/[^0-9.]/', '', $row[7] ?? 0),
                        'kondisi_fasilitas_rusak' => (int) preg_replace('/[^0-9]/', '', $row[8] ?? 0),
                        'akreditasi' => $row[9] ?? 'Belum'
                    ]);
                    $count++;
                }
                fclose($handle);
                
                if ($count === 0) {
                    echo json_encode([
                        "status" => "error", 
                        "message" => "0 data berhasil diupload. Format CSV mungkin tidak sesuai.",
                        "debug" => $firstRowDebug
                    ]);
                } else {
                    echo json_encode(["status" => "success", "message" => "$count data berhasil diupload"]);
                }
            } catch (Exception $e) {
                http_response_code(500); 
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Upload gagal: No file uploaded or upload error"]);
        }
    }

    public function store() {
        $input = $_POST;
        
        // DEBUG: Log input details
        $log = "Time: " . date('Y-m-d H:i:s') . "\n";
        $log .= "Input: " . print_r($input, true) . "\n";
        $log .= "Files: " . print_r($_FILES, true) . "\n";
        file_put_contents(__DIR__ . '/../../debug_bos_store.txt', $log, FILE_APPEND);

        if (empty($input)) {
             $json = json_decode(file_get_contents("php://input"), true);
             if ($json) $input = $json;
        }

        if (!$input) {
             echo json_encode(["status" => "error", "message" => "Invalid input"]);
             return;
        }

        $sekolahModel = new SekolahModel();
        $evalModel = new EvaluasiBosModel();

        try {
            $sekolah_id = null;

            if (isset($input['sekolah_id']) && !empty($input['sekolah_id'])) {
                $sekolah_id = $input['sekolah_id'];
            } else {
                $npsn = $input['npsn'];
                $sekolah = $sekolahModel->findByNPSN($npsn);
                
                if (!$sekolah) {
                    $sekolahModel->create([
                        'nama_sekolah' => $input['nama_sekolah'],
                        'npsn' => $npsn,
                        'alamat' => $input['alamat'],
                        'jumlah_siswa' => $input['jumlah_siswa'] ?? 0
                    ]);
                    $sekolah = $sekolahModel->findByNPSN($npsn);
                }
                $sekolah_id = $sekolah['id'];
            }

            // CENTRALIZED UPDATE FOR MASTER SCHOOL
            // Ensure master data is synced with latest BOS input (especially jumlah_siswa)
            if ($sekolah_id) {
                $currentSekolah = $sekolahModel->find($sekolah_id);
                if ($currentSekolah && isset($input['jumlah_siswa'])) {
                    $sekolahModel->update($sekolah_id, [
                        'nama_sekolah' => $currentSekolah['nama_sekolah'],
                        'alamat'       => $currentSekolah['alamat'], 
                        'jenjang'      => $currentSekolah['jenjang'],
                        'jumlah_siswa' => $input['jumlah_siswa']
                    ]);
                }
            }

            $currentYearDataCheck = $this->checkExistingData($sekolah_id, $input['tahun']);
            if ($currentYearDataCheck) {
                 echo json_encode(["status" => "error", "message" => "Data untuk tahun {$input['tahun']} sudah ada. Silakan edit data yang sudah ada."]);
                 return;
            }

            $status = $input['status'] ?? 'DRAFT';
            $file_path = null;
            if (isset($_FILES['file_bukti']) && $_FILES['file_bukti']['error'] == 0) {
                $uploadDir = __DIR__ . '/../../uploads/bukti_bos/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", basename($_FILES['file_bukti']['name']));
                $targetPath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['file_bukti']['tmp_name'], $targetPath)) {
                    $file_path = 'uploads/bukti_bos/' . $fileName;
                }
            }

            $evalModel->save([
                'sekolah_id' => $sekolah_id,
                'tahun' => $input['tahun'],
                'jumlah_siswa' => $input['jumlah_siswa'],
                'jumlah_guru' => $input['jumlah_guru'],
                'jumlah_rombel' => $input['jumlah_rombel'],
                'dana_bos' => $input['dana_bos'],
                'kondisi_fasilitas_rusak' => $input['kondisi_fasilitas_rusak'],
                'detail_kerusakan' => isset($input['detail_kerusakan']) ? $input['detail_kerusakan'] : null,
                'akreditasi' => $input['akreditasi'],
                'status' => $status,
                'file_bukti_path' => $file_path
            ]);

            echo json_encode(["status" => "success", "message" => "Data berhasil disimpan (" . $status . ")"]);

        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function updateData() {
        $input = $_POST;
        if (empty($input)) {
             $json = json_decode(file_get_contents("php://input"), true);
             if ($json) $input = $json;
        }
        
        if (!$input || !isset($input['id'])) {
             echo json_encode(["status" => "error", "message" => "Invalid input"]);
             return;
        }

        $evalModel = new EvaluasiBosModel();

        try {
            $dataToUpdate = [
                'jumlah_siswa' => $input['jumlah_siswa'],
                'jumlah_guru' => $input['jumlah_guru'],
                'jumlah_rombel' => $input['jumlah_rombel'],
                'dana_bos' => $input['dana_bos'],
                'kondisi_fasilitas_rusak' => $input['kondisi_fasilitas_rusak'],
                'akreditasi' => $input['akreditasi']
            ];

            if (isset($input['detail_kerusakan'])) {
                $dataToUpdate['detail_kerusakan'] = $input['detail_kerusakan'];
            }

            if (isset($input['status'])) {
                $dataToUpdate['status'] = $input['status'];
            }

            if (isset($_FILES['file_bukti']) && $_FILES['file_bukti']['error'] == 0) {
                $uploadDir = __DIR__ . '/../../uploads/bukti_bos/';
                 if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", basename($_FILES['file_bukti']['name']));
                $targetPath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['file_bukti']['tmp_name'], $targetPath)) {
                    $dataToUpdate['file_bukti_path'] = 'uploads/bukti_bos/' . $fileName;
                }
            }

            $evalModel->update($input['id'], $dataToUpdate);

            echo json_encode(["status" => "success", "message" => "Data berhasil diperbarui"]);

        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function verify() {
        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input || !isset($input['id']) || !isset($input['status'])) {
             echo json_encode(["status" => "error", "message" => "Invalid input"]);
             return;
        }

        $valid = ['APPROVED', 'REJECTED', 'PENDING_VERIF'];
        if (!in_array($input['status'], $valid)) {
             echo json_encode(["status" => "error", "message" => "Invalid status"]);
             return;
        }

        $evalModel = new EvaluasiBosModel();
        try {
            $catatan = $input['catatan'] ?? null;
            $evalModel->updateStatus($input['id'], $input['status'], $catatan);
            echo json_encode(["status" => "success", "message" => "Status berhasil diperbarui menjadi " . $input['status']]);
        } catch (Exception $e) {
             echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function simulate() {
        // "What-If" Analysis: Run K-Means with modified parameters for ONE school
        // and see how it affects the clustering result.
        
        $input = json_decode(file_get_contents("php://input"), true);
        
        // Required: sekolah_id, and the modified metrics
        if (!isset($input['sekolah_id']) || !isset($input['params'])) {
             echo json_encode(["status" => "error", "message" => "Input simulasi tidak lengkap"]);
             return;
        }

        $targetSekolahId = $input['sekolah_id'];
        $params = $input['params']; 
        $k = isset($input['k']) ? (int)$input['k'] : 3;
        
        $evalModel = new EvaluasiBosModel();

        // INTELLIGENT YEAR DETECTION
        // 1. If year provided in input, use it.
        // 2. If not, look up the most recent year for this specific school in the database.
        $tahun = isset($input['tahun']) ? (int)$input['tahun'] : null;

        if (!$tahun) {
            $db = Database::connect();
            $stmt = $db->prepare("SELECT tahun FROM data_evaluasi_bos WHERE sekolah_id = :sekolah_id ORDER BY tahun DESC LIMIT 1");
            $stmt->execute([':sekolah_id' => $targetSekolahId]);
            $row = $stmt->fetch();
            
            if ($row) {
                $tahun = (int)$row['tahun'];
            } else {
                // Should not happen if school exists in list, but fallback just in case
                $tahun = (int)date('Y'); 
            }
        }
        
        $rawData = $evalModel->getDataForClustering($tahun);
        
        if (empty($rawData)) {
             echo json_encode(["status" => "error", "message" => "Tidak ada data evaluasi untuk tahun $tahun"]);
             return;
        }

        if (empty($rawData)) {
            echo json_encode(["status" => "error", "message" => "Tidak ada data untuk tahun $tahun"]);
            return;
        }

        // 1. Prepare Dataset & Swap with Simulated Values
        $dataset = [];
        $idMapping = []; 
        $targetIndex = -1;

        foreach ($rawData as $index => $row) {
            $isTarget = ($row['sekolah_id'] == $targetSekolahId);
            
            // ... (rest of logic)
            // Default Values from DB
            $jSiswa = (float)$row['jumlah_siswa'];
            $jGuru = (float)$row['jumlah_guru'];
            $danaBos = (float)$row['dana_bos'];
            $jRombel = (float)$row['jumlah_rombel'];
            $jRusak = (float)$row['kondisi_fasilitas_rusak'];
            
            // Calc facilities total
            $jFasilitas = 0;
            if (!empty($row['detail_kerusakan'])) {
                $details = json_decode($row['detail_kerusakan'], true);
                if (is_array($details)) {
                    foreach ($details as $item) {
                        $jFasilitas += isset($item['count']) ? (int)$item['count'] : 0;
                    }
                }
            }

            // SWAP WITH SIMULATION PARAMS IF TARGET
            if ($isTarget) {
                $targetIndex = $index;
                
                if (isset($params['jumlah_siswa'])) $jSiswa = (float)$params['jumlah_siswa'];
                if (isset($params['dana_bos'])) $danaBos = (float)$params['dana_bos'];
                if (isset($params['kondisi_fasilitas_rusak'])) $jRusak = (float)$params['kondisi_fasilitas_rusak'];
            }

            $dataset[] = [$jSiswa, $jGuru, $danaBos, $jRombel, $jRusak, (float)$jFasilitas];
            $idMapping[$index] = $row['id'];
        }
        
        // 2. Normalisasi
        $numFeatures = 6;
        $min = array_fill(0, $numFeatures, PHP_FLOAT_MAX);
        $max = array_fill(0, $numFeatures, PHP_FLOAT_MIN);

        foreach ($dataset as $row) {
            for ($i = 0; $i < $numFeatures; $i++) {
                if ($row[$i] < $min[$i]) $min[$i] = $row[$i];
                if ($row[$i] > $max[$i]) $max[$i] = $row[$i];
            }
        }

        $normalizedDataset = [];
        foreach ($dataset as $row) {
            $normalizedRow = [];
            for ($i = 0; $i < $numFeatures; $i++) {
                $denom = $max[$i] - $min[$i];
                $normalizedRow[$i] = ($denom == 0) ? 0 : ($row[$i] - $min[$i]) / $denom;
            }
            $normalizedDataset[] = $normalizedRow;
        }

        // 3. Run K-Means
        $kmeans = new KMeans($k);
        $result = $kmeans->fit($normalizedDataset);
        
        // 4. Determine Priority Labels (Copy logic from process())
        $centroids = $result['centroids']; 
        $clusterIndices = array_keys($centroids);
        
        usort($clusterIndices, function($a, $b) use ($centroids) {
            $calcScore = function($c) {
                // REBALANCED WEIGHTS (PHASE 2)
                // Goal: Wealth (Dana BOS) must powerfully REDUCE priority.
                
                $skorScore    = $c[4] * 4.0;         // Rusak (High)
                $fundScore    = (1.0 - $c[2]) * 5.0; // Miskin (VERY High) - Richness kills priority
                $studentScore = $c[0] * 0.5;         // Siswa (Low) - Size matters less
                $itemScore    = $c[5] * 0.5;
                $rombelScore  = $c[3] * 0.5;
                
                return $skorScore + $fundScore + $studentScore + $itemScore + $rombelScore;
            };
            
            return $calcScore($centroids[$a]) <=> $calcScore($centroids[$b]);
        });

        $mapping = []; 
        foreach ($clusterIndices as $newLabel => $oldId) {
            $mapping[$oldId] = $newLabel;
        }

        // 5. Get Result for Target School
        if ($targetIndex !== -1) {
            $rawClusterId = $result['assignments'][$targetIndex];
            $finalClusterLabel = $mapping[$rawClusterId];
            
            // Also return the original cluster if possible (fetch from last saved detail)
            // But for now, we just return the "Simulated" result.
            
            $kategoriNames = [
                0 => "Prioritas Rendah",
                1 => "Prioritas Sedang",
                2 => "Prioritas Tinggi"
            ];

            echo json_encode([
                "status" => "success",
                "data" => [
                    "cluster_label" => $finalClusterLabel,
                    "kategori" => $kategoriNames[$finalClusterLabel] ?? "Cluster $finalClusterLabel",
                    "centroid_profile" => $dataset[$targetIndex], // Return raw values processed
                    "normalized_profile" => $normalizedDataset[$targetIndex]
                ]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Target sekolah tidak ditemukan di dataset"]);
        }
    }

    private function checkExistingData($sekolah_id, $tahun) {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT id FROM data_evaluasi_bos WHERE sekolah_id = :sekolah_id AND tahun = :tahun");
        $stmt->execute([':sekolah_id' => $sekolah_id, ':tahun' => $tahun]);
        return $stmt->fetch();
    }
}
?>
