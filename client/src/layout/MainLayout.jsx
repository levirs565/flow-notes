import React, { useState } from "react";
import { useSearchQuery } from "../pages/utils";
import { TopBar } from "../components/TopBar";
import { Outlet } from "react-router-dom";
import { useLoggedUser } from "../api";

export function MainLayout() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, onSearchQueryChange] = useSearchQuery();
  const { user, logout } = useLoggedUser();

  return (
    <React.Fragment>
      <TopBar
        showSearch={showSearch}
        searchQuery={searchQuery}
        onSearchChange={onSearchQueryChange}
        userName={user?.name}
        onLogout={logout}
      />
      <Outlet
        context={{
          showSearch,
          setShowSearch,
        }}
      />
    </React.Fragment>
  );
}
