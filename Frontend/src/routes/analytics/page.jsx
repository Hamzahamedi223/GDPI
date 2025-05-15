import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    equipmentStats: [],
    equipmentByDepartment: [],
    equipmentStatus: {},
    equipmentAge: [],
    totalEquipment: 0,
    activeEquipment: 0,
    maintenanceEquipment: 0,
    inactiveEquipment: 0,
    internalRepairs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      setError(null);
      const [statsResponse, repairsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats'),
        axios.get('http://localhost:5000/api/internal-repairs')
      ]);
      
      const data = statsResponse.data;
      const totalEquip = data.equipmentStats.reduce((acc, curr) => acc + curr.count, 0);
      const internalRepairs = repairsResponse.data;
      const pendingRepairs = internalRepairs.filter(repair => repair.status === 'pending').length;
      
      // Count equipment by status (matching the system's actual statuses)
      const inactiveCount = (data.equipmentStatus?.down?.count || 0);
      const maintenanceCount = (data.equipmentStatus?.maintenance?.count || 0) + pendingRepairs;
      const operationalCount = (data.equipmentStatus?.operational?.count || 0);

      const statusCounts = {
        active: operationalCount,
        maintenance: maintenanceCount,
        inactive: inactiveCount
      };

      console.log('Status breakdown:', {
        operational: operationalCount,
        maintenance: maintenanceCount,
        down: inactiveCount,
        pendingRepairs,
        rawStatus: data.equipmentStatus
      });

      setAnalyticsData({
        equipmentStats: data.equipmentStats,
        equipmentByDepartment: data.equipmentByDepartment,
        equipmentStatus: data.equipmentStatus,
        equipmentAge: data.equipmentAge || [],
        totalEquipment: totalEquip,
        activeEquipment: statusCounts.active,
        maintenanceEquipment: statusCounts.maintenance,
        inactiveEquipment: statusCounts.inactive,
        internalRepairs: internalRepairs
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Erreur lors du chargement des données analytiques. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  // Transform equipment stats for pie chart
  const equipmentStatusData = [
    { name: 'Opérationnel', value: analyticsData.activeEquipment },
    { name: 'En Maintenance', value: analyticsData.maintenanceEquipment },
    { name: 'Hors Service', value: analyticsData.inactiveEquipment }
  ];

  // Transform department data for bar chart
  const departmentData = analyticsData.equipmentByDepartment.map(dept => ({
    name: dept._id || 'Non assigné',
    value: dept.count,
    totalValue: dept.totalValue
  }));

  // Transform age data for line chart
  const ageData = analyticsData.equipmentAge.map(age => ({
    name: age._id,
    value: age.count
  }));

  // Transform repair data
  const repairStatusData = [
    { 
      name: 'En cours', 
      value: analyticsData.internalRepairs.filter(repair => repair.status === 'pending').length 
    },
    { 
      name: 'Terminé', 
      value: analyticsData.internalRepairs.filter(repair => repair.status === 'completed').length 
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord Analytique</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Équipements</h3>
          <p className="text-3xl font-bold text-blue-600">{analyticsData.totalEquipment}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Équipements Actifs</h3>
          <p className="text-3xl font-bold text-green-600">{analyticsData.activeEquipment}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">En Maintenance</h3>
          <p className="text-3xl font-bold text-yellow-600">{analyticsData.maintenanceEquipment}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Inactifs</h3>
          <p className="text-3xl font-bold text-red-600">{analyticsData.inactiveEquipment}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution par Âge des Équipements</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Nombre d'équipements" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution par État</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {equipmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Réparations Internes</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repairStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {repairStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Détails des Réparations</h4>
            <div className="space-y-2">
              {analyticsData.internalRepairs.map((repair, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {repair.equipment?.name || 'Équipement non spécifié'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    repair.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {repair.status === 'completed' ? 'Terminé' : 'En cours'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Équipements par Service</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="value" name="Nombre d'équipements" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="totalValue" name="Valeur totale (€)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution par Catégorie</h3>
          <div className="space-y-4">
            {analyticsData.equipmentStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{stat._id || 'Non catégorisé'}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{stat.count}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Valeur moyenne: {stat.avgValue?.toLocaleString('fr-FR')} €</span>
                  <span>Total: {stat.totalValue?.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ 
                      width: `${(stat.count / analyticsData.totalEquipment) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">État de la Maintenance</h3>
          <div className="space-y-4">
            {Object.entries(analyticsData.equipmentStatus)
              .filter(([status]) => status.startsWith('warranty_'))
              .map(([status, data], index) => {
                const cleanStatus = status.replace('warranty_', '');
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {cleanStatus === 'valid' ? 'Garantie Valide' :
                         cleanStatus === 'expired' ? 'Garantie Expirée' :
                         'Maintenance Préventive'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{data.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Valeur totale: {data.totalValue?.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          cleanStatus === 'valid' ? 'bg-green-500' :
                          cleanStatus === 'expired' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ 
                          width: `${(data.count / analyticsData.totalEquipment) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsPage; 