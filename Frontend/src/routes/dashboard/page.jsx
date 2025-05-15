import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Calendar,
  FileText,
  RefreshCw,
  Wrench,
  Shield,
  Battery,
  Activity,
  BarChart2,
  PieChart,
  LineChart,
  Info,
  Tag,
  Building,
  Hash
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    equipmentStats: [],
    equipmentByDepartment: [],
    activeTickets: 0,
    pendingDeliveries: 0,
    recentEquipment: [],
    equipmentStatus: {}
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [statsRes, activitiesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats'),
        axios.get('http://localhost:5000/api/dashboard/activities')
      ]);

      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const ActivityCard = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700"
    >
      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
        <Clock className="h-5 w-5 text-blue-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
      </div>
    </motion.div>
  );

  const EquipmentCard = ({ title, items }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const RecentEquipmentCard = ({ equipment }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Derniers Équipements Ajoutés</h3>
      <div className="space-y-4">
        {equipment.map((item, index) => (
          <div key={index} className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.addedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{item.category}</span>
              <span>•</span>
              <span>{item.department}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
    <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vue d'ensemble de votre système
          </p>
        </div>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utilisateurs Totaux"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Tickets Actifs"
          value={stats.activeTickets}
          icon={AlertTriangle}
          color="bg-yellow-500"
        />
        <StatCard
          title="Livraisons en Attente"
          value={stats.pendingDeliveries}
          icon={TrendingUp}
          color="bg-purple-500"
          subtitle={`${stats.pendingDeliveriesValue?.toLocaleString('fr-FR')} €`}
        />
        <StatCard
          title="Total Équipements"
          value={stats.equipmentStats.reduce((acc, curr) => acc + curr.count, 0)}
          icon={Package}
          color="bg-green-500"
          subtitle={`${stats.equipmentStats.reduce((acc, curr) => acc + curr.totalValue, 0).toLocaleString('fr-FR')} €`}
        />
      </div>

      {/* Equipment Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment by Category */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Équipements par Catégorie</h3>
          </div>
          <div className="space-y-4">
            {stats.equipmentStats.map((stat, index) => (
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
                      width: `${(stat.count / stats.equipmentStats.reduce((acc, curr) => acc + curr.count, 0)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment by Department */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Équipements par Service</h3>
          </div>
          <div className="space-y-4">
            {stats.equipmentByDepartment.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{dept._id || 'Non assigné'}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{dept.count}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Valeur totale: {dept.totalValue?.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full" 
                    style={{ 
                      width: `${(dept.count / stats.equipmentByDepartment.reduce((acc, curr) => acc + curr.count, 0)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Age Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <LineChart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribution par Âge</h3>
          </div>
          <div className="space-y-4">
            {stats.equipmentAge?.map((age, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{age._id}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{age.count}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ 
                      width: `${(age.count / stats.equipmentAge.reduce((acc, curr) => acc + curr.count, 0)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activités Récentes
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <ActivityCard key={index} activity={activity} />
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </div>

          {/* Recent Equipment */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Derniers Équipements Ajoutés
              </h2>
            </div>
            <div className="space-y-4">
              {stats.recentEquipment.map((equip, index) => (
                <div key={index} className="flex flex-col space-y-2 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{equip.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(equip.addedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Info className="h-3 w-3" />
                      <span>{equip.model}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Tag className="h-3 w-3" />
                      <span>{equip.category}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Building className="h-3 w-3" />
                      <span>{equip.department}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Hash className="h-3 w-3" />
                      <span>{equip.serialNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      equip.status === 'operational' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : equip.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {equip.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      equip.warrantyStatus === 'valid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {equip.warrantyStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Equipment Health Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                État des Équipements
              </h2>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.equipmentStatus)
                .filter(([status]) => !status.startsWith('warranty_'))
                .map(([status, data]) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        status === 'operational' ? 'bg-green-500' :
                        status === 'maintenance' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {status === 'operational' ? 'Opérationnels' :
                         status === 'maintenance' ? 'En Maintenance' :
                         'En Panne'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{data.count}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {data.totalValue?.toLocaleString('fr-FR')} €
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        status === 'operational' ? 'bg-green-500' :
                        status === 'maintenance' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ 
                        width: `${(data.count / Object.values(stats.equipmentStatus)
                          .filter((_, i) => !Object.keys(stats.equipmentStatus)[i].startsWith('warranty_'))
                          .reduce((acc, curr) => acc + curr.count, 0)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Overview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Maintenance
              </h2>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.equipmentStatus)
                .filter(([status]) => status.startsWith('warranty_'))
                .map(([status, data]) => {
                  const cleanStatus = status.replace('warranty_', '');
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Battery className={`h-4 w-4 ${
                            cleanStatus === 'valid' ? 'text-green-500' :
                            cleanStatus === 'expired' ? 'text-red-500' :
                            'text-yellow-500'
                          }`} />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {cleanStatus === 'valid' ? 'Garantie Valide' :
                             cleanStatus === 'expired' ? 'Garantie Expirée' :
                             'Maintenance Préventive'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{data.count}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {data.totalValue?.toLocaleString('fr-FR')} €
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            cleanStatus === 'valid' ? 'bg-green-500' :
                            cleanStatus === 'expired' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ 
                            width: `${(data.count / Object.values(stats.equipmentStatus)
                              .filter((_, i) => Object.keys(stats.equipmentStatus)[i].startsWith('warranty_'))
                              .reduce((acc, curr) => acc + curr.count, 0)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <Wrench className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Planifier Maintenance
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Signaler Problème
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
