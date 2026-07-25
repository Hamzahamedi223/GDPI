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
import { formatCurrency } from '@/utils/currency';

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
      className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#7b8872]">{title}</p>
          <p className="text-2xl font-semibold mt-2 text-[#172018]">{value}</p>
          {subtitle && <p className="text-xs text-[#7b8872]">{subtitle}</p>}
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
      className="flex items-center gap-4 p-4 rounded-lg border border-[#d7ddcf] bg-white"
    >
      <div className="p-2 rounded-lg bg-[#e7eddf]">
        <Clock className="h-5 w-5 text-[#22351f]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#172018]">{activity.title}</p>
        <p className="text-xs text-[#7b8872]">{activity.time}</p>
      </div>
    </motion.div>
  );

  const EquipmentCard = ({ title, items }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5"
    >
      <h3 className="text-lg font-semibold text-[#172018] mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-[#4c5948]">{item.name}</span>
            <span className="text-sm font-medium text-[#172018]">{item.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const RecentEquipmentCard = ({ equipment }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5"
    >
      <h3 className="text-lg font-semibold text-[#172018] mb-4">Derniers Équipements Ajoutés</h3>
      <div className="space-y-4">
        {equipment.map((item, index) => (
          <div key={index} className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#172018]">{item.name}</span>
              <span className="text-xs text-[#7b8872]">
                {new Date(item.addedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7b8872]">
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6f7f35]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
    <div>
          <h1 className="text-2xl font-bold text-[#172018]">Tableau de Bord</h1>
          <p className="mt-1 text-sm text-[#7b8872]">
            Vue d'ensemble de votre système
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#34402f] bg-white rounded-lg border border-[#cbd4c2] hover:bg-[#eef1e8]"
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
          color="bg-[#22351f]"
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
          color="bg-[#6f7f35]"
          subtitle={formatCurrency(stats.pendingDeliveriesValue)}
        />
        <StatCard
          title="Total Équipements"
          value={stats.equipmentStats.reduce((acc, curr) => acc + curr.count, 0)}
          icon={Package}
          color="bg-[#6f7f35]"
          subtitle={formatCurrency(stats.equipmentStats.reduce((acc, curr) => acc + curr.totalValue, 0))}
        />
      </div>

      {/* Equipment Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment by Category */}
        <div className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#e7eddf] rounded-lg">
              <PieChart className="h-5 w-5 text-[#22351f]" />
            </div>
            <h3 className="text-lg font-semibold text-[#172018]">Équipements par Catégorie</h3>
          </div>
          <div className="space-y-4">
            {stats.equipmentStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4c5948]">{stat._id || 'Non catégorisé'}</span>
                  <span className="text-sm font-medium text-[#172018]">{stat.count}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#7b8872]">
                  <span>Valeur moyenne: {formatCurrency(stat.avgValue)}</span>
                  <span>Total: {formatCurrency(stat.totalValue)}</span>
                </div>
                <div className="w-full bg-[#dfe5d8] rounded-full h-1.5">
                  <div 
                    className="bg-[#22351f] h-1.5 rounded-full" 
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
        <div className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#e7eddf] rounded-lg">
              <BarChart2 className="h-5 w-5 text-[#22351f]" />
            </div>
            <h3 className="text-lg font-semibold text-[#172018]">Équipements par Service</h3>
          </div>
          <div className="space-y-4">
            {stats.equipmentByDepartment.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4c5948]">{dept._id || 'Non assigné'}</span>
                  <span className="text-sm font-medium text-[#172018]">{dept.count}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#7b8872]">
                  <span>Valeur totale: {formatCurrency(dept.totalValue)}</span>
                </div>
                <div className="w-full bg-[#dfe5d8] rounded-full h-1.5">
                  <div 
                    className="bg-[#6f7f35] h-1.5 rounded-full" 
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
        <div className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#e7eddf] rounded-lg">
              <LineChart className="h-5 w-5 text-[#6f7f35]" />
            </div>
            <h3 className="text-lg font-semibold text-[#172018]">Distribution par Âge</h3>
          </div>
          <div className="space-y-4">
            {stats.equipmentAge?.map((age, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#4c5948]">{age._id}</span>
                  <span className="text-sm font-medium text-[#172018]">{age.count}</span>
                </div>
                <div className="w-full bg-[#dfe5d8] rounded-full h-1.5">
                  <div 
                    className="bg-[#6f7f35] h-1.5 rounded-full" 
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
          <div className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#e7eddf] rounded-lg">
                <Activity className="h-5 w-5 text-[#22351f]" />
              </div>
              <h2 className="text-lg font-semibold text-[#172018]">
                Activités Récentes
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <ActivityCard key={index} activity={activity} />
                ))
              ) : (
                <p className="text-sm text-[#7b8872] text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </div>

          {/* Recent Equipment */}
          <div className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#e7eddf] rounded-lg">
                <Package className="h-5 w-5 text-[#6f7f35]" />
              </div>
              <h2 className="text-lg font-semibold text-[#172018]">
                Derniers Équipements Ajoutés
              </h2>
            </div>
            <div className="space-y-4">
              {stats.recentEquipment.map((equip, index) => (
                <div key={index} className="flex flex-col space-y-2 p-4 bg-[#fafbf8] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#172018]">{equip.name}</span>
                    <span className="text-xs text-[#7b8872]">
                      {new Date(equip.addedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-[#7b8872]">
                      <Info className="h-3 w-3" />
                      <span>{equip.model}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#7b8872]">
                      <Tag className="h-3 w-3" />
                      <span>{equip.category}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#7b8872]">
                      <Building className="h-3 w-3" />
                      <span>{equip.department}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#7b8872]">
                      <Hash className="h-3 w-3" />
                      <span>{equip.serialNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      equip.status === 'operational' 
                        ? 'bg-[#e7eddf] text-[#22351f]'
                        : equip.status === 'maintenance'
                        ? 'bg-[#f7edc7] text-[#705d12]'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {equip.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      equip.warrantyStatus === 'valid'
                        ? 'bg-[#e7eddf] text-[#22351f]'
                        : 'bg-red-100 text-red-800'
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
          <div className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#e7eddf] rounded-lg">
                <Shield className="h-5 w-5 text-[#6f7f35]" />
              </div>
              <h2 className="text-lg font-semibold text-[#172018]">
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
                        status === 'operational' ? 'bg-[#6f7f35]' :
                        status === 'maintenance' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-[#4c5948]">
                        {status === 'operational' ? 'Opérationnels' :
                         status === 'maintenance' ? 'En Maintenance' :
                         'En Panne'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-[#172018]">{data.count}</span>
                      <div className="text-xs text-[#7b8872]">
                        {formatCurrency(data.totalValue)}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-[#dfe5d8] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        status === 'operational' ? 'bg-[#6f7f35]' :
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
          <div className="rounded-xl border border-[#d7ddcf] bg-white p-6 shadow-sm shadow-[#22351f]/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#e7eddf] rounded-lg">
                <Wrench className="h-5 w-5 text-[#22351f]" />
              </div>
              <h2 className="text-lg font-semibold text-[#172018]">
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
                          <span className="text-sm text-[#4c5948]">
                            {cleanStatus === 'valid' ? 'Garantie Valide' :
                             cleanStatus === 'expired' ? 'Garantie Expirée' :
                             'Maintenance Préventive'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-[#172018]">{data.count}</span>
                          <div className="text-xs text-[#7b8872]">
                            {formatCurrency(data.totalValue)}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-[#dfe5d8] rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            cleanStatus === 'valid' ? 'bg-[#6f7f35]' :
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
              className="flex items-center gap-3 p-4 rounded-xl border border-[#d7ddcf] bg-white shadow-sm shadow-[#22351f]/5"
            >
              <Wrench className="h-5 w-5 text-[#22351f]" />
              <span className="text-sm font-medium text-[#172018]">
                Planifier Maintenance
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 rounded-xl border border-[#d7ddcf] bg-white shadow-sm shadow-[#22351f]/5"
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-[#172018]">
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


