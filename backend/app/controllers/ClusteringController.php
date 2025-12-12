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

        // Prepare data for K-Means (only numeric columns)
        // [id, jumlah_siswa, jumlah_guru, jumlah_rombel, dana_bos, kondisi_fasilitas_rusak]
        // Prepare data for K-Means (only numeric columns)
        // [id, jumlah_siswa, jumlah_guru, jumlah_rombel, dana_bos, kondisi_fasilitas_rusak]
        $dataset = [];
        $idMapping = []; // map index back to DB ID
        
        foreach ($rawData as $index => $row) {
            $dataset[] = [
                (float)$row['jumlah_siswa'], 
                (float)$row['jumlah_guru'], 
                (float)$row['jumlah_rombel'],
                (float)$row['dana_bos'],
                (float)$row['kondisi_fasilitas_rusak']
            ];
            $idMapping[$index] = $row['id'];
        }

        // 1. Min-Max Normalization
        $numFeatures = 5;
        $min = array_fill(0, $numFeatures, PHP_FLOAT_MAX);
        $max = array_fill(0, $numFeatures, PHP_FLOAT_MIN);

        // Find Min/Max
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
                // Avoid division by zero if max == min
                $normalizedRow[$i] = ($denom == 0) ? 0 : ($row[$i] - $min[$i]) / $denom;
            }
            $normalizedDataset[] = $normalizedRow;
        }

        $kmeans = new KMeans($k);
        $result = $kmeans->fit($normalizedDataset);
        $score = $kmeans->calculateSilhouetteScore();

        
        $centroids = $result['centroids']; 
        $clusterIndices = array_keys($centroids);
        
        usort($clusterIndices, function($a, $b) use ($centroids) {
            return $centroids[$a][4] <=> $centroids[$b][4];
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
                            'alamat' => $row[2] ?? ''
                        ]);
                        $sekolah = $sekolahModel->findByNPSN($npsn);
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
        // Handle Multipart Form Data
        $input = $_POST;
        
        // If empty $_POST, maybe it was JSON? fallback to JSON input
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
                        'alamat' => $input['alamat']
                    ]);
                    $sekolah = $sekolahModel->findByNPSN($npsn);
                }
                $sekolah_id = $sekolah['id'];
            }

            $currentYearDataCheck = $this->checkExistingData($sekolah_id, $input['tahun']);
            if ($currentYearDataCheck) {
                 echo json_encode(["status" => "error", "message" => "Data untuk tahun {$input['tahun']} sudah ada. Silakan edit data yang sudah ada."]);
                 return;
            }

            $status = $input['status'] ?? 'DRAFT';
            $file_path = null;

            // Handle File Upload
            if (isset($_FILES['file_bukti']) && $_FILES['file_bukti']['error'] == 0) {
                // Point to backend/uploads (outside app)
                $uploadDir = __DIR__ . '/../../uploads/bukti_bos/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", basename($_FILES['file_bukti']['name']));
                $targetPath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['file_bukti']['tmp_name'], $targetPath)) {
                    $file_path = 'uploads/bukti_bos/' . $fileName; // Relative path for DB
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

            if (isset($input['status'])) {
                $dataToUpdate['status'] = $input['status'];
            }

            // Handle File Upload Update
            if (isset($_FILES['file_bukti']) && $_FILES['file_bukti']['error'] == 0) {
                // Point to backend/uploads (outside app)
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

        $valid = ['APPROVED', 'REJECTED', 'PENDING_VERIF']; // Allowed targets
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

    private function checkExistingData($sekolah_id, $tahun) {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT id FROM data_evaluasi_bos WHERE sekolah_id = :sekolah_id AND tahun = :tahun");
        $stmt->execute([':sekolah_id' => $sekolah_id, ':tahun' => $tahun]);
        return $stmt->fetch();
    }
}
?>
