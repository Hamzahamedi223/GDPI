const Equipment = require('../models/Equipment');
const Department = require('../models/Department');
const Panne = require('../models/Panne');
const InternalRepair = require('../models/InternalRepair');

const chatController = {
  // Handle equipment-related queries
  async handleEquipmentQuery(query) {
    try {
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes("moins") && lowerQuery.includes("équipements")) {
        const departments = await Department.aggregate([
          {
            $lookup: {
              from: 'equipment',
              localField: '_id',
              foreignField: 'department',
              as: 'equipment'
            }
          },
          {
            $project: {
              name: 1,
              equipmentCount: { $size: '$equipment' }
            }
          },
          { $sort: { equipmentCount: 1 } },
          { $limit: 1 }
        ]);
        return `Le département avec le moins d'équipements est ${departments[0].name} avec ${departments[0].equipmentCount} équipements.`;
      }

      if (lowerQuery.includes("plus") && lowerQuery.includes("équipements")) {
        const departments = await Department.aggregate([
          {
            $lookup: {
              from: 'equipment',
              localField: '_id',
              foreignField: 'department',
              as: 'equipment'
            }
          },
          {
            $project: {
              name: 1,
              equipmentCount: { $size: '$equipment' }
            }
          },
          { $sort: { equipmentCount: -1 } },
          { $limit: 1 }
        ]);
        return `Le département avec le plus d'équipements est ${departments[0].name} avec ${departments[0].equipmentCount} équipements.`;
      }

      if (lowerQuery.includes("combien") && lowerQuery.includes("équipements")) {
        const departments = await Department.aggregate([
          {
            $lookup: {
              from: 'equipment',
              localField: '_id',
              foreignField: 'department',
              as: 'equipment'
            }
          },
          {
            $project: {
              name: 1,
              equipmentCount: { $size: '$equipment' }
            }
          }
        ]);
        return `Nombre d'équipements par département :\n${departments.map(dept => 
          `• ${dept.name}: ${dept.equipmentCount} équipements`
        ).join('\n')}`;
      }

      if (lowerQuery.includes("état") || lowerQuery.includes("condition")) {
        const equipmentStatus = await Equipment.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        return `État des équipements :\n${equipmentStatus.map(status => 
          `• ${status._id}: ${status.count} équipements`
        ).join('\n')}`;
      }

      if (lowerQuery.includes("maintenance") || lowerQuery.includes("réparation")) {
        const maintenanceNeeded = await Equipment.find({
          status: { $in: ['down', 'maintenance'] }
        }).populate('department');
        return `Équipements nécessitant une maintenance :\n${maintenanceNeeded.map(eq => 
          `• ${eq.name} (${eq.department.name}) - ${eq.status}`
        ).join('\n')}`;
      }

      if (lowerQuery.includes("plus récents") || lowerQuery.includes("nouveaux")) {
        const recentEquipment = await Equipment.find()
          .sort({ purchase_date: -1 })
          .limit(5)
          .populate('department')
          .populate('categorie')
          .populate('model');
        return `Les équipements les plus récents :\n${recentEquipment.map(eq => 
          `• ${eq.name} (${eq.department.name}) - ${eq.categorie.name} ${eq.model.name} - Acheté le ${new Date(eq.purchase_date).toLocaleDateString()} - ${eq.prix}€`
        ).join('\n')}`;
      }

      if (lowerQuery.includes("fin de vie") || lowerQuery.includes("obsolète")) {
        const endOfLifeEquipment = await Equipment.find({
          warranty_status: 'expired'
        }).populate('department');
        return `Équipements en fin de garantie :\n${endOfLifeEquipment.map(eq => 
          `• ${eq.name} (${eq.department.name}) - ${eq.serial_number}`
        ).join('\n')}`;
      }

      return "Je ne comprends pas cette question sur les équipements. Pouvez-vous la reformuler ?";
    } catch (error) {
      console.error('Error handling equipment query:', error);
      return "Désolé, une erreur est survenue lors du traitement de votre demande.";
    }
  },

  // Handle maintenance-related queries
  async handleMaintenanceQuery(query) {
    try {
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes("actuellement") || lowerQuery.includes("en cours")) {
        const currentMaintenance = await InternalRepair.find({
          status: 'En cours'
        }).populate('equipment');
        return `Maintenances en cours :\n${currentMaintenance.map(m => 
          `• ${m.equipment.name} - ${m.description}`
        ).join('\n')}`;
      }

      if (lowerQuery.includes("préventives") || lowerQuery.includes("à venir")) {
        const preventiveMaintenance = await InternalRepair.find({
          type: 'Préventive',
          status: 'Planifiée'
        }).populate('equipment');
        return `Maintenances préventives à venir :\n${preventiveMaintenance.map(m => 
          `• ${m.equipment.name} - ${new Date(m.scheduledDate).toLocaleDateString()}`
        ).join('\n')}`;
      }

      if (lowerQuery.includes("coût") || lowerQuery.includes("prix")) {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        const maintenanceCosts = await InternalRepair.aggregate([
          {
            $match: {
              startDate: { $gte: currentMonth }
            }
          },
          {
            $group: {
              _id: null,
              totalCost: { $sum: '$cost' }
            }
          }
        ]);
        return `Le coût total des maintenances ce mois-ci est de ${maintenanceCosts[0]?.totalCost || 0}€.`;
      }

      if (lowerQuery.includes("urgente") || lowerQuery.includes("prioritaire")) {
        const urgentMaintenance = await InternalRepair.find({
          priority: 'Haute'
        }).populate('equipment');
        return `Maintenances urgentes :\n${urgentMaintenance.map(m => 
          `• ${m.equipment.name} - ${m.description}`
        ).join('\n')}`;
      }

      return "Je ne comprends pas cette question sur la maintenance. Pouvez-vous la reformuler ?";
    } catch (error) {
      console.error('Error handling maintenance query:', error);
      return "Désolé, une erreur est survenue lors du traitement de votre demande.";
    }
  },

  // Handle department-related queries
  async handleDepartmentQuery(query) {
    try {
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes("actifs") || lowerQuery.includes("occupés")) {
        const activeDepartments = await Department.aggregate([
          {
            $lookup: {
              from: 'pannes',
              localField: '_id',
              foreignField: 'department',
              as: 'pannes'
            }
          },
          {
            $project: {
              name: 1,
              panneCount: { $size: '$pannes' }
            }
          },
          { $sort: { panneCount: -1 } },
          { $limit: 3 }
        ]);
        return `Les départements les plus actifs :\n${activeDepartments.map(dept => 
          `• ${dept.name}: ${dept.panneCount} pannes`
        ).join('\n')}`;
      }

      if (lowerQuery.includes("répartition") || lowerQuery.includes("distribution")) {
        const departments = await Department.aggregate([
          {
            $lookup: {
              from: 'equipment',
              localField: '_id',
              foreignField: 'department',
              as: 'equipment'
            }
          },
          {
            $project: {
              name: 1,
              equipmentCount: { $size: '$equipment' }
            }
          }
        ]);
        return `Répartition des équipements par département :\n${departments.map(dept => 
          `• ${dept.name}: ${dept.equipmentCount} équipements`
        ).join('\n')}`;
      }

      return "Je ne comprends pas cette question sur les départements. Pouvez-vous la reformuler ?";
    } catch (error) {
      console.error('Error handling department query:', error);
      return "Désolé, une erreur est survenue lors du traitement de votre demande.";
    }
  },

  // Handle incident-related queries
  async handleIncidentQuery(query) {
    try {
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes("récents") || lowerQuery.includes("derniers")) {
        const recentIncidents = await Panne.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('department')
          .populate('type');
        return `Incidents récents :\n${recentIncidents.map(inc => 
          `• ${inc.description} (${inc.department.name}) - ${inc.type.name} - ${new Date(inc.createdAt).toLocaleDateString()}`
        ).join('\n')}`;
      }

      if (lowerQuery.includes("taux") || lowerQuery.includes("résolution")) {
        const resolutionRate = await Panne.aggregate([
          {
            $lookup: {
              from: 'pannetypes',
              localField: 'type',
              foreignField: '_id',
              as: 'typeInfo'
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        const total = resolutionRate.reduce((acc, curr) => acc + curr.count, 0);
        const resolved = resolutionRate.find(r => r._id === 'Résolu')?.count || 0;
        const rate = ((resolved / total) * 100).toFixed(1);
        return `Le taux de résolution des incidents est de ${rate}%.`;
      }

      if (lowerQuery.includes("fréquents") || lowerQuery.includes("types")) {
        const incidentTypes = await Panne.aggregate([
          {
            $lookup: {
              from: 'pannetypes',
              localField: 'type',
              foreignField: '_id',
              as: 'typeInfo'
            }
          },
          {
            $unwind: '$typeInfo'
          },
          {
            $group: {
              _id: '$typeInfo.name',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]);
        return `Types d'incidents les plus fréquents :\n${incidentTypes.map(type => 
          `• ${type._id}: ${type.count} incidents`
        ).join('\n')}`;
      }

      return "Je ne comprends pas cette question sur les incidents. Pouvez-vous la reformuler ?";
    } catch (error) {
      console.error('Error handling incident query:', error);
      return "Désolé, une erreur est survenue lors du traitement de votre demande.";
    }
  },

  // Main query handler
  async handleQuery(req, res) {
    try {
      const { query } = req.body;
      const lowerQuery = query.toLowerCase();
      let response = '';

      if (lowerQuery.includes('équipement') || lowerQuery.includes('matériel')) {
        response = await chatController.handleEquipmentQuery(query);
      } else if (lowerQuery.includes('maintenance') || lowerQuery.includes('réparation')) {
        response = await chatController.handleMaintenanceQuery(query);
      } else if (lowerQuery.includes('département') || lowerQuery.includes('service')) {
        response = await chatController.handleDepartmentQuery(query);
      } else if (lowerQuery.includes('incident') || lowerQuery.includes('panne')) {
        response = await chatController.handleIncidentQuery(query);
      } else {
        response = "Je ne comprends pas votre question. Pouvez-vous la reformuler ou choisir une question parmi les suggestions ?";
      }

      res.json({ response });
    } catch (error) {
      console.error('Error handling query:', error);
      res.status(500).json({ 
        error: "Une erreur est survenue lors du traitement de votre demande." 
      });
    }
  }
};

module.exports = chatController; 