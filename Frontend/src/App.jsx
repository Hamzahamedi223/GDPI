import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import ProtectedRoute from "./contexts/ProtectedRoute";
import Layout from "@/routes/layout";
import DashboardPage from "./routes/dashboard/page";
import Users from "./routes/Users/Users";
import Equipments from "./routes/Equipments/Equipments";
import Login from "./routes/Auth/Login/Login";
import Signup from "./routes/Auth/Signup/Signup";
import VerifyEmail from "./routes/Auth/VerifyEmail/VerifyEmail";
import Forget from "./routes/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./routes/Auth/ResetPassword/ResetPassword";
import Department from "./routes/Department/Department";
import Roles from "./routes/Roles/Roles";
import Piece from "./routes/Piecercg/Piece";
import Facture from "./routes/Facture/Facture";
import Fournisseur from "./routes/Fournisseurs/fournisseur";
import Model from "./routes/Model/Model";
import Categorie from "./routes/Categorie/Categorie";
import Settings from "./routes/Settings/Settings";
import Landing from "./landing/Landing";
import InternalRepair from "./routes/InternalRepair/InternalRepair";
import PurchaseOrder from "./routes/PurchaseOrder/PurchaseOrder";
import ExitForm from "./routes/ExitForm/ExitForm";
import Pannes from "./routes/Pannes/Pannes";
import Reclamations from "./routes/Reclamations/Reclamations";
import DepartmentReclamations from "./routes/DepartmentReclamations/DepartmentReclamations";
import AddReclamation from "./routes/DepartmentReclamations/AddReclamation";
import Besoins from "./routes/Besoins/Besoins";
import DeliveryOrders from "./routes/DeliveryOrders/DeliveryOrders";
import DeliveryOrderDetails from "./routes/DeliveryOrderDetails/DeliveryOrderDetails";
import InvoiceDetails from "./routes/InvoiceDetails/InvoiceDetails";
import ServiceInventory from "./routes/ServiceInventory/ServiceInventory";
import AssignmentHistory from "./routes/AssignmentHistory/AssignmentHistory";
import EquipmentLife from "./routes/EquipmentLife/EquipmentLife";
import AppSettings from "./routes/AppSettings/AppSettings";
import Notifications from "./routes/Notifications/Notifications";
import Profile from "./routes/Profile/Profile";
import AnalyticsPage from "./routes/analytics/page";
import SupportChat from "./routes/SupportChat/SupportChat";
import { Toaster } from "react-hot-toast";
import DepartmentRequests from "./routes/DepartmentReclamations/DepartmentRequests";
import AddBesoin from "./routes/DepartmentReclamations/AddBesoin";
import DepartmentBesoins from "./routes/DepartmentReclamations/DepartmentBesoins";
import DepartmentEquipment from "./routes/DepartmentReclamations/DepartmentEquipment";
import DepartmentUsers from "./routes/DepartmentReclamations/DepartmentUsers";

function App() {
  return (
    <ThemeProvider storageKey="theme">
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/auth/forget" element={<Forget />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Landing />} />

          {/* Protected Routes - Accessible to all authenticated users */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard/dashboard" element={<DashboardPage/>}></Route>
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            <Route path="/dashboard/support-chat" element={<SupportChat />} />
          </Route>

          {/* Department-specific Routes */}
          <Route element={<ProtectedRoute departmentOnly><Layout /></ProtectedRoute>}>
            <Route path="/department/:department/requests" element={<DepartmentRequests />} />
            <Route path="/department/:department/reclamations" element={<DepartmentReclamations />} />
            <Route path="/department/:department/reclamations/add" element={<AddReclamation />} />
            <Route path="/department/:department/besoins" element={<DepartmentBesoins />} />
            <Route path="/department/:department/besoins/add" element={<AddBesoin />} />
            <Route path="/department/:department/equipment" element={<DepartmentEquipment />} />
            <Route path="/department/:department/users" element={<DepartmentUsers />} />
          </Route>

          {/* Admin-only Routes */}
          <Route element={<ProtectedRoute adminOnly><Layout /></ProtectedRoute>}>
            <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
            <Route path="/dashboard/users" element={<Users />} />
            <Route path="/dashboard/roles" element={<Roles />} />
            <Route path="/dashboard/new-product" element={<Equipments />} />
            <Route path="/dashboard/categorie" element={<Categorie />} />
            <Route path="/dashboard/model" element={<Model />} />
            <Route path="/dashboard/department" element={<Department />} />
            <Route path="/dashboard/piece_de_rechange" element={<Piece />} />
            <Route path="/dashboard/internal-repair" element={<InternalRepair />} />
            <Route path="/dashboard/purchase-order" element={<PurchaseOrder />} />
            <Route path="/dashboard/delivery-orders" element={<DeliveryOrders />} />
            <Route path="/dashboard/delivery-order-details" element={<DeliveryOrderDetails />} />
            <Route path="/dashboard/facture" element={<Facture />} />
            <Route path="/dashboard/invoice-details" element={<InvoiceDetails />} />
            <Route path="/dashboard/fournisseur" element={<Fournisseur />} />
            <Route path="/dashboard/exit-forms" element={<ExitForm />} />
            <Route path="/dashboard/pannes" element={<Pannes />} />
            <Route path="/dashboard/reclamations" element={<Reclamations />} />
            <Route path="/dashboard/besoins" element={<Besoins />} />
            <Route path="/dashboard/service-inventory" element={<ServiceInventory />} />
            <Route path="/dashboard/assignment-history" element={<AssignmentHistory />} />
            <Route path="/dashboard/equipment-life" element={<EquipmentLife />} />
            <Route path="/dashboard/app-settings" element={<AppSettings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
