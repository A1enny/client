import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Auth/ProtectedRoute"; 
import Dashboard from "./Components/Dashboard/Dashboard";
import Login from "./Components/Login/Login";
import Tables from "./Components/Table/Table";
import Recipe from "./Components/Recipe/Recipe";
import Product from "./Components/Product/Product";
import Inventory from "./Components/Inventory/Inventory";
import ProfileSettings from "./Components/ProfileSettings/ProfileSettings";
import Report from "./Components/Report/Report";
import ManageUsers from "./Components/Mmu/Mmu";
import StartTable from "./Components/Table/StartTable/Starttable";
import TableDetails from "./Components/Table/TableDetails/TableDetails";
import Addinventory from "./Components/Inventory/Addinventory/Addinventory";
import EditIngredient from "./Components/Inventory/EditIngredient/EditIngredient";
import Addrecipe from "./Components/Recipe/AddRecipe/Addrecipe";
import OrderPage from "./Components/pages/Orderpage/Orderpage";
import EditTable from "./Components/Table/EditTable/EditTable";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login />} />

        {/* Routes accessible by all roles */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product" element={<Product />} />
        <Route path="/profilesettings" element={<ProfileSettings />} />
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/addrecipe" element={<Addrecipe />} />

        {/* Protected Routes for Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/ManageUsers" element={<ManageUsers />} />
          <Route path="/addrecipe/:id" element={<Addrecipe />} />
        </Route>

        {/* Protected Routes for Admin and Staff */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/addinventory" element={<Addinventory />} />
          <Route path="/edit-ingredient/:id" element={<EditIngredient />} />
          <Route path="/report" element={<Report />} />
          <Route path="/table" element={<Tables />} />
          <Route path="/edit-table/:id" element={<EditTable />} />
          <Route path="/table-details/:table_id" element={<TableDetails />} />
          <Route path="/start-table/:tableId" element={<StartTable />} />
        </Route>

        <Route path="/order/:table_id" element={<OrderPage />} />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
