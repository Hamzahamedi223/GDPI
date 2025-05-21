import {
    ChartColumn,
    Home,
    NotepadText,
    Package,
    PackagePlus,
    Settings,
    Users,
    Shield,
    Tag,
    Building,
    Wrench,
    FileText,
    Truck,
    LogOut,
    FileSignature,
    ClipboardList,
    ShoppingCart,
    Receipt,
    UserPlus,
    ArrowRightToLine,
    Cog,
    ClipboardCheck,
    ClipboardX,
    FileCheck,
    FileX,
    FileSearch,
    FileBarChart,
    FileSpreadsheet,
    FileWarning,
    FileQuestion,
    FileCog,
    RefreshCw,
    History,
    LifeBuoy,
    UserCog,
    Bell,
    Boxes,
    ClipboardEdit,
    ClipboardPen,
    FileText as FileTextIcon,
    FileEdit,
    FileSpreadsheet as FileSpreadsheetIcon,
    FileBarChart as FileBarChartIcon,
    MessageCircle
  } from "lucide-react";
  
  import ProfileImage from "@/assets/profile-image.jpg";
  import ProductImage from "@/assets/product-image.jpg";

  // Function to get current user data
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user_data")) || {};
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  };

  // Function to get navigation links based on current user data
  export const getNavbarLinks = () => {
    const user = getCurrentUser();
    const isAdmin = user?.role?.name === "admin";
    const isChefService = user?.role?.name === "chef service";
    const userDepartment = user?.department?.name;
  
    // Common links for all users
    const commonLinks = [
      ...(isAdmin ? [
        {
          title: "Tableau de Bord",
          links: [
            {
              label: "Tableau de Bord",
              icon: Home,
              path: "/dashboard/dashboard",
            },
            {
              label: "Analytique",
              icon: ChartColumn,
              path: "/dashboard/analytics",
            },
          ],
        },
      ] : []),
      ...(isAdmin ? [
        {
          title: "Support",
          links: [
            {
              label: "Chat Support",
              icon: MessageCircle,
              path: "/dashboard/support-chat",
            },
          ],
        },
      ] : []),
    ];

    // Department-specific links for chef service
    const departmentLinks = isChefService ? [
      {
          title: "Gestion des Demandes",
          links: [
              {
                  label: "Réclamations",
                  icon: FileQuestion,
                  path: `/department/${userDepartment}/reclamations`,
              },
              {
                  label: "Besoins",
                  icon: Package,
                  path: `/department/${userDepartment}/besoins`,
              },
          ],
      },
      {
          title: "Gestion des Équipements",
          links: [
              {
                  label: "Équipements du Service",
                  icon: Package,
                  path: `/department/${userDepartment}/equipment`,
              },
          ],
      },
    ] : [];

    // Admin-only links
    const adminLinks = isAdmin ? [
      {
          title: "Gestion des Demandes",
          links: [
              {
                  label: "Réclamations",
                  icon: FileQuestion,
                  path: "/dashboard/reclamations",
              },
              {
                  label: "Besoins",
                  icon: Package,
                  path: "/dashboard/besoins",
              },
          ],
      },
      {
          title: "Gestion des Utilisateurs",
          links: [
              {
                  label: "Utilisateurs",
                  icon: Users,
                  path: "/dashboard/users",
              },
              {
                  label: "Rôles",
                  icon: Shield,  
                  path: "/dashboard/roles",
              },
          ],
      },
      {
          title: "Gestion des Équipements",
          links: [
          
              {
                  label: "Nouveau Equipment",
                  icon: PackagePlus,
                  path: "/dashboard/new-product",
              }, 
              {
                  label: "Catégories",
                  icon: Tag, 
                  path: "/dashboard/categorie",
              },
              {
                  label: "Modèles",
                  icon: Tag,  
                  path: "/dashboard/model",
              },
              {
                  label: "Pièces de Rechange",
                  icon: Wrench, 
                  path: "/dashboard/piece_de_rechange",
              },
          ],
      },
      {
          title: "Gestion des Services",
          links: [
              {
                  label: "Services",
                  icon: Building,  
                  path: "/dashboard/department",
              },
              {
                  label: "Pannes (À faire)",
                  icon: FileWarning,
                  path: "/dashboard/pannes",
              },
              {
                  label: "Réparations",
                  icon: Wrench, 
                  path: "/dashboard/internal-repair",
              },
              {
                  label: "Réformes (À faire)",
                  icon: RefreshCw,
                  path: "/dashboard/reformes",
              },
          ],
      },
      {
          title: "Gestion des Achats",
          links: [
              {
                  label: "Bons de Commande",
                  icon: ShoppingCart, 
                  path: "/dashboard/purchase-order",
              },
              {
                  label: "Fournisseurs",
                  icon: Truck, 
                  path: "/dashboard/fournisseur",
              },
              {
                  label: "Devis(À faire)",
                  icon: FileSignature,  
                  path: "/dashboard/devis",
              },
          ],
      },
      {
          title: "Gestion des Livraisons",
          links: [
              {
                  label: "Bons de Livraison",
                  icon: Truck, 
                  path: "/dashboard/delivery-orders",
              },
              {
                  label: "Détails Bons de Livraison (À faire)",
                  icon: FileEdit,
                  path: "/dashboard/delivery-order-details",
              },
              {
                  label: "Fiches de Sortie",
                  icon: ArrowRightToLine, 
                  path: "/dashboard/exit-forms",
              },
          ],
      },
    //   {
    //       title: "Gestion Financière",
    //       links: [
    //           {
    //               label: "Factures",
    //               icon: Receipt,  
    //               path: "/dashboard/facture",
    //           },
    //           {
    //               label: "Détails Factures",
    //               icon: FileSpreadsheetIcon,
    //               path: "/dashboard/invoice-details",
    //           },
    //       ],
    //   },
    //   {
    //       title: "Consultation",
    //       links: [
    //           {
    //               label: "Inventaire de Service",
    //               icon: Boxes,
    //               path: "/dashboard/service-inventory",
    //           },
    //           {
    //               label: "Historique d'Affectation",
    //               icon: History,
    //               path: "/dashboard/assignment-history",
    //           },
    //           {
    //               label: "Fiche de Vie Équipement",
    //               icon: LifeBuoy,
    //               path: "/dashboard/equipment-life",
    //           },
    //       ],
    //   },
    //   {
    //       title: "Paramètres",
    //       links: [
    //           {
    //               label: "Paramètres",
    //               icon: Settings,
    //               path: "/dashboard/settings",
    //           },
    //           {
    //               label: "Notifications",
    //               icon: Bell,
    //               path: "/dashboard/notifications",
    //           },
    //           {
    //               label: "Paramètres Application",
    //               icon: FileCog,
    //               path: "/dashboard/app-settings",
    //           },
    //       ],
    //   },
    ] : [];

    // Combine all links
    const allLinks = [
    ...commonLinks,
      ...(isChefService ? departmentLinks : []),
      ...(isAdmin ? adminLinks : []),
    ];

    return allLinks;
  };

  // Export the function instead of static data
  export const navbarLinks = getNavbarLinks();