const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const Department = require('../models/Department');

// Helper function to analyze department equipment
async function analyzeDepartmentEquipment() {
  const departments = await Department.find();
  const departmentStats = await Promise.all(
    departments.map(async (dept) => {
      const equipmentCount = await Equipment.countDocuments({ department: dept._id });
      return {
        name: dept.name,
        count: equipmentCount
      };
    })
  );
  return departmentStats;
}

// Handle chat queries
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    const lowerQuery = query.toLowerCase();

    // Department equipment analysis
    if (lowerQuery.includes('moins') && lowerQuery.includes('équipements')) {
      const stats = await analyzeDepartmentEquipment();
      const lowestDept = stats.reduce((min, curr) => 
        curr.count < min.count ? curr : min
      );
      return res.json({
        response: `Le département avec le moins d'équipements est ${lowestDept.name} avec ${lowestDept.count} équipements.`
      });
    }

    // Department equipment count
    if (lowerQuery.includes('combien') && lowerQuery.includes('équipements')) {
      const stats = await analyzeDepartmentEquipment();
      const response = stats.map(dept => 
        `${dept.name}: ${dept.count} équipements`
      ).join('\n');
      return res.json({
        response: `Voici le nombre d'équipements par département :\n${response}`
      });
    }

    // Equipment status
    if (lowerQuery.includes('état') || lowerQuery.includes('condition')) {
      const equipment = await Equipment.find();
      const statusCount = equipment.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});
      
      const response = Object.entries(statusCount)
        .map(([status, count]) => `${status}: ${count} équipements`)
        .join('\n');
      
      return res.json({
        response: `Voici l'état des équipements :\n${response}`
      });
    }

    // Department with most equipment
    if (lowerQuery.includes('plus') && lowerQuery.includes('équipements')) {
      const stats = await analyzeDepartmentEquipment();
      const highestDept = stats.reduce((max, curr) => 
        curr.count > max.count ? curr : max
      );
      return res.json({
        response: `Le département avec le plus d'équipements est ${highestDept.name} avec ${highestDept.count} équipements.`
      });
    }

    // Equipment needing maintenance
    if (lowerQuery.includes('maintenance')) {
      const equipment = await Equipment.find({ status: 'Maintenance requise' });
      if (equipment.length === 0) {
        return res.json({
          response: "Aucun équipement ne nécessite de maintenance actuellement."
        });
      }
      const response = equipment.map(item => 
        `${item.name} (${item.department.name})`
      ).join('\n');
      return res.json({
        response: `Voici les équipements nécessitant une maintenance :\n${response}`
      });
    }

    // Default response for unrecognized queries
    return res.json({
      response: "Je peux vous aider avec les informations suivantes :\n" +
        "• Nombre d'équipements par département\n" +
        "• État des équipements\n" +
        "• Départements avec le plus/moins d'équipements\n" +
        "• Équipements nécessitant une maintenance\n\n" +
        "Veuillez reformuler votre question."
    });

  } catch (error) {
    console.error('Error processing chat query:', error);
    res.status(500).json({ error: 'Erreur lors du traitement de votre demande' });
  }
});

module.exports = router; 