const Signup = require("../models/Signup");
const Equipment = require("../models/Equipment");
const Ticket = require("../models/Ticket");
const DeliveryOrder = require("../models/DeliveryOrder");

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await Signup.countDocuments();
    
    // Get equipment statistics by category with detailed info
    const equipmentStats = await Equipment.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categorie",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ["$categoryInfo.name", 0] },
          count: { $sum: 1 },
          totalValue: { $sum: "$prix" },
          avgValue: { $avg: "$prix" }
        }
      }
    ]);

    // Get equipment by department with detailed info
    const equipmentByDepartment = await Equipment.aggregate([
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo"
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ["$departmentInfo.name", 0] },
          count: { $sum: 1 },
          totalValue: { $sum: "$prix" },
          items: {
            $push: {
              name: "$name",
              category: { $arrayElemAt: ["$categoryInfo.name", 0] },
              serialNumber: "$serial_number",
              status: "$status",
              warrantyStatus: "$warranty_status"
            }
          }
        }
      }
    ]);

    // Get equipment status statistics with value
    const equipmentStatus = await Equipment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$prix" }
        }
      }
    ]);

    // Get warranty status statistics with value
    const warrantyStatus = await Equipment.aggregate([
      {
        $group: {
          _id: "$warranty_status",
          count: { $sum: 1 },
          totalValue: { $sum: "$prix" }
        }
      }
    ]);

    // Get maintenance status with value
    const maintenanceStatus = await Equipment.aggregate([
      {
        $match: {
          status: "maintenance"
        }
      },
      {
        $group: {
          _id: "maintenance",
          count: { $sum: 1 },
          totalValue: { $sum: "$prix" }
        }
      }
    ]);

    // Get equipment age distribution
    const equipmentAge = await Equipment.aggregate([
      {
        $project: {
          age: {
            $divide: [
              { $subtract: [new Date(), "$purchase_date"] },
              1000 * 60 * 60 * 24 * 365 // Convert to years
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ["$age", 1] }, then: "Less than 1 year" },
                { case: { $lt: ["$age", 3] }, then: "1-3 years" },
                { case: { $lt: ["$age", 5] }, then: "3-5 years" }
              ],
              default: "More than 5 years"
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get active tickets with priority
    const activeTickets = await Ticket.aggregate([
      {
        $match: {
          status: { $in: ['open', 'in-progress'] }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get pending deliveries with value
    const pendingDeliveries = await DeliveryOrder.aggregate([
      {
        $match: {
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalValue: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Get recently added equipment with more details
    const recentEquipment = await Equipment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('department', 'name')
      .populate('categorie', 'name')
      .populate('model', 'name')
      .lean();

    // Combine all statistics
    const combinedStats = {
      ...equipmentStatus.reduce((acc, curr) => ({ 
        ...acc, 
        [curr._id]: { count: curr.count, totalValue: curr.totalValue }
      }), {}),
      ...warrantyStatus.reduce((acc, curr) => ({ 
        ...acc, 
        [`warranty_${curr._id}`]: { count: curr.count, totalValue: curr.totalValue }
      }), {}),
      ...maintenanceStatus.reduce((acc, curr) => ({ 
        ...acc, 
        [curr._id]: { count: curr.count, totalValue: curr.totalValue }
      }), {})
    };

    res.status(200).json({
      totalUsers,
      equipmentStats,
      equipmentByDepartment,
      activeTickets: activeTickets.reduce((acc, curr) => acc + curr.count, 0),
      pendingDeliveries: pendingDeliveries[0]?.count || 0,
      pendingDeliveriesValue: pendingDeliveries[0]?.totalValue || 0,
      equipmentStatus: combinedStats,
      equipmentAge,
      recentEquipment: recentEquipment.map(equip => ({
        name: equip.name,
        category: equip.categorie?.name || 'Non catégorisé',
        department: equip.department?.name || 'Non assigné',
        model: equip.model?.name || 'Non spécifié',
        serialNumber: equip.serial_number,
        status: equip.status,
        warrantyStatus: equip.warranty_status,
        addedAt: equip.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Error fetching dashboard statistics' });
  }
};

// Get recent activities
exports.getActivities = async (req, res) => {
  try {
    // Get recent tickets
    const recentTickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('created_by', 'username')
      .lean();

    // Get recent delivery orders
    const recentDeliveries = await DeliveryOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Combine and format activities
    const activities = [
      ...recentTickets.map(ticket => ({
        title: `Nouveau ticket créé par ${ticket.created_by?.username || 'Utilisateur'}`,
        time: new Date(ticket.createdAt).toLocaleString('fr-FR'),
        type: 'ticket'
      })),
      ...recentDeliveries.map(delivery => ({
        title: `Nouvelle commande de livraison pour ${delivery.customerName}`,
        time: new Date(delivery.createdAt).toLocaleString('fr-FR'),
        type: 'delivery'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 10); // Get only the 10 most recent activities

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Error fetching recent activities' });
  }
}; 