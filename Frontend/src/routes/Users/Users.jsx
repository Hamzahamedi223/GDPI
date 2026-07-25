import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Edit2,
    Trash2,
    X,
    AlertCircle,
    UserPlus,
    Shield,
    Building,
    KeyRound,
    FileDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { exportTableToPDF } from "@/utils/exportPdf";

const User = () => {
    const emptyUserForm = {
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        role: "",
        department: "",
    };

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [newUser, setNewUser] = useState(emptyUserForm);
    const [updatedUser, setUpdatedUser] = useState({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        role: "",
        department: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [addFormErrors, setAddFormErrors] = useState({});
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [changingPassword, setChangingPassword] = useState(false);

    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, rolesRes, deptRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/Users", { headers: authHeader() }),
                    axios.get("http://localhost:5000/api/Roles"),
                    axios.get("http://localhost:5000/api/departments"),
                ]);
                
                setUsers(usersRes.data);
                setRoles(rolesRes.data);
                setDepartments(deptRes.data.departments);
            } catch (err) {
                setError("Erreur lors du chargement des données");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/Users/${selectedUser._id}`, {
                headers: authHeader(),
            });
            setUsers(users.filter(user => user._id !== selectedUser._id));
            setShowDeleteModal(false);
            toast.success("Utilisateur supprimé avec succès");
        } catch (err) {
            setError("Erreur lors de la suppression de l'utilisateur");
            toast.error(err.response?.data?.message || "Erreur lors de la suppression de l'utilisateur");
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!updatedUser.username.trim()) errors.username = "Nom d'utilisateur requis";
        if (!updatedUser.firstname.trim()) errors.firstname = "Prénom requis";
        if (!updatedUser.lastname.trim()) errors.lastname = "Nom requis";
        if (!updatedUser.email.trim()) errors.email = "Email requis";
        else if (!/^\S+@\S+\.\S+$/.test(updatedUser.email)) errors.email = "Email invalide";
        if (!updatedUser.role) errors.role = "Rôle requis";
        if (!updatedUser.department) errors.department = "Service requis";
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateAddForm = () => {
        const errors = {};
        if (!newUser.username.trim()) errors.username = "Nom d'utilisateur requis";
        else if (newUser.username.trim().length < 3) errors.username = "Minimum 3 caracteres";
        if (!newUser.firstname.trim()) errors.firstname = "Prenom requis";
        if (!newUser.lastname.trim()) errors.lastname = "Nom requis";
        if (!newUser.email.trim()) errors.email = "Email requis";
        else if (!/^\S+@\S+\.\S+$/.test(newUser.email)) errors.email = "Email invalide";
        if (!newUser.password.trim()) errors.password = "Mot de passe requis";
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(newUser.password)) {
            errors.password = "8 caracteres avec majuscule, minuscule, chiffre et symbole";
        }
        if (!newUser.role) errors.role = "Role requis";
        if (!newUser.department) errors.department = "Service requis";

        setAddFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetAddForm = () => {
        setNewUser(emptyUserForm);
        setAddFormErrors({});
    };

    const handleCreate = async () => {
        if (!validateAddForm()) return;

        try {
            const response = await axios.post(
                "http://localhost:5000/api/Users",
                {
                    ...newUser,
                    username: newUser.username.trim(),
                    firstname: newUser.firstname.trim(),
                    lastname: newUser.lastname.trim(),
                    email: newUser.email.trim(),
                },
                { headers: authHeader() }
            );

            const createdRole = roles.find(role => role._id === newUser.role);
            const createdDept = departments.find(dept => dept._id === newUser.department);

            setUsers([
                {
                    ...response.data,
                    role: createdRole || response.data.role,
                    department: createdDept || response.data.department,
                },
                ...users,
            ]);
            setShowAddModal(false);
            resetAddForm();
            toast.success("Utilisateur ajoute avec succes");
        } catch (err) {
            setError("Erreur lors de la creation de l'utilisateur");
            toast.error(err.response?.data?.message || err.response?.data?.error || "Erreur lors de la creation de l'utilisateur");
        }
    };

    const handleUpdate = async () => {
        if (!validateForm()) return;
        
        try {
            const response = await axios.put(
                `http://localhost:5000/api/Users/${selectedUser._id}`,
                updatedUser,
                { headers: authHeader() }
            );

            const updatedRole = roles.find(role => role._id === updatedUser.role);
            const updatedDept = departments.find(dept => dept._id === updatedUser.department);

            setUsers(users.map(user =>
                user._id === selectedUser._id ? { 
                    ...user,
                    ...updatedUser,
                    role: updatedRole,
                    department: updatedDept
                } : user
            ));
            
            setShowUpdateModal(false);
            setFormErrors({});
            toast.success("Utilisateur mis à jour avec succès");
        } catch (err) {
            setError("Erreur lors de la mise à jour de l'utilisateur");
            toast.error(err.response?.data?.message || "Erreur lors de la mise à jour de l'utilisateur");
        }
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setPasswordForm({ newPassword: "", confirmPassword: "" });
        setPasswordErrors({});
        setShowPasswordModal(true);
    };

    const validatePasswordForm = () => {
        const errors = {};
        if (!passwordForm.newPassword) {
            errors.newPassword = "Mot de passe requis";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(passwordForm.newPassword)) {
            errors.newPassword = "8 caracteres avec majuscule, minuscule, chiffre et symbole";
        }
        if (passwordForm.confirmPassword !== passwordForm.newPassword) {
            errors.confirmPassword = "Les mots de passe ne correspondent pas";
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        setChangingPassword(true);
        try {
            await axios.put(
                `http://localhost:5000/api/Users/${selectedUser._id}/password`,
                { newPassword: passwordForm.newPassword },
                { headers: authHeader() }
            );
            setShowPasswordModal(false);
            setPasswordForm({ newPassword: "", confirmPassword: "" });
            toast.success("Mot de passe mis à jour avec succès");
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de la mise à jour du mot de passe");
        } finally {
            setChangingPassword(false);
        }
    };

    const openUpdateModal = (user) => {
        setSelectedUser(user);
        setUpdatedUser({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role._id,
            department: user.department._id,
        });
        setShowUpdateModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExportPDF = () => {
        exportTableToPDF({
            title: "Liste des Utilisateurs",
            filename: "utilisateurs",
            columns: ["Utilisateur", "Email", "Rôle", "Service"],
            rows: filteredUsers.map(user => [
                `${user.firstname || ''} ${user.lastname || ''} (${user.username || ''})`,
                user.email,
                user.role?.name || '',
                user.department?.name || '',
            ]),
        });
    };

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-70px)] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="pt-[70px] p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Gérez les utilisateurs, leurs rôles et leurs Services
                </p>
            </div>

            <div className="mb-6 flex items-center gap-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-x-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <UserPlus size={18} />
                        <span>Ajouter utilisateur</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                    >
                        <Shield size={18} />
                        <span>Rôles</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                    >
                        <Building size={18} />
                        <span>Service</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportPDF}
                        className="flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                    >
                        <FileDown size={18} />
                        <span>Exporter PDF</span>
                    </motion.button>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Utilisateur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Rôle
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden">
                                                {user.profilePicture ? (
                                                    <img
                                                        src={`http://localhost:5000${user.profilePicture}`}
                                                        alt={`${user.firstname} ${user.lastname}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                                                        <span className="text-sm font-medium text-white">
                                                            {(user.firstname || '').charAt(0)}{(user.lastname || '').charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.firstname || ''} {user.lastname || ''}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.username || ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                            {user.role?.name}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold leading-5 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {user.department?.name}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-x-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => openUpdateModal(user)}
                                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-300"
                                            >
                                                <Edit2 size={18} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => openPasswordModal(user)}
                                                title="Changer le mot de passe"
                                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-300"
                                            >
                                                <KeyRound size={18} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 size={18} />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
                        >
                            <div className="flex items-center gap-x-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Supprimer l'utilisateur
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowDeleteModal(false)}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                >
                                    Annuler
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDelete}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Supprimer
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Ajouter un utilisateur
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetAddForm();
                                    }}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-300"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                            <div className="mt-6 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nom d'utilisateur
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={newUser.username}
                                        onChange={handleCreateInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            addFormErrors.username && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {addFormErrors.username && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {addFormErrors.username}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Prenom
                                    </label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        value={newUser.firstname}
                                        onChange={handleCreateInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            addFormErrors.firstname && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {addFormErrors.firstname && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {addFormErrors.firstname}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        value={newUser.lastname}
                                        onChange={handleCreateInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            addFormErrors.lastname && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {addFormErrors.lastname && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {addFormErrors.lastname}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newUser.email}
                                        onChange={handleCreateInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            addFormErrors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {addFormErrors.email && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {addFormErrors.email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={newUser.password}
                                        onChange={handleCreateInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            addFormErrors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {addFormErrors.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {addFormErrors.password}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Role
                                    </label>
                                    <select
                                        name="role"
                                        value={newUser.role}
                                        onChange={handleCreateInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            addFormErrors.role && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    >
                                        <option value="">Selectionner un role</option>
                                        {roles.map((role) => (
                                            <option key={role._id} value={role._id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    {addFormErrors.role && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {addFormErrors.role}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Service
                                    </label>
                                    <select
                                        name="department"
                                        value={newUser.department}
                                        onChange={handleCreateInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            addFormErrors.department && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    >
                                        <option value="">Selectionner un Service</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    {addFormErrors.department && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {addFormErrors.department}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetAddForm();
                                    }}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                >
                                    Annuler
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreate}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Ajouter
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showUpdateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Modifier l'utilisateur
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowUpdateModal(false)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-300"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nom d'utilisateur
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={updatedUser.username}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            formErrors.username && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {formErrors.username && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {formErrors.username}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        value={updatedUser.firstname}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            formErrors.firstname && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {formErrors.firstname && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {formErrors.firstname}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        value={updatedUser.lastname}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            formErrors.lastname && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {formErrors.lastname && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {formErrors.lastname}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={updatedUser.email}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            formErrors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {formErrors.email && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {formErrors.email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Rôle
                                    </label>
                                    <select
                                        name="role"
                                        value={updatedUser.role}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            formErrors.role && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    >
                                        <option value="">Sélectionner un rôle</option>
                                        {roles.map((role) => (
                                            <option key={role._id} value={role._id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.role && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {formErrors.role}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Service
                                    </label>
                                    <select
                                        name="department"
                                        value={updatedUser.department}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            formErrors.department && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    >
                                        <option value="">Sélectionner un Service</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.department && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {formErrors.department}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowUpdateModal(false)}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                >
                                    Annuler
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleUpdate}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Enregistrer
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Changer le mot de passe{selectedUser ? ` — ${selectedUser.username}` : ""}
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowPasswordModal(false)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-300"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nouveau mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            passwordErrors.newPassword && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {passwordErrors.newPassword && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {passwordErrors.newPassword}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Confirmer le mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordInputChange}
                                        className={cn(
                                            "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white",
                                            passwordErrors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        )}
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {passwordErrors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowPasswordModal(false)}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                                >
                                    Annuler
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleChangePassword}
                                    disabled={changingPassword}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {changingPassword ? "Enregistrement..." : "Enregistrer"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default User;
