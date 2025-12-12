<?php
class KMeans {
    
    private $k;
    private $data;
    private $centroids;
    private $assignments;
    private $maxIterations;

    private $seed;

    public function __construct($k = 3, $maxIterations = 100, $seed = 42) {
        $this->k = $k;
        $this->maxIterations = $maxIterations;
        $this->seed = $seed;
    }

    /**
     * @param array $data Array of arrays (numeric features)
     */
    private $distances; 

    public function fit($data) {
        $this->data = $data;
        $this->initializeCentroids();
        
        $iteration = 0;
        $converged = false;
        
        while ($iteration < $this->maxIterations && !$converged) {
            $prevCentroids = $this->centroids;
            
            $this->assignClusters();
            
            $this->updateCentroids();
            
            if ($this->centroids === $prevCentroids) {
                $converged = true;
            }
            
            $iteration++;
        }
        
        return [
            'centroids' => $this->centroids,
            'assignments' => $this->assignments,
            'distances' => $this->distances,
            'iterations' => $iteration
        ];
    }

    private function initializeCentroids() {
        if ($this->seed !== null) {
            mt_srand($this->seed);
        }

        $this->centroids = [];
        $dataCount = count($this->data);

        // 1. Choose first centroid uniformly at random
        $firstIndex = mt_rand(0, $dataCount - 1);
        $this->centroids[] = $this->data[$firstIndex];

        // 2. Choose remaining k-1 centroids
        for ($i = 1; $i < $this->k; $i++) {
            $distances = [];
            $sumSquares = 0;

            // Calculate min squared distance for each point to existing centroids
            foreach ($this->data as $point) {
                $minDistSq = PHP_FLOAT_MAX;
                foreach ($this->centroids as $centroid) {
                    $dist = $this->euclideanDistance($point, $centroid);
                    $distSq = $dist * $dist;
                    if ($distSq < $minDistSq) {
                        $minDistSq = $distSq;
                    }
                }
                $distances[] = $minDistSq;
                $sumSquares += $minDistSq;
            }

            // Select next centroid with probability proportional to D(x)^2
            $randVal = mt_rand() / mt_getrandmax() * $sumSquares;
            $cumulative = 0;
            $nextCentroidIndex = -1;

            foreach ($distances as $index => $distSq) {
                $cumulative += $distSq;
                if ($cumulative >= $randVal) {
                    $nextCentroidIndex = $index;
                    break;
                }
            }
            
            // Fallback if float precision issues prevent selection
            if ($nextCentroidIndex === -1) {
                $nextCentroidIndex = mt_rand(0, $dataCount - 1);
            }

            $this->centroids[] = $this->data[$nextCentroidIndex];
        }
    }

    private function assignClusters() {
        $this->assignments = [];
        $this->distances = [];

        foreach ($this->data as $index => $point) {
            $minDist = PHP_FLOAT_MAX;
            $bestCluster = 0;
            
            foreach ($this->centroids as $cIndex => $centroid) {
                $dist = $this->euclideanDistance($point, $centroid);
                if ($dist < $minDist) {
                    $minDist = $dist;
                    $bestCluster = $cIndex;
                }
            }
            $this->assignments[$index] = $bestCluster;
            $this->distances[$index] = $minDist;
        }
    }

    private function updateCentroids() {
        $sums = array_fill(0, $this->k, []);
        $counts = array_fill(0, $this->k, 0);

        $numFeatures = count($this->data[0]); 
        for ($i = 0; $i < $this->k; $i++) {
            $sums[$i] = array_fill(0, $numFeatures, 0.0);
        }

        foreach ($this->assignments as $dataIndex => $clusterIndex) {
            $point = $this->data[$dataIndex];
            foreach ($point as $fIndex => $val) {
                $sums[$clusterIndex][$fIndex] += $val;
            }
            $counts[$clusterIndex]++;
        }

        foreach ($this->centroids as $cIndex => &$centroid) {
            if ($counts[$cIndex] > 0) {
                foreach ($centroid as $fIndex => &$val) {
                    $val = $sums[$cIndex][$fIndex] / $counts[$cIndex];
                }
            } else {
                $randKey = array_rand($this->data);
                $centroid = $this->data[$randKey]; 
            }
        }
    }

    private function euclideanDistance($point1, $point2) {
        $sum = 0;
        foreach ($point1 as $i => $val) {
            $diff = $val - $point2[$i];
            $sum += $diff * $diff;
        }
        return sqrt($sum);
    }

    public function calculateSilhouetteScore() {
        if (count($this->data) < 2 || $this->k < 2) {
            return 0; 
        }

        $scores = [];

        foreach ($this->data as $i => $point) {
            $currentCluster = $this->assignments[$i];
            
            $sumDistA = 0;
            $countA = 0;
            
            $clusterDistances = []; 

            foreach ($this->data as $j => $otherPoint) {
                if ($i === $j) continue;

                $dist = $this->euclideanDistance($point, $otherPoint);
                $otherCluster = $this->assignments[$j];

                if ($otherCluster === $currentCluster) {
                    $sumDistA += $dist;
                    $countA++;
                } else {
                    if (!isset($clusterDistances[$otherCluster])) {
                        $clusterDistances[$otherCluster] = ['sum' => 0, 'count' => 0];
                    }
                    $clusterDistances[$otherCluster]['sum'] += $dist;
                    $clusterDistances[$otherCluster]['count']++;
                }
            }

            $a = ($countA > 0) ? $sumDistA / $countA : 0;

            $minAvgDistB = PHP_FLOAT_MAX;
            
            
            foreach ($clusterDistances as $clusterStats) {
                if ($clusterStats['count'] > 0) {
                    $avgDist = $clusterStats['sum'] / $clusterStats['count'];
                    if ($avgDist < $minAvgDistB) {
                        $minAvgDistB = $avgDist;
                    }
                }
            }
            
            if ($countA === 0) {
                $scores[] = 0;
                continue;
            }

            $b = ($minAvgDistB === PHP_FLOAT_MAX) ? 0 : $minAvgDistB;

            $maxAB = max($a, $b);
            $s = ($maxAB == 0) ? 0 : ($b - $a) / $maxAB;
            
            $scores[] = $s;
        }

        if (count($scores) === 0) return 0;
        return array_sum($scores) / count($scores);
    }
}
?>
