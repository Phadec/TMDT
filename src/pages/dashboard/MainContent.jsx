import OverviewTab from './OverviewTab';
import AddProductForm from './AddProductTab';
import ManageProductsTab from './ManageProductsTab';
import CustomersTab from './CustomersTab';
import MessagesTab from './MessagesTab';
import SettingsTab from './SettingsTab';
import HelpTab from './HelpTab';

// Main Content Component
const MainContent = ({ activeTab, tabs }) => {
  return (
    <div className="flex-1 overflow-auto w-full">
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6">
          {tabs.find((tab) => tab.id === activeTab)?.label || "Dashboard"}
        </h1>

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "add-product" && <AddProductForm />}
        {activeTab === "manage-products" && <ManageProductsTab />}
        {activeTab === "customers" && <CustomersTab />}
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "help" && <HelpTab />}
      </div>
    </div>
  );
};

export default MainContent;